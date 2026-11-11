import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular/lazy';
import { Appointment, AppointmentType, Patient, TriageUrgency } from '../../models/doctor-app.models';
import { DoctorDataService } from '../../services/doctor-data.service';

@Component({
  selector: 'app-appointment-modal',
  templateUrl: './appointment-modal.component.html',
  styleUrls: ['./appointment-modal.component.scss'],
  standalone: false,
})
export class AppointmentModalComponent implements OnInit {
  @Input() appointmentToEdit?: Appointment;
  @Input() preselectedPatientId?: string;

  public patients: Patient[] = [];
  public isEditMode = false;

  // Form Fields
  public selectedPatientId = '';
  public patientName = '';
  public patientAge = 35;
  public patientGender = 'Male';
  public patientPhone = '';
  public patientBloodGroup = 'O+';
  public date: string = new Date().toISOString().split('T')[0];
  public timeSlot = '10:00 AM';
  public type: AppointmentType = 'in-person';
  public urgency: TriageUrgency = 'routine';
  public chiefComplaint = '';
  public symptomsInput = '';
  public notes = '';
  public consultationFee = 150;
  public isPaid = false;

  public timeSlots = [
    '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  public bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private modalCtrl: ModalController,
    private doctorService: DoctorDataService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.patients = this.doctorService.getPatients();

    if (this.appointmentToEdit) {
      this.isEditMode = true;
      this.selectedPatientId = this.appointmentToEdit.patientId;
      this.patientName = this.appointmentToEdit.patientName;
      this.patientAge = this.appointmentToEdit.patientAge;
      this.patientGender = this.appointmentToEdit.patientGender;
      this.patientPhone = this.appointmentToEdit.patientPhone;
      this.patientBloodGroup = this.appointmentToEdit.patientBloodGroup;
      this.date = this.appointmentToEdit.date;
      this.timeSlot = this.appointmentToEdit.timeSlot;
      this.type = this.appointmentToEdit.type;
      this.urgency = this.appointmentToEdit.urgency;
      this.chiefComplaint = this.appointmentToEdit.chiefComplaint;
      this.symptomsInput = this.appointmentToEdit.symptoms ? this.appointmentToEdit.symptoms.join(', ') : '';
      this.notes = this.appointmentToEdit.notes || '';
      this.consultationFee = this.appointmentToEdit.consultationFee;
      this.isPaid = this.appointmentToEdit.isPaid;
    } else if (this.preselectedPatientId) {
      this.onPatientSelect(this.preselectedPatientId);
    }
  }

  public onPatientSelect(patientId: string): void {
    this.selectedPatientId = patientId;
    const pat = this.patients.find(p => p.id === patientId);
    if (pat) {
      this.patientName = pat.name;
      this.patientAge = pat.age;
      this.patientGender = pat.gender;
      this.patientPhone = pat.phone;
      this.patientBloodGroup = pat.bloodGroup;
    }
  }

  public updateFeeByType(): void {
    if (this.type === 'video') {
      this.consultationFee = 120;
    } else if (this.type === 'emergency') {
      this.consultationFee = 250;
      this.urgency = 'emergency';
    } else if (this.type === 'lab-review') {
      this.consultationFee = 80;
    } else {
      this.consultationFee = 150;
    }
  }

  public async saveAppointment(): Promise<void> {
    if (!this.patientName.trim()) {
      const toast = await this.toastCtrl.create({
        message: 'Please enter patient name or select an existing patient.',
        duration: 2500,
        color: 'warning',
        position: 'top',
      });
      await toast.present();
      return;
    }

    if (!this.chiefComplaint.trim()) {
      const toast = await this.toastCtrl.create({
        message: 'Please specify chief complaint or symptoms.',
        duration: 2500,
        color: 'warning',
        position: 'top',
      });
      await toast.present();
      return;
    }

    const symptomsList = this.symptomsInput
      ? this.symptomsInput.split(',').map(s => s.trim()).filter(Boolean)
      : ['General Checkup'];

    const avatar = this.selectedPatientId
      ? this.patients.find(p => p.id === this.selectedPatientId)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

    if (this.isEditMode && this.appointmentToEdit) {
      const updated: Appointment = {
        ...this.appointmentToEdit,
        patientName: this.patientName,
        patientAge: this.patientAge,
        patientGender: this.patientGender,
        patientPhone: this.patientPhone,
        patientBloodGroup: this.patientBloodGroup,
        date: this.date,
        timeSlot: this.timeSlot,
        type: this.type,
        urgency: this.urgency,
        chiefComplaint: this.chiefComplaint,
        symptoms: symptomsList,
        notes: this.notes,
        consultationFee: this.consultationFee,
        isPaid: this.isPaid,
      };
      this.doctorService.updateAppointment(updated);
      this.showToast('Appointment updated successfully!');
      this.modalCtrl.dismiss(updated, 'updated');
    } else {
      const created = this.doctorService.addAppointment({
        patientId: this.selectedPatientId || 'pat-' + Date.now(),
        patientName: this.patientName,
        patientAge: this.patientAge,
        patientGender: this.patientGender,
        patientPhone: this.patientPhone,
        patientAvatar: avatar,
        patientBloodGroup: this.patientBloodGroup,
        date: this.date,
        timeSlot: this.timeSlot,
        type: this.type,
        status: 'scheduled',
        urgency: this.urgency,
        chiefComplaint: this.chiefComplaint,
        symptoms: symptomsList,
        notes: this.notes,
        consultationFee: this.consultationFee,
        isPaid: this.isPaid,
        videoRoomId: this.type === 'video' ? 'telehealth-room-' + Math.floor(100 + Math.random() * 900) : undefined,
      });
      this.showToast('New appointment scheduled successfully!');
      this.modalCtrl.dismiss(created, 'created');
    }
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }

  public dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
