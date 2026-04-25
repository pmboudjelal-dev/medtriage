'use client';

import { useState } from 'react';
import { addVitals } from '@/actions/vitals.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SeverityBadge from '@/components/triage/SeverityBadge';
import AlertBanner from '@/components/triage/AlertBanner';
import { toast } from 'sonner';
import { Loader2, Activity } from 'lucide-react';
import type { TriageLevel } from '@/types';

interface VitalsFormProps {
  visitId: string;
  patientId: string;
  onSuccess?: () => void;
}

export default function VitalsForm({
  visitId,
  patientId,
  onSuccess,
}: VitalsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // العلامات الحيوية
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [temperature, setTemperature] = useState('');
  const [spo2, setSpo2] = useState('');

  // الأعراض
  const [chestPain, setChestPain] = useState(false);
  const [shortnessOfBreath, setShortnessOfBreath] = useState(false);
  const [alteredConsciousness, setAlteredConsciousness] = useState(false);
  const [severeBleeding, setSevereBleeding] = useState(false);
  const [highFever, setHighFever] = useState(false);
  const [nauseaVomiting, setNauseaVomiting] = useState(false);

  // نتيجة الـ Triage
  const [triageResult, setTriageResult] = useState<{
    level: TriageLevel;
    alerts: string[];
    reasoning: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await addVitals({
      visit_id: visitId,
      patient_id: patientId,
      blood_pressure_systolic: Number(systolic),
      blood_pressure_diastolic: Number(diastolic),
      pulse: Number(pulse),
      temperature: Number(temperature),
      spo2: Number(spo2),
      symptoms: {
        chest_pain: chestPain,
        shortness_of_breath: shortnessOfBreath,
        altered_consciousness: alteredConsciousness,
        severe_bleeding: severeBleeding,
        high_fever: highFever,
        nausea_vomiting: nauseaVomiting,
      },
    });

    if (result.error) {
      toast.error(`Failed to save vitals: ${result.error}`);
      setIsLoading(false);
      return;
    }

    setTriageResult(result.triage!);
    toast.success('Vitals recorded successfully!');
    setIsLoading(false);
    onSuccess?.();
  };

  return (
    <div className="space-y-4">

      {/* نتيجة الـ Triage بعد الحفظ */}
      {triageResult && (
        <div className="space-y-3">
          <AlertBanner alerts={triageResult.alerts} />
          <Card className="border-slate-200">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  Triage Result:
                </span>
                <SeverityBadge level={triageResult.level} size="lg" />
              </div>
              <div className="space-y-1">
                {triageResult.reasoning.map((r, i) => (
                  <p key={i} className="text-sm text-slate-500">
                    • {r}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* نموذج العلامات الحيوية */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Record Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ضغط الدم */}
            <div className="space-y-1.5">
              <Label>Blood Pressure (mmHg)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Systolic"
                  required
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="h-11"
                  min={50}
                  max={250}
                />
                <span className="text-slate-400 font-bold">/</span>
                <Input
                  type="number"
                  placeholder="Diastolic"
                  required
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="h-11"
                  min={30}
                  max={150}
                />
              </div>
            </div>

            {/* النبض */}
            <div className="space-y-1.5">
              <Label htmlFor="pulse">Pulse (bpm)</Label>
              <Input
                id="pulse"
                type="number"
                placeholder="e.g. 72"
                required
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="h-11"
                min={20}
                max={300}
              />
            </div>

            {/* الحرارة */}
            <div className="space-y-1.5">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                placeholder="e.g. 37.2"
                required
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="h-11"
                step="0.1"
                min={30}
                max={45}
              />
            </div>

            {/* الأكسجين */}
            <div className="space-y-1.5">
              <Label htmlFor="spo2">Oxygen Saturation SpO2 (%)</Label>
              <Input
                id="spo2"
                type="number"
                placeholder="e.g. 98"
                required
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="h-11"
                min={50}
                max={100}
              />
            </div>

            {/* الأعراض */}
            <div className="space-y-2">
              <Label>Symptoms</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '💔 Chest Pain', value: chestPain, setter: setChestPain },
                  { label: '😮‍💨 Shortness of Breath', value: shortnessOfBreath, setter: setShortnessOfBreath },
                  { label: '🧠 Altered Consciousness', value: alteredConsciousness, setter: setAlteredConsciousness },
                  { label: '🩸 Severe Bleeding', value: severeBleeding, setter: setSevereBleeding },
                  { label: '🌡️ High Fever', value: highFever, setter: setHighFever },
                  { label: '🤢 Nausea/Vomiting', value: nauseaVomiting, setter: setNauseaVomiting },
                ].map(({ label, value, setter }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setter(!value)}
                    className={`
                      p-3 rounded-lg border-2 text-sm font-medium
                      transition-all duration-150 text-left
                      ${value
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* زر الحفظ */}
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Record & Analyze
                </>
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}