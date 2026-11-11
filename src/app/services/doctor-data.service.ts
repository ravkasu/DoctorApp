import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Appointment,
  AppointmentStatus,
  DoctorProfile,
  Patient,
  Prescription,
  TelehealthChatMessage,
  Vitals,
} from '../models/doctor-app.models';

const STORAGE_KEYS = {
  APPOINTMENTS: 'medpulse_appointments_v1',
  PATIENTS: 'medpulse_patients_v1',
  PRESCRIPTIONS: 'medpulse_prescriptions_v1',
  DOCTOR_PROFILE: 'medpulse_doctor_profile_v1',
  DARK_MODE: 'medpulse_dark_mode_v1',
};

@Injectable({
  providedIn: 'root',
})
export class DoctorDataService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$: Observable<Appointment[]> = this.appointmentsSubject.asObservable();

  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$: Observable<Patient[]> = this.patientsSubject.asObservable();

  private prescriptionsSubject = new BehaviorSubject<Prescription[]>([]);
  public prescriptions$: Observable<Prescription[]> = this.prescriptionsSubject.asObservable();

  private doctorProfileSubject = new BehaviorSubject<DoctorProfile>(this.getInitialDoctorProfile());
  public doctorProfile$: Observable<DoctorProfile> = this.doctorProfileSubject.asObservable();

  private telehealthMessagesSubject = new BehaviorSubject<TelehealthChatMessage[]>([]);
  public telehealthMessages$: Observable<TelehealthChatMessage[]> = this.telehealthMessagesSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  // --- INITIAL DATA SEEDING & LOCAL STORAGE ---

  private loadInitialData(): void {
    const savedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    const savedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    const savedPrescriptions = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    const savedProfile = localStorage.getItem(STORAGE_KEYS.DOCTOR_PROFILE);

    const patients: Patient[] = savedPatients ? JSON.parse(savedPatients) : this.getSeedPatients();
    const appointments: Appointment[] = savedAppointments ? JSON.parse(savedAppointments) : this.getSeedAppointments();
    const prescriptions: Prescription[] = savedPrescriptions ? JSON.parse(savedPrescriptions) : this.getSeedPrescriptions();
    const profile: DoctorProfile = savedProfile ? JSON.parse(savedProfile) : this.getInitialDoctorProfile();

    this.patientsSubject.next(patients);
    this.appointmentsSubject.next(appointments);
    this.prescriptionsSubject.next(prescriptions);
    this.doctorProfileSubject.next(profile);

    this.telehealthMessagesSubject.next(this.getSeedTelehealthMessages());

    this.syncStorage();
  }

  private syncStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(this.patientsSubject.value));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(this.appointmentsSubject.value));
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(this.prescriptionsSubject.value));
      localStorage.setItem(STORAGE_KEYS.DOCTOR_PROFILE, JSON.stringify(this.doctorProfileSubject.value));
    } catch (e) {
      console.warn('LocalStorage quota or access error', e);
    }
  }

  // --- DOCTOR PROFILE METHODS ---

  public updateDoctorStatus(status: 'online' | 'in-consult' | 'break' | 'offline'): void {
    const profile = { ...this.doctorProfileSubject.value, availabilityStatus: status };
    this.doctorProfileSubject.next(profile);
    this.syncStorage();
  }

  public updateDoctorProfile(profile: Partial<DoctorProfile>): void {
    const updated = { ...this.doctorProfileSubject.value, ...profile };
    this.doctorProfileSubject.next(updated);
    this.syncStorage();
  }

  // --- APPOINTMENT METHODS ---

  public getAppointments(): Appointment[] {
    return this.appointmentsSubject.value;
  }

  public getTodayAppointments(): Observable<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments$.pipe(
      map(apps => apps.filter(a => a.date === today || a.date === '2026-11-11'))
    );
  }

  public addAppointment(appointmentData: Omit<Appointment, 'id' | 'appointmentNumber'>): Appointment {
    const current = this.appointmentsSubject.value;
    const count = current.length + 1;
    const newAppointment: Appointment = {
      ...appointmentData,
      id: 'apt-' + Date.now(),
      appointmentNumber: 'APT-' + (1000 + count),
    };
    const updated = [newAppointment, ...current];
    this.appointmentsSubject.next(updated);
    this.syncStorage();
    return newAppointment;
  }

  public updateAppointmentStatus(id: string, status: AppointmentStatus): void {
    const current = this.appointmentsSubject.value;
    const updated = current.map(a => (a.id === id ? { ...a, status } : a));
    this.appointmentsSubject.next(updated);
    this.syncStorage();
  }

  public updateAppointment(appointment: Appointment): void {
    const current = this.appointmentsSubject.value;
    const updated = current.map(a => (a.id === appointment.id ? appointment : a));
    this.appointmentsSubject.next(updated);
    this.syncStorage();
  }

  public deleteAppointment(id: string): void {
    const current = this.appointmentsSubject.value;
    const updated = current.filter(a => a.id !== id);
    this.appointmentsSubject.next(updated);
    this.syncStorage();
  }

  // --- PATIENT METHODS ---

  public getPatients(): Patient[] {
    return this.patientsSubject.value;
  }

  public getPatientById(id: string): Patient | undefined {
    return this.patientsSubject.value.find(p => p.id === id);
  }

  public addPatient(patientData: Omit<Patient, 'id' | 'mrn'>): Patient {
    const current = this.patientsSubject.value;
    const newPatient: Patient = {
      ...patientData,
      id: 'pat-' + Date.now(),
      mrn: 'MRN-' + Math.floor(10000 + Math.random() * 90000),
    };
    const updated = [newPatient, ...current];
    this.patientsSubject.next(updated);
    this.syncStorage();
    return newPatient;
  }

  public updatePatient(patient: Patient): void {
    const current = this.patientsSubject.value;
    const updated = current.map(p => (p.id === patient.id ? patient : p));
    this.patientsSubject.next(updated);
    this.syncStorage();
  }

  public addPatientVitals(patientId: string, vitals: Vitals): void {
    const current = this.patientsSubject.value;
    const updated = current.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          currentVitals: vitals,
          vitalsHistory: [vitals, ...p.vitalsHistory],
        };
      }
      return p;
    });
    this.patientsSubject.next(updated);
    this.syncStorage();
  }

  // --- PRESCRIPTION METHODS ---

  public getPrescriptions(): Prescription[] {
    return this.prescriptionsSubject.value;
  }

  public getPrescriptionsByPatient(patientId: string): Observable<Prescription[]> {
    return this.prescriptions$.pipe(
      map(rxList => rxList.filter(rx => rx.patientId === patientId))
    );
  }

  public addPrescription(rxData: Omit<Prescription, 'id' | 'rxNumber' | 'qrVerificationCode'>): Prescription {
    const current = this.prescriptionsSubject.value;
    const count = current.length + 1;
    const newRx: Prescription = {
      ...rxData,
      id: 'rx-' + Date.now(),
      rxNumber: 'RX-2026-' + (4000 + count),
      qrVerificationCode: 'VERIFY-RX-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    };
    const updated = [newRx, ...current];
    this.prescriptionsSubject.next(updated);
    this.syncStorage();
    return newRx;
  }

  // --- TELEHEALTH CHAT METHODS ---

  public sendTelehealthMessage(message: string, sender: 'doctor' | 'patient' = 'doctor'): void {
    const current = this.telehealthMessagesSubject.value;
    const newMsg: TelehealthChatMessage = {
      id: 'msg-' + Date.now(),
      sender,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.telehealthMessagesSubject.next([...current, newMsg]);
  }

  public simulatePatientReply(replyText: string): void {
    setTimeout(() => {
      this.sendTelehealthMessage(replyText, 'patient');
    }, 1800);
  }

  // --- DASHBOARD ANALYTICS COMPUTATIONS ---

  public getDashboardMetrics(): Observable<{
    totalToday: number;
    completedToday: number;
    pendingToday: number;
    emergencyCount: number;
    telehealthCount: number;
    criticalAlertsCount: number;
    estimatedRevenue: number;
  }> {
    return this.appointments$.pipe(
      map(apps => {
        const today = new Date().toISOString().split('T')[0];
        const todayApps = apps.filter(a => a.date === today || a.date === '2026-11-11');
        const completed = todayApps.filter(a => a.status === 'completed').length;
        const pending = todayApps.filter(a => a.status === 'scheduled' || a.status === 'checked-in').length;
        const emergency = todayApps.filter(a => a.urgency === 'emergency' || a.type === 'emergency').length;
        const telehealth = todayApps.filter(a => a.type === 'video').length;
        const criticalAlerts = todayApps.filter(a => !!a.vitalAlert).length;
        const revenue = todayApps.reduce((acc, curr) => acc + (curr.consultationFee || 120), 0);

        return {
          totalToday: todayApps.length,
          completedToday: completed,
          pendingToday: pending,
          emergencyCount: emergency,
          telehealthCount: telehealth,
          criticalAlertsCount: criticalAlerts,
          estimatedRevenue: revenue,
        };
      })
    );
  }

  // --- SEED DATA DEFINITIONS ---

  private getInitialDoctorProfile(): DoctorProfile {
    return {
      id: 'doc-001',
      name: 'Dr. Alexander Vance',
      title: 'MD, FACC - Senior Consultant Cardiologist & Interventional Specialist',
      specialty: 'Cardiology & Internal Medicine',
      registrationNumber: 'MED-NY-849201',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      rating: 4.96,
      reviewCount: 384,
      experienceYears: 16,
      hospitalName: 'Metropolitan Heart & Vascular Institute',
      clinicAddress: 'Pavilion 4, Suite 402, 5th Avenue Medical Plaza, NY',
      phone: '+1 (555) 234-8900',
      email: 'dr.vance@metroheart.org',
      availabilityStatus: 'online',
      consultationFees: {
        inClinic: 150,
        telehealthVideo: 120,
        emergency: 250,
      },
      clinicSchedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '08:30 AM',
        endTime: '05:30 PM',
        slotDurationMinutes: 20,
      },
    };
  }

  private getSeedPatients(): Patient[] {
    return [
      {
        id: 'pat-101',
        mrn: 'MRN-78421',
        name: 'Eleanor Sterling',
        age: 58,
        gender: 'Female',
        dob: '1968-04-12',
        phone: '+1 (555) 349-8812',
        email: 'eleanor.sterling@email.com',
        address: '742 Evergreen Terrace, New York, NY',
        bloodGroup: 'O+',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        emergencyContact: {
          name: 'Robert Sterling',
          relationship: 'Spouse',
          phone: '+1 (555) 349-8813',
        },
        allergies: [
          { allergen: 'Penicillin', severity: 'severe' },
          { allergen: 'Latex', severity: 'moderate' },
        ],
        chronicConditions: ['Hypertension Stage 2', 'Hyperlipidemia', 'Mild Osteoarthritis'],
        currentVitals: {
          heartRate: 78,
          bloodPressureSystolic: 148,
          bloodPressureDiastolic: 92,
          oxygenSaturation: 97,
          temperature: 98.6,
          respiratoryRate: 16,
          bloodGlucose: 118,
          bmi: 26.4,
          weightKg: 68,
          heightCm: 161,
          measuredAt: '2026-11-11 08:45 AM',
        },
        vitalsHistory: [
          {
            heartRate: 78,
            bloodPressureSystolic: 148,
            bloodPressureDiastolic: 92,
            oxygenSaturation: 97,
            temperature: 98.6,
            respiratoryRate: 16,
            bloodGlucose: 118,
            measuredAt: '2026-11-11',
          },
          {
            heartRate: 84,
            bloodPressureSystolic: 154,
            bloodPressureDiastolic: 96,
            oxygenSaturation: 96,
            temperature: 98.4,
            respiratoryRate: 18,
            bloodGlucose: 124,
            measuredAt: '2026-10-15',
          },
          {
            heartRate: 76,
            bloodPressureSystolic: 140,
            bloodPressureDiastolic: 88,
            oxygenSaturation: 98,
            temperature: 98.7,
            respiratoryRate: 16,
            bloodGlucose: 112,
            measuredAt: '2026-09-02',
          },
        ],
        labReports: [
          {
            id: 'lab-1',
            patientId: 'pat-101',
            testName: 'Lipid Profile Comprehensive',
            category: 'Biochemistry',
            date: '2026-10-20',
            result: 'LDL: 154 mg/dL | HDL: 44 mg/dL | Triglycerides: 198 mg/dL',
            referenceRange: 'LDL < 100 mg/dL',
            unit: 'mg/dL',
            status: 'borderline',
            doctorNotes: 'Initiate statin titration. Re-check in 8 weeks.',
          },
          {
            id: 'lab-2',
            patientId: 'pat-101',
            testName: '12-Lead Electrocardiogram (ECG)',
            category: 'Cardiology',
            date: '2026-10-15',
            result: 'Normal sinus rhythm, mild LVH signs, no acute ischemic ST-T changes',
            referenceRange: 'Sinus rhythm 60-100 bpm',
            unit: 'bpm',
            status: 'normal',
          },
        ],
        clinicalNotes: [
          {
            id: 'note-1',
            date: '2026-10-15',
            doctorName: 'Dr. Alexander Vance',
            subjective: 'Patient reports occasional morning headaches and exertion fatigue.',
            objective: 'BP 154/96 mmHg. Heart sounds S1/S2 regular, no murmurs.',
            assessment: 'Suboptimally controlled Essential Hypertension; Dyslipidemia.',
            plan: 'Up-titrate Amlodipine to 10mg. Continue Atorvastatin 20mg nocte.',
          },
        ],
        insurance: {
          provider: 'BlueCross BlueShield Premier Health',
          policyNumber: 'BCBS-NY-9021884',
          validTill: '2027-12-31',
        },
        lastVisitDate: '2026-10-15',
        nextAppointmentDate: '2026-11-11',
      },
      {
        id: 'pat-102',
        mrn: 'MRN-92014',
        name: 'Marcus Chen',
        age: 42,
        gender: 'Male',
        dob: '1984-08-25',
        phone: '+1 (555) 890-4421',
        email: 'marcus.chen@techcorp.io',
        address: '120 Broadway, Suite 1500, New York, NY',
        bloodGroup: 'B+',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        emergencyContact: {
          name: 'Sarah Chen',
          relationship: 'Sister',
          phone: '+1 (555) 890-4429',
        },
        allergies: [{ allergen: 'Sulfa Drugs', severity: 'moderate' }],
        chronicConditions: ['Type-2 Diabetes Mellitus', 'Work-related Stress Induced Palpitations'],
        currentVitals: {
          heartRate: 104,
          bloodPressureSystolic: 165,
          bloodPressureDiastolic: 102,
          oxygenSaturation: 98,
          temperature: 99.1,
          respiratoryRate: 20,
          bloodGlucose: 215,
          bmi: 28.1,
          weightKg: 84,
          heightCm: 173,
          measuredAt: '2026-11-11 09:10 AM',
        },
        vitalsHistory: [
          {
            heartRate: 104,
            bloodPressureSystolic: 165,
            bloodPressureDiastolic: 102,
            oxygenSaturation: 98,
            temperature: 99.1,
            respiratoryRate: 20,
            bloodGlucose: 215,
            measuredAt: '2026-11-11',
          },
          {
            heartRate: 88,
            bloodPressureSystolic: 142,
            bloodPressureDiastolic: 90,
            oxygenSaturation: 99,
            temperature: 98.6,
            respiratoryRate: 16,
            bloodGlucose: 160,
            measuredAt: '2026-09-18',
          },
        ],
        labReports: [
          {
            id: 'lab-3',
            patientId: 'pat-102',
            testName: 'Hemoglobin A1c (HbA1c)',
            category: 'Biochemistry',
            date: '2026-11-02',
            result: '8.4%',
            referenceRange: '< 5.7% (Normal), < 7.0% (Target)',
            unit: '%',
            status: 'abnormal',
            doctorNotes: 'Elevated. Reinforce metformin compliance and dietary sugar control.',
          },
        ],
        clinicalNotes: [
          {
            id: 'note-2',
            date: '2026-09-18',
            doctorName: 'Dr. Alexander Vance',
            subjective: 'Experiencing rapid heartbeats during prolonged late night coding sprints.',
            objective: 'Tachycardia noted on arrival. Glucose elevated at 160 mg/dL.',
            assessment: 'Sinus tachycardia secondary to caffeine excess and autonomic stress.',
            plan: 'Prescribed Holter monitor for 48 hours. Lifestyle counseling.',
          },
        ],
        insurance: {
          provider: 'Aetna Health High Deductible PPO',
          policyNumber: 'AETNA-8840192',
          validTill: '2027-06-30',
        },
        lastVisitDate: '2026-09-18',
        nextAppointmentDate: '2026-11-11',
      },
      {
        id: 'pat-103',
        mrn: 'MRN-64112',
        name: 'Aisha Al-Mansoor',
        age: 34,
        gender: 'Female',
        dob: '1992-11-04',
        phone: '+1 (555) 712-9904',
        email: 'aisha.mansoor@designhub.org',
        address: '45 Gramercy Park North, New York, NY',
        bloodGroup: 'A-',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        emergencyContact: {
          name: 'Tariq Mansoor',
          relationship: 'Spouse',
          phone: '+1 (555) 712-9905',
        },
        allergies: [],
        chronicConditions: ['Mitral Valve Prolapse (Mild)', 'Seasonal Allergic Rhinitis'],
        currentVitals: {
          heartRate: 68,
          bloodPressureSystolic: 118,
          bloodPressureDiastolic: 76,
          oxygenSaturation: 99,
          temperature: 98.4,
          respiratoryRate: 14,
          bloodGlucose: 94,
          bmi: 21.8,
          weightKg: 58,
          heightCm: 163,
          measuredAt: '2026-11-10',
        },
        vitalsHistory: [
          {
            heartRate: 68,
            bloodPressureSystolic: 118,
            bloodPressureDiastolic: 76,
            oxygenSaturation: 99,
            temperature: 98.4,
            respiratoryRate: 14,
            bloodGlucose: 94,
            measuredAt: '2026-11-10',
          },
        ],
        labReports: [
          {
            id: 'lab-4',
            patientId: 'pat-103',
            testName: 'Echocardiogram 2D Doppler',
            category: 'Cardiology',
            date: '2026-08-14',
            result: 'LVEF 64%. Trace mitral regurgitation with posterior leaflet scalloping.',
            referenceRange: 'EF 55-70%',
            unit: '%',
            status: 'normal',
          },
        ],
        clinicalNotes: [],
        insurance: {
          provider: 'UnitedHealthcare Choice Plus',
          policyNumber: 'UHC-4401928-01',
          validTill: '2027-01-31',
        },
        lastVisitDate: '2026-08-14',
        nextAppointmentDate: '2026-11-11',
      },
      {
        id: 'pat-104',
        mrn: 'MRN-55902',
        name: 'James O’Connor',
        age: 69,
        gender: 'Male',
        dob: '1957-01-19',
        phone: '+1 (555) 431-7720',
        email: 'j.oconnor@retiredfdny.com',
        address: '320 Bay Ridge Parkway, Brooklyn, NY',
        bloodGroup: 'AB+',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
        emergencyContact: {
          name: 'Deirdre O’Connor',
          relationship: 'Daughter',
          phone: '+1 (555) 431-7722',
        },
        allergies: [{ allergen: 'Aspirin (NSAIDs)', severity: 'severe' }],
        chronicConditions: ['Atrial Fibrillation (Paroxysmal)', 'Coronary Stent (DES 2023)', 'Gout'],
        currentVitals: {
          heartRate: 88,
          bloodPressureSystolic: 132,
          bloodPressureDiastolic: 84,
          oxygenSaturation: 95,
          temperature: 98.5,
          respiratoryRate: 17,
          bloodGlucose: 108,
          bmi: 27.2,
          weightKg: 82,
          heightCm: 174,
          measuredAt: '2026-11-11 08:30 AM',
        },
        vitalsHistory: [
          {
            heartRate: 88,
            bloodPressureSystolic: 132,
            bloodPressureDiastolic: 84,
            oxygenSaturation: 95,
            temperature: 98.5,
            respiratoryRate: 17,
            bloodGlucose: 108,
            measuredAt: '2026-11-11',
          },
          {
            heartRate: 94,
            bloodPressureSystolic: 138,
            bloodPressureDiastolic: 88,
            oxygenSaturation: 95,
            temperature: 98.6,
            respiratoryRate: 18,
            bloodGlucose: 110,
            measuredAt: '2026-10-01',
          },
        ],
        labReports: [
          {
            id: 'lab-5',
            patientId: 'pat-104',
            testName: 'International Normalized Ratio (INR)',
            category: 'Hematology',
            date: '2026-10-28',
            result: '2.4',
            referenceRange: '2.0 - 3.0 (Target for AFib on Warfarin/Anticoagulant)',
            unit: 'ratio',
            status: 'normal',
          },
        ],
        clinicalNotes: [],
        insurance: {
          provider: 'Medicare Part B & Humana Gold Plus',
          policyNumber: 'MEDICARE-66910',
          validTill: '2028-12-31',
        },
        lastVisitDate: '2026-10-01',
        nextAppointmentDate: '2026-11-11',
      },
    ];
  }

  private getSeedAppointments(): Appointment[] {
    const today = new Date().toISOString().split('T')[0];

    return [
      {
        id: 'apt-1',
        appointmentNumber: 'APT-1001',
        patientId: 'pat-102',
        patientName: 'Marcus Chen',
        patientAge: 42,
        patientGender: 'Male',
        patientPhone: '+1 (555) 890-4421',
        patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        patientBloodGroup: 'B+',
        date: today,
        timeSlot: '09:00 AM',
        type: 'video',
        status: 'in-progress',
        urgency: 'urgent',
        chiefComplaint: 'Acute chest tightness & resting tachycardia (HR 104 bpm)',
        symptoms: ['Palpitations', 'Dizziness', 'Elevated Blood Glucose'],
        notes: 'RPM sensor trigger: BP spike 165/102. Waiting in Telehealth Room.',
        consultationFee: 120,
        isPaid: true,
        videoRoomId: 'telehealth-room-402',
        vitalAlert: 'CRITICAL BP 165/102 mmHg & HR 104 bpm',
      },
      {
        id: 'apt-2',
        appointmentNumber: 'APT-1002',
        patientId: 'pat-101',
        patientName: 'Eleanor Sterling',
        patientAge: 58,
        patientGender: 'Female',
        patientPhone: '+1 (555) 349-8812',
        patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        patientBloodGroup: 'O+',
        date: today,
        timeSlot: '09:30 AM',
        type: 'in-person',
        status: 'checked-in',
        urgency: 'moderate',
        chiefComplaint: 'Follow-up for Hypertension & Medication review',
        symptoms: ['Morning headache', 'Exertional fatigue'],
        notes: 'Waiting in Sub-waiting Area B. Vitals logged by triage nurse.',
        consultationFee: 150,
        isPaid: true,
        vitalAlert: 'BP 148/92 mmHg (Stage 2 HTN)',
      },
      {
        id: 'apt-3',
        appointmentNumber: 'APT-1003',
        patientId: 'pat-104',
        patientName: 'James O’Connor',
        patientAge: 69,
        patientGender: 'Male',
        patientPhone: '+1 (555) 431-7720',
        patientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
        patientBloodGroup: 'AB+',
        date: today,
        timeSlot: '10:00 AM',
        type: 'in-person',
        status: 'scheduled',
        urgency: 'routine',
        chiefComplaint: 'Quarterly Stent & Anticoagulant INR Review',
        symptoms: ['Routine checkup', 'No active chest pain'],
        notes: 'Recent INR is therapeutic (2.4). Check telemetry rhythm strip.',
        consultationFee: 150,
        isPaid: false,
      },
      {
        id: 'apt-4',
        appointmentNumber: 'APT-1004',
        patientId: 'pat-103',
        patientName: 'Aisha Al-Mansoor',
        patientAge: 34,
        patientGender: 'Female',
        patientPhone: '+1 (555) 712-9904',
        patientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        patientBloodGroup: 'A-',
        date: today,
        timeSlot: '11:15 AM',
        type: 'video',
        status: 'scheduled',
        urgency: 'routine',
        chiefComplaint: 'Annual Mitral Valve Prolapse Doppler Review',
        symptoms: ['Occasional skipped beats after exercise'],
        notes: 'Pre-consult questionnaire uploaded. Review echo findings.',
        consultationFee: 120,
        isPaid: true,
        videoRoomId: 'telehealth-room-403',
      },
      {
        id: 'apt-5',
        appointmentNumber: 'APT-1005',
        patientId: 'pat-101',
        patientName: 'Eleanor Sterling',
        patientAge: 58,
        patientGender: 'Female',
        patientPhone: '+1 (555) 349-8812',
        patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        patientBloodGroup: 'O+',
        date: today,
        timeSlot: '02:00 PM',
        type: 'lab-review',
        status: 'scheduled',
        urgency: 'routine',
        chiefComplaint: 'Post-statin titration lipid panel interpretation',
        symptoms: ['Routine lab check'],
        notes: 'Review LDL trend.',
        consultationFee: 80,
        isPaid: false,
      },
    ];
  }

  private getSeedPrescriptions(): Prescription[] {
    return [
      {
        id: 'rx-4001',
        rxNumber: 'RX-2026-4001',
        patientId: 'pat-101',
        patientName: 'Eleanor Sterling',
        patientAge: 58,
        patientGender: 'Female',
        doctorName: 'Dr. Alexander Vance, MD',
        doctorRegNo: 'MED-NY-849201',
        clinicName: 'Metropolitan Heart & Vascular Institute',
        date: '2026-10-15',
        diagnosis: ['Essential Hypertension (I10)', 'Hyperlipidemia, unspecified (E78.5)'],
        icdCodes: ['I10', 'E78.5'],
        vitalsSnapshot: {
          bloodPressureSystolic: 154,
          bloodPressureDiastolic: 96,
          heartRate: 84,
          weightKg: 68,
        },
        medications: [
          {
            id: 'med-1',
            name: 'Amlodipine Besylate',
            genericName: 'Amlodipine',
            dosage: '10 mg',
            form: 'Tablet',
            frequency: 'OD (Once daily)',
            timing: 'After meals',
            durationDays: 30,
            instructions: 'Take once daily in the morning with water.',
          },
          {
            id: 'med-2',
            name: 'Atorvastatin Calcium',
            genericName: 'Atorvastatin',
            dosage: '20 mg',
            form: 'Tablet',
            frequency: 'OD (Once daily)',
            timing: 'At bedtime',
            durationDays: 30,
            instructions: 'Take at night before sleep.',
          },
        ],
        orderedLabTests: ['Fasting Lipid Panel in 8 weeks', 'Serum Creatinine & Electrolytes'],
        dietaryAdvice: 'Strict low sodium (< 2g/day) DASH diet. Limit caffeine and processed foods.',
        clinicalNotes: 'Target blood pressure < 130/80 mmHg. Maintain home BP log.',
        followUpDate: '2026-11-15',
        qrVerificationCode: 'VERIFY-RX-EL4929',
      },
    ];
  }

  private getSeedTelehealthMessages(): TelehealthChatMessage[] {
    return [
      {
        id: 'msg-1',
        sender: 'system',
        message: 'Secure Telehealth Encrypted Room established. Patient Marcus Chen has joined the room.',
        timestamp: '09:01 AM',
      },
      {
        id: 'msg-2',
        sender: 'patient',
        message: 'Hello Dr. Vance! My Apple Watch alerted me that my resting heart rate hit 105 and my BP machine just read 165/102. Feeling a bit jittery.',
        timestamp: '09:02 AM',
      },
      {
        id: 'msg-3',
        sender: 'doctor',
        message: 'Good morning Marcus. I can see your RPM telemetry stream right now. Take a slow deep breath. Are you experiencing any radiating arm or jaw pain, or shortness of breath?',
        timestamp: '09:03 AM',
      },
    ];
  }
}
