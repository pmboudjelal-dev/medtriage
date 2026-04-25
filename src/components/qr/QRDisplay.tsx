'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';

interface QRDisplayProps {
  patientId: string;
  patientName: string;
}

export default function QRDisplay({ patientId, patientName }: QRDisplayProps) {
  const qrValue = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/patient/${patientId}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const svg = document.getElementById('patient-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `patient-${patientName}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-700">
          🪪 Patient QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">

        {/* QR Code */}
        <div className="p-4 bg-white border-2 border-slate-200 rounded-xl print:border-black">
         <QRCodeCanvas
  id="patient-qr-code"
  value={qrValue}
  size={200}
  level="H"
  includeMargin={true}
/>
        </div>

        {/* Patient Info */}
        <div className="text-center">
          <p className="font-semibold text-slate-800">{patientName}</p>
          <p className="text-xs text-slate-400 font-mono mt-1">
            ID: {patientId.slice(0, 8)}...
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}