import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular/lazy';
import { Medication, Patient, Prescription } from '../../models/doctor-app.models';
import { DoctorDataService } from '../../services/doctor-data.service';

@Component({
  selector: 'app-prescription-modal',
  templateUrl: './prescription-modal.component.html',
  styleUrls: ['./prescription-modal.component.scss'],
  standalone: false,
})
export class PrescriptionModalComponent implements OnInit {
  @Input() existingPrescription?: Prescription;
  @Input() preselectedPatientId?: string;

  public patients: Patient[] = [];
  public selectedPatient?: Patient;
  public selectedPatientId = '';

  // Rx Builder state
  public previewMode = false;
  public diagnosisInput = 'Essential Hypertension (I10)';
  public icdCodeInput = 'I10';
  public dietaryAdvice = 'Low sodium diet (< 2g daily). Moderate cardio 30 mins daily. Avoid processed foods.';
  public clinicalNotes = 'Monitor blood pressure twice daily. Report if systolic > 160 or severe headache occurs.';
  public followUpDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  public orderedLabTestsInput = 'Fasting Lipid Profile, Serum Electrolytes';

  public medications: Medication[] = [
    {
      id: 'med-1',
      name: 'Amlodipine Besylate',
      genericName: 'Amlodipine',
      dosage: '5 mg',
      form: 'Tablet',
      frequency: 'OD (Once daily)',
      timing: 'After meals',
      durationDays: 30,
      instructions: 'Take 1 tablet every morning with water',
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
      instructions: 'Take 1 tablet at night before sleep',
    },
  ];

  public commonMedicines = [
    { name: 'Amlodipine Besylate', dosage: '5 mg', form: 'Tablet' },
    { name: 'Metformin HCl', dosage: '500 mg', form: 'Tablet' },
    { name: 'Atorvastatin Calcium', dosage: '20 mg', form: 'Tablet' },
    { name: 'Lisinopril', dosage: '10 mg', form: 'Tablet' },
    { name: 'Azithromycin', dosage: '500 mg', form: 'Tablet' },
    { name: 'Amoxicillin + Clavulanate', dosage: '625 mg', form: 'Tablet' },
    { name: 'Paracetamol', dosage: '650 mg', form: 'Tablet' },
    { name: 'Salbutamol Inhaler', dosage: '100 mcg', form: 'Inhaler' },
  ];

  public savedPrescription?: Prescription;

  constructor(
    private modalCtrl: ModalController,
    private doctorService: DoctorDataService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.patients = this.doctorService.getPatients();

    if (this.existingPrescription) {
      this.savedPrescription = this.existingPrescription;
      this.previewMode = true;
      this.selectedPatientId = this.existingPrescription.patientId;
      this.selectedPatient = this.patients.find(p => p.id === this.selectedPatientId);
      this.diagnosisInput = this.existingPrescription.diagnosis.join(', ');
      this.icdCodeInput = this.existingPrescription.icdCodes.join(', ');
      this.dietaryAdvice = this.existingPrescription.dietaryAdvice;
      this.clinicalNotes = this.existingPrescription.clinicalNotes;
      this.followUpDate = this.existingPrescription.followUpDate;
      this.orderedLabTestsInput = this.existingPrescription.orderedLabTests.join(', ');
      this.medications = JSON.parse(JSON.stringify(this.existingPrescription.medications));
    } else if (this.preselectedPatientId) {
      this.selectedPatientId = this.preselectedPatientId;
      this.onPatientChange();
    } else if (this.patients.length > 0) {
      this.selectedPatientId = this.patients[0].id;
      this.onPatientChange();
    }
  }

  public onPatientChange(): void {
    this.selectedPatient = this.patients.find(p => p.id === this.selectedPatientId);
  }

  public addMedicationRow(): void {
    const newMed: Medication = {
      id: 'med-' + Date.now(),
      name: '',
      dosage: '10 mg',
      form: 'Tablet',
      frequency: 'BD (Twice daily)',
      timing: 'After meals',
      durationDays: 7,
      instructions: 'Take with water after meals',
    };
    this.medications.push(newMed);
  }

  public removeMedicationRow(index: number): void {
    if (this.medications.length > 1) {
      this.medications.splice(index, 1);
    }
  }

  public selectQuickDrug(medIndex: number, quickDrug: { name: string; dosage: string; form: any }): void {
    this.medications[medIndex].name = quickDrug.name;
    this.medications[medIndex].dosage = quickDrug.dosage;
    this.medications[medIndex].form = quickDrug.form;
  }

  public togglePreview(): void {
    if (!this.previewMode) {
      // Validate before generating preview
      if (!this.selectedPatient) {
        this.showToast('Please select a patient first.', 'warning');
        return;
      }
      if (this.medications.some(m => !m.name.trim())) {
        this.showToast('Please enter medicine names for all rows.', 'warning');
        return;
      }

      this.savedPrescription = {
        id: this.savedPrescription?.id || 'rx-' + Date.now(),
        rxNumber: this.savedPrescription?.rxNumber || 'RX-2026-' + Math.floor(1000 + Math.random() * 9000),
        patientId: this.selectedPatient.id,
        patientName: this.selectedPatient.name,
        patientAge: this.selectedPatient.age,
        patientGender: this.selectedPatient.gender,
        doctorName: 'Dr. Alexander Vance, MD, FACC',
        doctorRegNo: 'MED-NY-849201',
        clinicName: 'Metropolitan Heart & Vascular Institute',
        date: new Date().toISOString().split('T')[0],
        diagnosis: this.diagnosisInput.split(',').map(d => d.trim()).filter(Boolean),
        icdCodes: this.icdCodeInput.split(',').map(c => c.trim()).filter(Boolean),
        vitalsSnapshot: this.selectedPatient.currentVitals || {},
        medications: this.medications,
        orderedLabTests: this.orderedLabTestsInput.split(',').map(l => l.trim()).filter(Boolean),
        dietaryAdvice: this.dietaryAdvice,
        clinicalNotes: this.clinicalNotes,
        followUpDate: this.followUpDate,
        qrVerificationCode: 'VERIFY-RX-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      };
    }
    this.previewMode = !this.previewMode;
  }

  public printPrescription(): void {
    window.print();
  }

  public async shareViaEmailOrSms(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: `Prescription ${this.savedPrescription?.rxNumber} transmitted securely to ${this.selectedPatient?.email || 'patient email'} and mobile!`,
      duration: 3500,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }

  public saveAndIssuePrescription(): void {
    if (!this.selectedPatient) {
      this.showToast('Please select a patient.', 'warning');
      return;
    }

    if (!this.savedPrescription) {
      this.togglePreview();
    }

    if (this.savedPrescription) {
      this.doctorService.addPrescription(this.savedPrescription);
      this.showToast(`Prescription ${this.savedPrescription.rxNumber} issued & saved to EHR!`);
      this.modalCtrl.dismiss(this.savedPrescription, 'saved');
    }
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
