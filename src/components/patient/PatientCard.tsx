'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import SeverityBadge from '@/components/triage/SeverityBadge';
import { User, Phone, Clock } from 'lucide-react';
import type { TriageLevel } from '@/types';

interface PatientCardProps {
  id: string;
  name: string;
  phone: string;
  dob: string;
  visitId: string;
  triageLevel: TriageLevel;
  recordedAt: string;
  alerts: string[];
}

const borderConfig = {
  critical: 'border-l-4 border-l-red-500 hover:bg-red-50',
  moderate: 'border-l-4 border-l-orange-500 hover:bg-orange-50',
  mild: 'border-l-4 border-l-green-500 hover:bg-green-50',
};

export default function PatientCard({
  id,
  name,
  phone,
  dob,
  triageLevel,
  recordedAt,
  alerts,
}: PatientCardProps) {
  const timeAgo = (dateStr: string) => {
    const diff = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 60000
    );
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <Link href={`/patient/${id}`}>
      <Card
        className={`
          cursor-pointer transition-all duration-200
          border border-slate-200 shadow-sm
          ${borderConfig[triageLevel]}
          ${triageLevel === 'critical' ? 'animate-pulse-subtle' : ''}
        `}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">

            {/* معلومات المريض */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full shrink-0
                ${triageLevel === 'critical' ? 'bg-red-100' : ''}
                ${triageLevel === 'moderate' ? 'bg-orange-100' : ''}
                ${triageLevel === 'mild' ? 'bg-green-100' : ''}
              `}>
                <User className={`
                  w-5 h-5
                  ${triageLevel === 'critical' ? 'text-red-600' : ''}
                  ${triageLevel === 'moderate' ? 'text-orange-600' : ''}
                  ${triageLevel === 'mild' ? 'text-green-600' : ''}
                `} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Phone className="w-3 h-3" />
                    {phone}
                  </span>
                  <span className="text-xs text-slate-400">
                    DOB: {dob}
                  </span>
                </div>
              </div>
            </div>

            {/* الجانب الأيمن */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <SeverityBadge level={triageLevel} size="sm" />
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {timeAgo(recordedAt)}
              </span>
            </div>

          </div>

          {/* تنبيهات الطوارئ */}
          {alerts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-red-200">
              {alerts.map((alert, i) => (
                <p key={i} className="text-xs font-semibold text-red-600">
                  {alert}
                </p>
              ))}
            </div>
          )}

        </CardContent>
      </Card>
    </Link>
  );
}