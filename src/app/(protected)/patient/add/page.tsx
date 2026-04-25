'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPatient } from '@/actions/patient.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import QRDisplay from '@/components/qr/QRDisplay';
import { toast } from 'sonner';
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddPatientPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // بعد الحفظ نعرض الـ QR
  const [savedPatient, setSavedPatient] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await createPatient({ name, dob, phone });

    if (result.error) {
      toast.error(`Failed to register patient: ${result.error}`);
      setIsLoading(false);
      return;
    }

    toast.success('Patient registered successfully!');
    setSavedPatient({ id: result.patientId!, name });
    setIsLoading(false);
  };

  // بعد حفظ المريض نعرض الـ QR Code
  if (savedPatient) {
    return (
      <div className="max-w-lg mx-auto space-y-6">

        {/* Success Message */}
        <div className="flex flex-col items-center text-center gap-2 py-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Patient Registered!
          </h1>
          <p className="text-slate-500">
            Scan the QR code below to access this patient's record instantly.
          </p>
        </div>

        {/* QR Code */}
        <QRDisplay
          patientId={savedPatient.id}
          patientName={savedPatient.name}
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setName('');
              setDob('');
              setPhone('');
              setSavedPatient(null);
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Another
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>

      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-800">New Patient</h1>
          <p className="text-sm text-slate-500">
            Register a new patient and generate their QR identity card
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Patient Information</CardTitle>
          <CardDescription>
            Fill in the patient's basic demographics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Mohammed Al-Rashid"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-11"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. +213 555 123 456"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering…
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Patient
                </>
              )}
            </Button>

          </form>
        </CardContent>
      </Card>

    </div>
  );
}