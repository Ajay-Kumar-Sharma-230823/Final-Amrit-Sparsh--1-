// ─── Emergency SOS Data Types & Static Medical Profile ──────────────────────

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  whatsapp: string;
  notified?: boolean;
}

export interface MedicalProfile {
  patientName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  abhaId: string;
  phone: string;
  address: string;
  photo?: string;
  // Medical data
  allergies: string[];
  currentMedications: Medication[];
  diseases: Disease[];
  ongoingTreatments: Treatment[];
  doctors: AssignedDoctor[];
  reports: MedicalReport[];
  emergencyContacts: EmergencyContact[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  since: string;
}

export interface Disease {
  name: string;
  type: 'current' | 'past';
  since: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface Treatment {
  name: string;
  hospital: string;
  startDate: string;
  status: 'ongoing' | 'completed';
}

export interface AssignedDoctor {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
}

export interface MedicalReport {
  name: string;
  date: string;
  type: string;
  status: string;
}

export interface SOSEvent {
  id: string;
  timestamp: string;
  emergencyType: string;
  location: { lat: number; lng: number; address: string };
  hospitalAlerted: string;
  contactsNotified: string[];
  pdfGenerated: boolean;
  status: 'active' | 'resolved' | 'cancelled';
}

// ─── Static Medical Profile (replace with Firebase in production) ────────────
export const STATIC_MEDICAL_PROFILE: MedicalProfile = {
  patientName: 'Ajay Kumar Sharma',
  age: 28,
  gender: 'Male',
  bloodGroup: 'O+',
  abhaId: 'ABHA-2024-78XQ',
  phone: '+91 9876543210',
  address: 'Sector 4, Civil Lines, Indore, MP 452001',
  allergies: ['Penicillin', 'Sulfonamides', 'Latex'],
  currentMedications: [
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', since: 'Jan 2024' },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', since: 'Mar 2024' },
    { name: 'Ecosprin', dosage: '75mg', frequency: 'Once daily (morning)', since: 'Jan 2024' },
  ],
  diseases: [
    { name: 'Hypertension', type: 'current', since: 'Jan 2024', severity: 'moderate' },
    { name: 'Type 2 Diabetes (Pre-diabetic)', type: 'current', since: 'Mar 2024', severity: 'mild' },
    { name: 'Typhoid', type: 'past', since: 'Jun 2022', severity: 'moderate' },
    { name: 'COVID-19', type: 'past', since: 'Aug 2021', severity: 'mild' },
  ],
  ongoingTreatments: [
    { name: 'Hypertension Management', hospital: 'AIIMS Prayagraj', startDate: 'Jan 2024', status: 'ongoing' },
    { name: 'Diabetic Screening', hospital: 'City Diagnostic Centre', startDate: 'Mar 2024', status: 'ongoing' },
  ],
  doctors: [
    { name: 'Dr. Priya Verma', specialization: 'Cardiologist', hospital: 'AIIMS Prayagraj', phone: '+91 9876501111' },
    { name: 'Dr. Rajesh Gupta', specialization: 'General Physician', hospital: 'City Hospital', phone: '+91 9876502222' },
    { name: 'Dr. Meena Patel', specialization: 'Endocrinologist', hospital: 'Max Healthcare', phone: '+91 9876503333' },
  ],
  reports: [
    { name: 'ECG Report', date: '12 Apr 2024', type: 'Cardiology', status: 'Normal' },
    { name: 'HbA1c Test', date: '15 Mar 2024', type: 'Pathology', status: 'Borderline' },
    { name: 'Blood Pressure Log', date: '10 Apr 2024', type: 'Cardiology', status: 'Elevated' },
    { name: 'Lipid Profile', date: '01 Mar 2024', type: 'Pathology', status: 'Normal' },
  ],
  emergencyContacts: [
    { id: 'ec1', name: 'Ravi Sharma', relation: 'Father', phone: '7000819978', whatsapp: '7000819978' },
    { id: 'ec2', name: 'Sunita Sharma', relation: 'Mother', phone: '9876522222', whatsapp: '9876522222' },
    { id: 'ec3', name: 'Arjun Sharma', relation: 'Brother', phone: '9876533333', whatsapp: '9876533333' },
  ],
};

export const NEARBY_HOSPITALS = [
  { name: 'AIIMS Prayagraj', distance: '0.8 km', time: '3 min', beds: 12, emergency: true, phone: '0532-1234567', lat: 22.7216, lng: 75.8573 },
  { name: 'District Hospital Indore', distance: '1.5 km', time: '6 min', beds: 5, emergency: true, phone: '0731-2345678', lat: 22.7180, lng: 75.8650 },
  { name: 'Bombay Hospital', distance: '2.1 km', time: '8 min', beds: 3, emergency: true, phone: '0731-3456789', lat: 22.7250, lng: 75.8620 },
  { name: 'CARE Hospital', distance: '3.4 km', time: '12 min', beds: 8, emergency: false, phone: '0731-4567890', lat: 22.7300, lng: 75.8700 },
];
