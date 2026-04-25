'use client';

import { useEffect, useState } from 'react';

interface AlertBannerProps {
  alerts: string[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  const [visible, setVisible] = useState(true);

  // وميض التنبيه كل ثانية
  useEffect(() => {
    if (alerts.length === 0) return;
    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, 800);
    return () => clearInterval(interval);
  }, [alerts]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`
            w-full rounded-lg border-2 border-red-500 p-4
            flex items-center gap-3
            transition-all duration-200
            ${visible
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-800'
            }
          `}
        >
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold text-sm uppercase tracking-wide">
              Emergency Alert
            </p>
            <p className="font-semibold text-base">
              {alert.replace('🚨 ', '')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}