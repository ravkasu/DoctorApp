export type AppointmentStatus = 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';
export type AppointmentType = 'in-person' | 'video' | 'emergency' | 'follow-up' | 'lab-review';
export type TriageUrgency = 'routine' | 'moderate' | 'urgent' | 'emergency';

export interface Vitals {
  heartRate: number; // bpm
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  oxygenSaturation: number; // % SpO2
  temperature: number; // °F or °C
  respiratoryRate: number; // breaths/min
  bloodGlucose?: number; // mg/dL
  bmi?: number;
  weightKg?: number;
  heightCm?: number;
  measuredAt: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Radiology' | 'Cardiology' | 'Pathology';
  date: string;
  result: string;
  referenceRange: string;
  unit: string;
  status: 'normal' | 'borderline' | 'abnormal' | 'critical';
  doctorNotes?: string;
  fileUrl?: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string; // e.g. "500 mg"
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Inhaler' | 'Injection' | 'Ointment' | 'Drops';
  frequency: 'OD (Once daily)' | 'BD (Twice daily)' | 'TDS (Thrice daily)' | 'QID (4 times daily)' | 'PRN (As needed)';
  timing: 'Before meals' | 'After meals' | 'With meals' | 'Empty stomach' | 'At bedtime';
  durationDays: number;
  instructions: string; // e.g. "Take with full glass of water"
}

export interface Prescription {
  id: string;
  rxNumber: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorName: string;
  doctorRegNo: string;
  clinicName: string;
  date: string;
  diagnosis: string[];
  icdCodes: string[];
  vitalsSnapshot: Partial<Vitals>;
  medications: Medication[];
  orderedLabTests: string[];
  dietaryAdvice: string;
  clinicalNotes: string;
  followUpDate: string;
  digitalSignatureUrl?: string;
  qrVerificationCode: string;
}

export interface ClinicalNote {
  id: string;
  date: string;
  doctorName: string;
  subjective: string; // Patient symptoms & history
  objective: string;  // Vitals & examination findings
  assessment: string; // Clinical diagnosis
  plan: string;       // Treatment & Rx plan
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. MRN-89201
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  avatar: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: Array<{ allergen: string; severity: 'mild' | 'moderate' | 'severe' }>;
  chronicConditions: string[];
  vitalsHistory: Vitals[];
  currentVitals: Vitals;
  labReports: LabReport[];
  clinicalNotes: ClinicalNote[];
  insurance: {
    provider: string;
    policyNumber: string;
    validTill: string;
  };
  lastVisitDate: string;
  nextAppointmentDate?: string;
}

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientAvatar: string;
  patientBloodGroup: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:30 AM"
  type: AppointmentType;
  status: AppointmentStatus;
  urgency: TriageUrgency;
  chiefComplaint: string;
  symptoms: string[];
  notes?: string;
  consultationFee: number;
  isPaid: boolean;
  videoRoomId?: string;
  vitalAlert?: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  title: string; // e.g. "MD, FACC - Senior Consultant Cardiologist"
  specialty: string;
  registrationNumber: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  hospitalName: string;
  clinicAddress: string;
  phone: string;
  email: string;
  availabilityStatus: 'online' | 'in-consult' | 'break' | 'offline';
  consultationFees: {
    inClinic: number;
    telehealthVideo: number;
    emergency: number;
  };
  clinicSchedule: {
    days: string[];
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
  };
}

export interface TelehealthChatMessage {
  id: string;
  sender: 'doctor' | 'patient' | 'system';
  message: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: 'image' | 'pdf' | 'report';
    url: string;
  };
}
