import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular/lazy';
import { Observable } from 'rxjs';
import { Appointment, DoctorProfile } from '../models/doctor-app.models';
import { DoctorDataService } from '../services/doctor-data.service';
import { ThemeService } from '../services/theme.service';
import { AppointmentModalComponent } from '../components/appointment-modal/appointment-modal.component';
import { PatientModalComponent } from '../components/patient-modal/patient-modal.component';
import { PrescriptionModalComponent } from '../components/prescription-modal/prescription-modal.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  public doctorProfile$!: Observable<DoctorProfile>;
  public metrics$!: Observable<{
    totalToday: number;
    completedToday: number;
    pendingToday: number;
    emergencyCount: number;
    telehealthCount: number;
    criticalAlertsCount: number;
    estimatedRevenue: number;
  }>;
  public appointments$!: Observable<Appointment[]>;
  public activeFilter: 'all' | 'in-person' | 'video' | 'emergency' = 'all';
  public currentTime = '';
  public isDark = false;

  constructor(
    public doctorService: DoctorDataService,
    public themeService: ThemeService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.doctorProfile$ = this.doctorService.doctorProfile$;
    this.metrics$ = this.doctorService.getDashboardMetrics();
    this.appointments$ = this.doctorService.appointments$;

    this.themeService.isDarkMode$.subscribe(dark => {
      this.isDark = dark;
    });

    this.updateClock();
    setInterval(() => this.updateClock(), 30000);
  }

  private updateClock(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  public toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  public setDoctorStatus(status: 'online' | 'in-consult' | 'break' | 'offline'): void {
    this.doctorService.updateDoctorStatus(status);
  }

  public async openNewAppointmentModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AppointmentModalComponent,
    });
    await modal.present();
  }

  public async openPatientChart(patientId: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PatientModalComponent,
      componentProps: { patientId },
    });
    await modal.present();
  }

  public async openPrescriptionBuilder(patientId?: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PrescriptionModalComponent,
      componentProps: { preselectedPatientId: patientId },
    });
    await modal.present();
  }

  public joinVideoRoom(appointment: Appointment): void {
    this.router.navigate(['/consultation', appointment.id]);
  }

  public joinTelehealthSession(appointmentId: string = 'apt-1'): void {
    this.router.navigate(['/consultation', appointmentId]);
  }

  public markAsCompleted(appointment: Appointment, event: Event): void {
    event.stopPropagation();
    this.doctorService.updateAppointmentStatus(appointment.id, 'completed');
    this.showToast(`Appointment ${appointment.appointmentNumber} marked as completed!`);
  }

  public async cancelAppointment(appointment: Appointment, event: Event): Promise<void> {
    event.stopPropagation();
    this.doctorService.updateAppointmentStatus(appointment.id, 'cancelled');
    this.showToast(`Appointment ${appointment.appointmentNumber} cancelled.`, 'warning');
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
}
