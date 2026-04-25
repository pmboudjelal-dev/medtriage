'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateTriage } from '@/lib/triage/engine';
import { revalidatePath } from 'next/cache';
import type { Symptoms } from '@/types';

export async function addVitals(formData: {
  visit_id: string;
  patient_id: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  pulse: number;
  temperature: number;
  spo2: number;
  symptoms: Symptoms;
}) {
  const supabase = await createClient();

  // التحقق من المستخدم
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // حساب مستوى الـ Triage تلقائياً
  const triageResult = calculateTriage({
    blood_pressure_systolic: formData.blood_pressure_systolic,
    blood_pressure_diastolic: formData.blood_pressure_diastolic,
    pulse: formData.pulse,
    temperature: formData.temperature,
    spo2: formData.spo2,
    symptoms: formData.symptoms,
  });

  // حفظ العلامات الحيوية
  const { data, error } = await supabase
    .from('vitals')
    .insert({
      visit_id: formData.visit_id,
      blood_pressure_systolic: formData.blood_pressure_systolic,
      blood_pressure_diastolic: formData.blood_pressure_diastolic,
      pulse: formData.pulse,
      temperature: formData.temperature,
      spo2: formData.spo2,
      symptoms: formData.symptoms,
      triage_level: triageResult.level,
      recorded_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/patient/${formData.patient_id}`);
  revalidatePath('/dashboard');

  return {
    success: true,
    triage: triageResult,
    vitals: data,
  };
}

export async function getVitalsByVisit(visitId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vitals')
    .select('*')
    .eq('visit_id', visitId)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data };
}