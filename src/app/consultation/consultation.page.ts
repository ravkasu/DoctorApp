import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular/lazy';
import { Observable } from 'rxjs';
import { Appointment, Patient, TelehealthChatMessage } from '../models/doctor-app.models';
import { DoctorDataService } from '../services/doctor-data.service';
import { PrescriptionModalComponent } from '../components/prescription-modal/prescription-modal.component';

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.page.html',
  styleUrls: ['./consultation.page.scss'],
  standalone: false,
})
export class ConsultationPage implements OnInit, OnDestroy {
  public appointmentId = '';
  public appointment?: Appointment;
  public patient?: Patient;
  public messages$!: Observable<TelehealthChatMessage[]>;

  // Call state
  public isMicMuted = false;
  public isVideoOff = false;
  public isScreenSharing = false;
  public callSeconds = 582; // 09:42 initial
  public callTimerDisplay = '09:42';
  private timerInterval: any;

  // In-call workspace drawer
  public showSidePanel = true;
  public sidePanelTab: 'vitals' | 'chat' | 'notes' = 'vitals';

  // Live Chat input
  public chatInput = '';

  // In-call clinical note
  public inCallNote = {
    subjective: 'Patient reports intermittent palpitations and mild breathlessness after caffeine.',
    objective: 'BP during consult 165/102 mmHg. HR 104 bpm. No signs of acute cyanosis.',
    assessment: 'Sinus Tachycardia; Elevated Blood Pressure secondary to autonomic stress.',
    plan: 'Prescribing beta-blocker/antihypertensive dose adjustment. Advise Holter monitoring.',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public doctorService: DoctorDataService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.appointmentId = this.route.snapshot.paramMap.get('id') || 'apt-1';
    this.messages$ = this.doctorService.telehealthMessages$;

    // Find appointment and patient
    const appointments = this.doctorService.getAppointments();
    this.appointment = appointments.find(a => a.id === this.appointmentId) || appointments[0];

    if (this.appointment) {
      this.patient = this.doctorService.getPatientById(this.appointment.patientId);
    } else {
      this.patient = this.doctorService.getPatients()[1]; // Marcus Chen
    }

    this.startCallTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private startCallTimer(): void {
    this.timerInterval = setInterval(() => {
      this.callSeconds++;
      const mins = Math.floor(this.callSeconds / 60);
      const secs = this.callSeconds % 60;
      this.callTimerDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
  }

  public toggleMic(): void {
    this.isMicMuted = !this.isMicMuted;
    this.showToast(this.isMicMuted ? 'Microphone muted' : 'Microphone unmuted');
  }

  public toggleVideo(): void {
    this.isVideoOff = !this.isVideoOff;
    this.showToast(this.isVideoOff ? 'Camera paused' : 'Camera active');
  }

  public toggleScreenShare(): void {
    this.isScreenSharing = !this.isScreenSharing;
    this.showToast(this.isScreenSharing ? 'Screen sharing active' : 'Screen share stopped');
  }

  public toggleSidePanel(): void {
    this.showSidePanel = !this.showSidePanel;
  }

  public sendMessage(): void {
    if (this.chatInput.trim()) {
      this.doctorService.sendTelehealthMessage(this.chatInput.trim(), 'doctor');
      const text = this.chatInput.trim();
      this.chatInput = '';

      // Auto simulate patient acknowledgement
      if (text.toLowerCase().includes('prescription') || text.toLowerCase().includes('rx')) {
        this.doctorService.simulatePatientReply('Thank you Dr. Vance, I see the prescription notifications on my patient portal!');
      } else if (text.toLowerCase().includes('bp') || text.toLowerCase().includes('breath')) {
        this.doctorService.simulatePatientReply('Understood doctor, doing that right now.');
      }
    }
  }

  public sendQuickReply(text: string): void {
    this.doctorService.sendTelehealthMessage(text, 'doctor');
    this.doctorService.simulatePatientReply('Got it, thank you Dr. Vance!');
  }

  public async openInCallPrescription(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PrescriptionModalComponent,
      componentProps: { preselectedPatientId: this.patient?.id },
      cssClass: 'medpulse-modal-xlarge',
    });
    await modal.present();
  }

  public saveInCallNotes(): void {
    if (this.patient) {
      this.patient.clinicalNotes.unshift({
        id: 'note-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        doctorName: 'Dr. Alexander Vance',
        subjective: this.inCallNote.subjective,
        objective: this.inCallNote.objective,
        assessment: this.inCallNote.assessment,
        plan: this.inCallNote.plan,
      });
      this.doctorService.updatePatient(this.patient);
      this.showToast('Consultation SOAP Notes saved to Patient EHR!');
    }
  }

  public async confirmEndCall(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'End Video Consultation?',
      subHeader: `Patient: ${this.patient?.name} (Call duration: ${this.callTimerDisplay})`,
      message: 'Would you like to complete this encounter and finalize clinical notes & prescription?',
      buttons: [
        { text: 'Stay in Room', role: 'cancel' },
        {
          text: 'Complete Consultation',
          handler: () => {
            if (this.appointment) {
              this.doctorService.updateAppointmentStatus(this.appointment.id, 'completed');
            }
            this.showToast('Consultation finalized successfully!');
            this.router.navigate(['/tabs/dashboard']);
          },
        },
      ],
    });
    await alert.present();
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }
}
