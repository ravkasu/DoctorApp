import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/lazy';
import { Observable } from 'rxjs';
import { Patient } from '../models/doctor-app.models';
import { DoctorDataService } from '../services/doctor-data.service';
import { PatientModalComponent } from '../components/patient-modal/patient-modal.component';
import { AppointmentModalComponent } from '../components/appointment-modal/appointment-modal.component';
import { PrescriptionModalComponent } from '../components/prescription-modal/prescription-modal.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  public patients$!: Observable<Patient[]>;
  public searchQuery = '';
  public conditionFilter = 'all';

  constructor(
    public doctorService: DoctorDataService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.patients$ = this.doctorService.patients$;
  }

  public matchesFilter(patient: Patient): boolean {
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      const matchName = patient.name.toLowerCase().includes(q);
      const matchMrn = patient.mrn.toLowerCase().includes(q);
      const matchPhone = patient.phone.toLowerCase().includes(q);
      if (!matchName && !matchMrn && !matchPhone) {
        return false;
      }
    }

    if (this.conditionFilter !== 'all') {
      if (this.conditionFilter === 'critical') {
        const bpSys = patient.currentVitals?.bloodPressureSystolic || 120;
        const hr = patient.currentVitals?.heartRate || 75;
        if (bpSys < 140 && hr <= 100) {
          return false;
        }
      } else {
        const hasCond = patient.chronicConditions.some(c =>
          c.toLowerCase().includes(this.conditionFilter.toLowerCase())
        );
        if (!hasCond) {
          return false;
        }
      }
    }

    return true;
  }

  public async openPatientModal(patientId?: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PatientModalComponent,
      componentProps: {
        patientId: patientId || '',
        isNewPatient: !patientId,
      },
      cssClass: 'medpulse-modal-xlarge',
    });
    await modal.present();
  }

  public async scheduleForPatient(patientId: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AppointmentModalComponent,
      componentProps: { preselectedPatientId: patientId },
    });
    await modal.present();
  }

  public async issueRxForPatient(patientId: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PrescriptionModalComponent,
      componentProps: { preselectedPatientId: patientId },
    });
    await modal.present();
  }
}
