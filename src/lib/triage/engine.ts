import type { TriageLevel, TriageResult, Symptoms } from '@/types';

interface VitalsInput {
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  pulse: number;
  temperature: number;
  spo2: number;
  symptoms: Symptoms;
}

/**
 * محرك الـ Triage الذكي
 * يصنف المريض إلى 3 مستويات بناءً على العلامات الحيوية والأعراض
 *
 * Critical  — يحتاج تدخل فوري (أحمر)
 * Moderate  — يحتاج متابعة سريعة (برتقالي)
 * Mild      — حالة غير طارئة (أخضر)
 */
export function calculateTriage(vitals: VitalsInput): TriageResult {
  const alerts: string[] = [];
  const reasoning: string[] = [];
  let criticalScore = 0;
  let moderateScore = 0;

  // ─── 1. الأكسجين SpO2 ───────────────────────────────────
  if (vitals.spo2 < 90) {
    criticalScore += 3;
    reasoning.push(`SpO2 critically low: ${vitals.spo2}%`);
  } else if (vitals.spo2 < 94) {
    moderateScore += 2;
    reasoning.push(`SpO2 low: ${vitals.spo2}%`);
  }

  // ─── 2. ضغط الدم ────────────────────────────────────────
  if (vitals.blood_pressure_systolic > 180 || vitals.blood_pressure_systolic < 80) {
    criticalScore += 3;
    reasoning.push(`Blood pressure critical: ${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic} mmHg`);
  } else if (vitals.blood_pressure_systolic > 160 || vitals.blood_pressure_systolic < 90) {
    moderateScore += 2;
    reasoning.push(`Blood pressure abnormal: ${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic} mmHg`);
  }

  // ─── 3. النبض ────────────────────────────────────────────
  if (vitals.pulse > 150 || vitals.pulse < 40) {
    criticalScore += 3;
    reasoning.push(`Pulse critical: ${vitals.pulse} bpm`);
  } else if (vitals.pulse > 100 || vitals.pulse < 60) {
    moderateScore += 1;
    reasoning.push(`Pulse abnormal: ${vitals.pulse} bpm`);
  }

  // ─── 4. الحرارة ──────────────────────────────────────────
  if (vitals.temperature >= 40 || vitals.temperature < 35) {
    criticalScore += 2;
    reasoning.push(`Temperature critical: ${vitals.temperature}°C`);
  } else if (vitals.temperature >= 38.5 || vitals.temperature < 36) {
    moderateScore += 1;
    reasoning.push(`Temperature abnormal: ${vitals.temperature}°C`);
  }

  // ─── 5. الأعراض ──────────────────────────────────────────
  if (vitals.symptoms.chest_pain) {
    criticalScore += 3;
    reasoning.push('Chest pain reported');
  }

  if (vitals.symptoms.altered_consciousness) {
    criticalScore += 3;
    reasoning.push('Altered consciousness reported');
  }

  if (vitals.symptoms.severe_bleeding) {
    criticalScore += 3;
    reasoning.push('Severe bleeding reported');
  }

  if (vitals.symptoms.shortness_of_breath) {
    moderateScore += 2;
    reasoning.push('Shortness of breath reported');
  }

  if (vitals.symptoms.high_fever) {
    moderateScore += 1;
    reasoning.push('High fever reported');
  }

  if (vitals.symptoms.nausea_vomiting) {
    moderateScore += 1;
    reasoning.push('Nausea/vomiting reported');
  }

  // ─── 6. تنبيهات خاصة ─────────────────────────────────────
  if (vitals.symptoms.chest_pain && vitals.pulse > 100) {
    alerts.push('🚨 HEART ATTACK ALERT — Chest pain with tachycardia!');
  }

  if (vitals.spo2 < 90 && vitals.symptoms.shortness_of_breath) {
    alerts.push('🚨 RESPIRATORY FAILURE ALERT — Low SpO2 with dyspnea!');
  }

  if (vitals.blood_pressure_systolic > 180 && vitals.symptoms.altered_consciousness) {
    alerts.push('🚨 HYPERTENSIVE CRISIS ALERT — High BP with altered consciousness!');
  }

  if (vitals.blood_pressure_systolic < 80 && vitals.pulse > 120) {
    alerts.push('🚨 SHOCK ALERT — Low BP with high pulse!');
  }

  // ─── 7. التصنيف النهائي ───────────────────────────────────
  let level: TriageLevel;

  if (criticalScore >= 3) {
    level = 'critical';
  } else if (criticalScore >= 1 || moderateScore >= 3) {
    level = 'moderate';
  } else {
    level = 'mild';
  }

  return { level, alerts, reasoning };
}