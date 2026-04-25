'use client';

import dynamic from 'next/dynamic';
import { ScanLine } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// نستخدم dynamic import لأن html5-qrcode تحتاج المتصفح فقط
const QRScanner = dynamic(() => import('@/components/qr/QRScanner'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <ScanLine className="w-8 h-8 animate-pulse" />
        <p className="text-sm">Loading scanner…</p>
      </div>
    </div>
  ),
});

export default function ScanPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Scan QR Code
          </h1>
          <p className="text-sm text-slate-500">
            Scan a patient's QR code to open their record instantly
          </p>
        </div>
      </div>

      {/* Scanner */}
      <QRScanner />

      {/* تعليمات */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-700">
          📋 How to use
        </p>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>1. Press <strong>Start Scanning</strong></li>
          <li>2. Allow camera permission if asked</li>
          <li>3. Point camera at the patient's QR code</li>
          <li>4. You will be redirected automatically</li>
        </ul>
      </div>

    </div>
  );
}