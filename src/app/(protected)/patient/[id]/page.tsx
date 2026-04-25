'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import VitalsForm from '@/components/vitals/VitalsForm';
import SeverityBadge from '@/components/triage/SeverityBadge';
import AlertBanner from '@/components/triage/AlertBanner';
import QRDisplay from '@/components/qr/QRDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Calendar, Phone } from 'lucide-react';
import type { Patient, Vitals } from '@/types';

export default function PatientProfilePage() {
  const { id } = useParams();
  const supabase = createClient();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visitId, setVisitId] = useState<string | null>(null);
  const [latestVitals, setLatestVitals] = useState<Vitals | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const { data: patientData } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (patientData) setPatient(patientData);

    const { data: visitData } = await supabase
      .from('visits')
      .select('*')
      .eq('patient_id', id)
      .eq('status', 'active')
      .single();

    if (visitData) {
      setVisitId(visitData.id);

      const { data: vitalsData } = await supabase
        .from('vitals')
        .select('*')
        .eq('visit_id', visitData.id)
        .order('created_at', { ascending: false });

      if (vitalsData && vitalsData.length > 0) {
        setLatestVitals(vitalsData[0]);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">Patient not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
          <p className="text-sm text-slate-500">ID: {patient.id.slice(0, 8)}...</p>
        </div>
        {latestVitals && (
          <SeverityBadge level={latestVitals.triage_level} size="lg" />
        )}
      </div>

      {alerts.length > 0 && <AlertBanner alerts={alerts} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Date of Birth</p>
                <p className="font-medium text-slate-700">{patient.dob}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="font-medium text-slate-700">{patient.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <QRDisplay patientId={patient.id} patientName={patient.name} />

      </div>

      {latestVitals && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Latest Vitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">Blood Pressure</p>
                <p className="text-xl font-bold text-slate-800">
                  {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}
                </p>
                <p className="text-xs text-slate-400">mmHg</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">Pulse</p>
                <p className="text-xl font-bold text-slate-800">{latestVitals.pulse}</p>
                <p className="text-xs text-slate-400">bpm</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">Temperature</p>
                <p className="text-xl font-bold text-slate-800">{latestVitals.temperature}</p>
                <p className="text-xs text-slate-400">°C</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">SpO2</p>
                <p className="text-xl font-bold text-slate-800">{latestVitals.spo2}</p>
                <p className="text-xs text-slate-400">%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {visitId && (
        <VitalsForm
          visitId={visitId}
          patientId={patient.id}
          onSuccess={fetchData}
        />
      )}

    </div>
  );
}