export type UserRole = 'doctor' | 'nurse';
export type TriageLevel = 'critical' | 'moderate' | 'mild';
export type VisitStatus = 'active' | 'discharged';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Patient {
  id: string; // UUID
  name: string;
  dob: string;
  phone: string;
  qr_code_hash: string;
  created_at: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  status: VisitStatus;
  created_at: string;
  patient?: Patient;
  latest_vitals?: Vitals;
}

export interface Symptoms {
  chest_pain: boolean;
  shortness_of_breath: boolean;
  altered_consciousness: boolean;
  severe_bleeding: boolean;
  high_fever: boolean;
  nausea_vomiting: boolean;
}

export interface Vitals {
  id: string;
  visit_id: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  pulse: number;
  temperature: number; // Celsius
  spo2: number; // percentage
  symptoms: Symptoms;
  triage_level: TriageLevel;
  recorded_by: string; // user_id
  created_at: string;
}

export interface Document {
  id: string;
  patient_id: string;
  file_url: string;
  document_type: string;
  uploaded_at: string;
}

export interface TriageResult {
  level: TriageLevel;
  alerts: string[];
  reasoning: string[];
}