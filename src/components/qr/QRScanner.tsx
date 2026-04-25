'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanLine, StopCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function QRScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const stopScanner = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScannedUrl = (text: string) => {
    stopScanner();
    try {
      const url = new URL(text);
      const patientId = url.pathname.split('/patient/')[1];
      if (patientId) {
        toast.success('Patient found! Redirecting…');
        router.push(`/patient/${patientId}`);
        return;
      }
    } catch {}
    if (text.length === 36) {
      toast.success('Patient found! Redirecting…');
      router.push(`/patient/${text}`);
    } else {
      toast.error('Invalid QR Code');
    }
  };

  const startScanner = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsScanning(true);
      setIsLoading(false);

      // استيراد مكتبة المسح ديناميكياً
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const codeReader = new BrowserQRCodeReader();

      const scanFrame = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        try {
          const result = await codeReader.decodeFromCanvas(canvas);
          if (result) {
            handleScannedUrl(result.getText());
            return;
          }
        } catch {}

        animationRef.current = requestAnimationFrame(scanFrame);
      };

      animationRef.current = requestAnimationFrame(scanFrame);
    } catch {
      toast.error('Could not access camera. Please allow camera permission.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  return (
    <Card className="border-slate-200 shadow-sm max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-blue-600" />
          Scan Patient QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="relative w-full rounded-xl overflow-hidden border-2 border-blue-300 bg-black min-h-[280px] flex items-center justify-center">
          <video
            ref={videoRef}
            className={`w-full ${isScanning ? 'block' : 'hidden'}`}
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
          {!isScanning && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <ScanLine className="w-12 h-12 text-slate-400" />
              <p className="text-slate-400 text-sm">Camera preview will appear here</p>
            </div>
          )}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-4 border-blue-400 rounded-xl opacity-70" />
            </div>
          )}
        </div>

        {!isScanning ? (
          <Button
            onClick={startScanner}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting camera…
              </>
            ) : (
              <>
                <ScanLine className="w-4 h-4" />
                Start Scanning
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={stopScanner}
            variant="destructive"
            className="w-full h-11 gap-2"
          >
            <StopCircle className="w-4 h-4" />
            Stop Scanner
          </Button>
        )}

        <p className="text-center text-xs text-slate-400">
          Point the camera at the patient's QR code to open their record instantly
        </p>

      </CardContent>
    </Card>
  );
}