'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import StatsCard from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface Stats {
  totalActive: number;
  totalDischarged: number;
  critical: number;
  moderate: number;
  mild: number;
}

export default function StatsSummary() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats>({
    totalActive: 0,
    totalDischarged: 0,
    critical: 0,
    moderate: 0,
    mild: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // جلب الـ visits النشطة
      const { data: activeVisits } = await supabase
        .from('visits')
        .select('id')
        .eq('status', 'active');

      // جلب الـ visits المصرّحة
      const { data: dischargedVisits } = await supabase
        .from('visits')
        .select('id')
        .eq('status', 'discharged');

      // جلب العلامات الحيوية للحالات النشطة
      const { data: vitalsData } = await supabase
        .from('vitals')
        .select('triage_level, visit_id')
        .in(
          'visit_id',
          (activeVisits ?? []).map((v) => v.id)
        );

      // حساب التوزيع
      const latestVitalsMap = new Map<string, string>();
      vitalsData?.forEach((v) => {
        if (!latestVitalsMap.has(v.visit_id)) {
          latestVitalsMap.set(v.visit_id, v.triage_level);
        }
      });

      const levels = Array.from(latestVitalsMap.values());
      const critical = levels.filter((l) => l === 'critical').length;
      const moderate = levels.filter((l) => l === 'moderate').length;
      const mild = levels.filter((l) => l === 'mild').length;

      setStats({
        totalActive: activeVisits?.length ?? 0,
        totalDischarged: dischargedVisits?.length ?? 0,
        critical,
        moderate,
        mild,
      });
    };

    fetchStats();
  }, []);

  const total = stats.totalActive + stats.totalDischarged;
  const recoveryRate = total > 0
    ? Math.round((stats.totalDischarged / total) * 100)
    : 0;

  return (
    <div className="space-y-4">

      {/* Recovery Rate */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Treatment Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Recovery Rate */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Recovery Rate
              </p>
              <p className="text-xs text-slate-400">
                {stats.totalDischarged} discharged / {total} total
              </p>
            </div>
            <span className="text-3xl font-bold text-blue-600">
              {recoveryRate}%
            </span>
          </div>

          {/* Active vs Discharged */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-200 dark:border-slate-700">
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {stats.totalActive}
              </p>
              <p className="text-xs text-slate-500">Active Patients</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-200 dark:border-slate-700">
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {stats.totalDischarged}
              </p>
              <p className="text-xs text-slate-500">Discharged</p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Triage Distribution */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Triage Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatsCard
            title="Critical"
            value={stats.critical}
            total={stats.totalActive}
            color="red"
            icon="🔴"
          />
          <StatsCard
            title="Moderate"
            value={stats.moderate}
            total={stats.totalActive}
            color="orange"
            icon="🟠"
          />
          <StatsCard
            title="Mild"
            value={stats.mild}
            total={stats.totalActive}
            color="green"
            icon="🟢"
          />
        </CardContent>
      </Card>

    </div>
  );
}