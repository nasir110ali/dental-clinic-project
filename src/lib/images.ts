// Central registry of high-resolution dental imagery for Aura Dental Studio
// Generated via AI studio and verified for high fidelity and healthcare realism.

import heroDentalClinic from '../assets/images/hero_dental_clinic_1791317490077.jpg';
import dentistConsultation from '../assets/images/dentist_patient_consultation_1791317502444.jpg';
import dentalTreatmentRoom from '../assets/images/dental_care_treatment_room_1791317514085.jpg';
import clinicReception from '../assets/images/dental_clinic_reception_1791317524855.jpg';

export const CLINIC_IMAGES = {
  hero: heroDentalClinic,
  consultation: dentistConsultation,
  treatmentRoom: dentalTreatmentRoom,
  reception: clinicReception,
};

export function getServiceImage(serviceName: string): string {
  const lower = (serviceName || '').toLowerCase();
  if (lower.includes('checkup') || lower.includes('consultation')) {
    return CLINIC_IMAGES.consultation;
  }
  if (lower.includes('filling') || lower.includes('emergency')) {
    return CLINIC_IMAGES.treatmentRoom;
  }
  if (lower.includes('whitening') || lower.includes('cleaning')) {
    return CLINIC_IMAGES.hero;
  }
  return CLINIC_IMAGES.treatmentRoom;
}
