import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular/lazy';
import { ClinicalNote, LabReport, Patient, Prescription, Vitals } from '../../models/doctor-app.models';
import { DoctorDataService } from '../../services/doctor-data.service';

@Component({
  selector: 'app-patient-modal',
  templateUrl: './patient-modal.component.html',
  styleUrls: ['./patient-modal.component.scss'],
  standalone: false,
})
export class PatientModalComponent implements OnInit {
  @Input() patientId!: string;
  @Input() isNewPatient = false;

  public patient!: Patient;
  public activeTab: 'vitals' | 'history' | 'labs' | 'notes' | 'prescriptions' = 'vitals';
  public prescriptions: Prescription[] = [];

  // New Vitals Form
  public showAddVitals = false;
  public newVitals: Vitals = {
    heartRate: 75,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    oxygenSaturation: 98,
    temperature: 98.6,
    respiratoryRate: 16,
    bloodGlucose: 100,
    bmi: 24.5,
    weightKg: 70,
    heightCm: 170,
    measuredAt: new Date().toLocaleString(),
  };

  // New Clinical Note Form
  public showAddNote = false;
  public newNote: Omit<ClinicalNote, 'id'> = {
    date: new Date().toISOString().split('T')[0],
    doctorName: 'Dr. Alexander Vance',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  };

  // New Allergy / Condition fields
  public newAllergen = '';
  public newAllergySeverity: 'mild' | 'moderate' | 'severe' = 'mild';
  public newCondition = '';

  constructor(
    private modalCtrl: ModalController,
    private doctorService: DoctorDataService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    if (this.isNewPatient) {
      this.patient = this.createNewBlankPatient();
    } else {
      const found = this.doctorService.getPatientById(this.patientId);
      if (found) {
        this.patient = JSON.parse(JSON.stringify(found));
        this.loadPatientPrescriptions();
      } else {
        this.patient = this.createNewBlankPatient();
      }
    }
  }

  private createNewBlankPatient(): Patient {
    return {
      id: 'pat-' + Date.now(),
      mrn: 'MRN-' + Math.floor(10000 + Math.random() * 90000),
      name: '',
      age: 40,
      gender: 'Male',
      dob: '1986-01-01',
      phone: '',
      email: '',
      address: '',
      bloodGroup: 'O+',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      emergencyContact: {
        name: '',
        relationship: 'Spouse',
        phone: '',
      },
      allergies: [],
      chronicConditions: [],
      vitalsHistory: [],
      currentVitals: {
        heartRate: 72,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        oxygenSaturation: 99,
        temperature: 98.6,
        respiratoryRate: 16,
        measuredAt: new Date().toLocaleString(),
      },
      labReports: [],
      clinicalNotes: [],
      insurance: {
        provider: 'Primary Healthcare PPO',
        policyNumber: 'INS-' + Math.floor(100000 + Math.random() * 900000),
        validTill: '2028-12-31',
      },
      lastVisitDate: new Date().toISOString().split('T')[0],
    };
  }

  private loadPatientPrescriptions(): void {
    this.doctorService.getPrescriptionsByPatient(this.patient.id).subscribe(rx => {
      this.prescriptions = rx;
    });
  }

  // --- ACTIONS ---

  public calculateBmi(): void {
    if (this.newVitals.weightKg && this.newVitals.heightCm) {
      const heightInMeters = this.newVitals.heightCm / 100;
      this.newVitals.bmi = parseFloat(
        (this.newVitals.weightKg / (heightInMeters * heightInMeters)).toFixed(1)
      );
    }
  }

  public saveNewVitals(): void {
    this.newVitals.measuredAt = new Date().toLocaleString();
    this.patient.currentVitals = { ...this.newVitals };
    this.patient.vitalsHistory = [{ ...this.newVitals }, ...this.patient.vitalsHistory];
    this.doctorService.updatePatient(this.patient);
    this.showAddVitals = false;
    this.showToast('Vitals recorded & updated in EHR!');
  }

  public addAllergy(): void {
    if (this.newAllergen.trim()) {
      this.patient.allergies.push({
        allergen: this.newAllergen.trim(),
        severity: this.newAllergySeverity,
      });
      this.doctorService.updatePatient(this.patient);
      this.newAllergen = '';
      this.showToast('Allergy added to patient chart.');
    }
  }

  public removeAllergy(index: number): void {
    this.patient.allergies.splice(index, 1);
    this.doctorService.updatePatient(this.patient);
  }

  public addCondition(): void {
    if (this.newCondition.trim()) {
      this.patient.chronicConditions.push(this.newCondition.trim());
      this.doctorService.updatePatient(this.patient);
      this.newCondition = '';
      this.showToast('Condition recorded.');
    }
  }

  public removeCondition(index: number): void {
    this.patient.chronicConditions.splice(index, 1);
    this.doctorService.updatePatient(this.patient);
  }

  public saveClinicalNote(): void {
    if (!this.newNote.assessment.trim()) {
      this.showToast('Please enter clinical assessment/diagnosis.', 'warning');
      return;
    }

    const note: ClinicalNote = {
      ...this.newNote,
      id: 'note-' + Date.now(),
    };

    this.patient.clinicalNotes.unshift(note);
    this.doctorService.updatePatient(this.patient);
    this.showAddNote = false;
    this.newNote = {
      date: new Date().toISOString().split('T')[0],
      doctorName: 'Dr. Alexander Vance',
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    };
    this.showToast('SOAP Clinical Note logged successfully!');
  }

  public savePatientFullRecord(): void {
    if (!this.patient.name.trim()) {
      this.showToast('Patient name is required.', 'warning');
      return;
    }

    if (this.isNewPatient) {
      this.doctorService.addPatient(this.patient);
      this.showToast('New patient profile created in EHR directory!');
    } else {
      this.doctorService.updatePatient(this.patient);
      this.showToast('Patient EHR profile updated!');
    }
    this.modalCtrl.dismiss(this.patient, 'saved');
  }

  private async showToast(message: string, color: 'success' | 'warning' = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top',
    });
    await toast.present();
  }

  public dismiss(): void {
    this.modalCtrl.dismiss(null, 'close');
  }
}
