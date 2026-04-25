'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPatient(formData: {
  name: string;
  dob: string;
  phone: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const patientId = crypto.randomUUID();

  const { error: patientError } = await supabase
    .from('patients')
    .insert({
      id: patientId,
      name: formData.name,
      dob: formData.dob,
      phone: formData.phone,
      qr_code_hash: patientId,
    });

  if (patientError) return { error: patientError.message };

  const { error: visitError } = await supabase
    .from('visits')
    .insert({
      patient_id: patientId,
      status: 'active',
    });

  if (visitError) return { error: visitError.message };

  revalidatePath('/dashboard');
  return { success: true, patientId };
}

export async function getPatient(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function dischargePatient(visitId: string, patientId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('visits')
    .update({
      status: 'discharged',
      discharged_at: new Date().toISOString(),
    })
    .eq('id', visitId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath(`/patient/${patientId}`);
  return { success: true };
}

export async function deletePatient(patientId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('patients')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq('id', patientId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/recycle-bin');
  return { success: true };
}

export async function restorePatient(patientId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('patients')
    .update({
      deleted_at: null,
      deleted_by: null,
    })
    .eq('id', patientId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/recycle-bin');
  return { success: true };
}

export async function permanentDeletePatient(patientId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId);

  if (error) return { error: error.message };

  revalidatePath('/recycle-bin');
  return { success: true };
}