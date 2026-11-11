import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular/lazy';
import { Observable } from 'rxjs';
import { Appointment, AppointmentStatus, AppointmentType } from '../models/doctor-app.models';
import { DoctorDataService } from '../services/doctor-data.service';
import { AppointmentModalComponent } from '../components/appointment-modal/appointment-modal.component';
import { PatientModalComponent } from '../components/patient-modal/patient-modal.component';
import { PrescriptionModalComponent } from '../components/prescription-modal/prescription-modal.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  public appointments$!: Observable<Appointment[]>;
  public searchQuery = '';
  public selectedDate: string = new Date().toISOString().split('T')[0];
  public selectedStatusFilter: 'all' | AppointmentStatus = 'all';
  public selectedTypeFilter: 'all' | AppointmentType = 'all';

  public dateTabs = [
    { label: 'Today', date: new Date().toISOString().split('T')[0] },
    { label: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    { label: 'All Dates', date: '' },
  ];

  constructor(
    public doctorService: DoctorDataService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.appointments$ = this.doctorService.appointments$;
  }

  public setDateFilter(dateStr: string): void {
    this.selectedDate = dateStr;
  }

  public matchesFilter(apt: Appointment): boolean {
    // Search filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      const matchName = apt.patientName.toLowerCase().includes(q);
      const matchNum = apt.appointmentNumber.toLowerCase().includes(q);
      const matchComplaint = apt.chiefComplaint.toLowerCase().includes(q);
      if (!matchName && !matchNum && !matchComplaint) {
        return false;
      }
    }

    // Date filter
    if (this.selectedDate && apt.date !== this.selectedDate) {
      return false;
    }

    // Status filter
    if (this.selectedStatusFilter !== 'all' && apt.status !== this.selectedStatusFilter) {
      return false;
    }

    // Type filter
    if (this.selectedTypeFilter !== 'all' && apt.type !== this.selectedTypeFilter) {
      return false;
    }

    return true;
  }

  public async openNewAppointmentModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AppointmentModalComponent,
    });
    await modal.present();
  }

  public async editAppointment(appointment: Appointment): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AppointmentModalComponent,
      componentProps: { appointmentToEdit: appointment },
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

  public updateStatus(appointment: Appointment, status: AppointmentStatus, event: Event): void {
    event.stopPropagation();
    this.doctorService.updateAppointmentStatus(appointment.id, status);
    this.showToast(`Status updated to ${status.toUpperCase()}`);
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
}
