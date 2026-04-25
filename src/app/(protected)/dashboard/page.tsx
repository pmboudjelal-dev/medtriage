'use client';

import StatsSummary from '@/components/dashboard/StatsSummary';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import PatientCard from '@/components/patient/PatientCard';
import AlertBanner from '@/components/triage/AlertBanner';
import { calculateTriage } from '@/lib/triage/engine';
import { Loader2, RefreshCw, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TriageLevel } from '@/types';

interface DashboardPatient {
  id: string;
  name: string;
  phone: string;
  dob: string;
  visitId: string;
  triageLevel: TriageLevel;
  recordedAt: string;
  alerts: string[];
}

const triageOrder: Record<TriageLevel, number> = {
  critical: 0,
  moderate: 1,
  mild: 2,
};

export default function DashboardPage() {
  const supabase = createClient();
  const [patients, setPatients] = useState<DashboardPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [globalAlerts, setGlobalAlerts] = useState<string[]>([]);

  const fetchPatients = useCallback(async () => {
    const { data: visits } = await supabase
      .from('visits')
      .select('id, patient_id, created_at, patients(id, name, phone, dob)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!visits) {
      setIsLoading(false);
      return;
    }

    const dashboardPatients: DashboardPatient[] = [];
    const allAlerts: string[] = [];

    for (const visit of visits) {
      const patient = visit.patients as any;
      if (!patient) continue;

      const { data: vitalsData } = await supabase
        .from('vitals')
        .select('*')
        .eq('visit_id', visit.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let triageLevel: TriageLevel = 'mild';
      let alerts: string[] = [];
      let recordedAt = visit.created_at;

      if (vitalsData) {
        const result = calculateTriage({
          blood_pressure_systolic: vitalsData.blood_pressure_systolic,
          blood_pressure_diastolic: vitalsData.blood_pressure_diastolic,
          pulse: vitalsData.pulse,
          temperature: vitalsData.temperature,
          spo2: vitalsData.spo2,
          symptoms: vitalsData.symptoms,
        });
        triageLevel = result.level;
        alerts = result.alerts;
        recordedAt = vitalsData.created_at;
        allAlerts.push(...result.alerts);
      }

      dashboardPatients.push({
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        dob: patient.dob,
        visitId: visit.id,
        triageLevel,
        recordedAt,
        alerts,
      });
    }

    dashboardPatients.sort(
      (a, b) => triageOrder[a.triageLevel] - triageOrder[b.triageLevel]
    );

    setPatients(dashboardPatients);
    setGlobalAlerts([...new Set(allAlerts)]);
    setLastUpdated(new Date());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();
    const interval = setInterval(fetchPatients, 30000);
    return () => clearInterval(interval);
  }, [fetchPatients]);

  const critical = patients.filter((p) => p.triageLevel === 'critical');
  const moderate = patients.filter((p) => p.triageLevel === 'moderate');
  const mild = patients.filter((p) => p.triageLevel === 'mild');

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPatients} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {globalAlerts.length > 0 && <AlertBanner alerts={globalAlerts} />}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{critical.length}</p>
          <p className="text-sm text-red-500 font-medium">Critical</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{moderate.length}</p>
          <p className="text-sm text-orange-500 font-medium">Moderate</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{mild.length}</p>
          <p className="text-sm text-green-500 font-medium">Mild</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Users className="w-12 h-12 text-slate-300" />
          <p className="text-slate-400 font-medium">No active patients</p>
          <p className="text-slate-400 text-sm">Register a new patient to get started</p>
        </div>
      ) : (
        <div className="space-y-6">

          {critical.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h2 className="font-semibold text-red-600">
                  Critical — {critical.length} patient(s)
                </h2>
              </div>
              {critical.map((p) => (
                <PatientCard key={p.id} {...p} />
              ))}
            </div>
          )}

          {moderate.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <h2 className="font-semibold text-orange-600">
                  Moderate — {moderate.length} patient(s)
                </h2>
              </div>
              {moderate.map((p) => (
                <PatientCard key={p.id} {...p} />
              ))}
            </div>
          )}

          {mild.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-green-500" />
                <h2 className="font-semibold text-green-600">
                  Mild — {mild.length} patient(s)
                </h2>
              </div>
              {mild.map((p) => (
                <PatientCard key={p.id} {...p} />
              ))}
            </div>
          )}

       </div>
      )}

      {/* إحصائيات */}
      <StatsSummary />

    </div>
  );
}