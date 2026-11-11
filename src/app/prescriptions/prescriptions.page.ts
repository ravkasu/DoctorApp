import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/lazy';
import { Observable } from 'rxjs';
import { Prescription } from '../models/doctor-app.models';
import { DoctorDataService } from '../services/doctor-data.service';
import { PrescriptionModalComponent } from '../components/prescription-modal/prescription-modal.component';

@Component({
  selector: 'app-prescriptions',
  templateUrl: './prescriptions.page.html',
  styleUrls: ['./prescriptions.page.scss'],
  standalone: false,
})
export class PrescriptionsPage implements OnInit {
  public prescriptions$!: Observable<Prescription[]>;
  public searchQuery = '';

  constructor(
    public doctorService: DoctorDataService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.prescriptions$ = this.doctorService.prescriptions$;
  }

  public matchesSearch(rx: Prescription): boolean {
    if (!this.searchQuery.trim()) return true;
    const q = this.searchQuery.toLowerCase();
    const matchName = rx.patientName.toLowerCase().includes(q);
    const matchNum = rx.rxNumber.toLowerCase().includes(q);
    const matchMed = rx.medications.some(m => m.name.toLowerCase().includes(q));
    const matchDiag = rx.diagnosis.some(d => d.toLowerCase().includes(q));
    return matchName || matchNum || matchMed || matchDiag;
  }

  public async openNewPrescriptionModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PrescriptionModalComponent,
      cssClass: 'medpulse-modal-xlarge',
    });
    await modal.present();
  }

  public async viewPrescription(rx: Prescription): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PrescriptionModalComponent,
      componentProps: { existingPrescription: rx },
      cssClass: 'medpulse-modal-xlarge',
    });
    await modal.present();
  }
}
