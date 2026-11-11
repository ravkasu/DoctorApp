import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';

import { AppointmentModalComponent } from './appointment-modal/appointment-modal.component';
import { PatientModalComponent } from './patient-modal/patient-modal.component';
import { PrescriptionModalComponent } from './prescription-modal/prescription-modal.component';

@NgModule({
  declarations: [
    AppointmentModalComponent,
    PatientModalComponent,
    PrescriptionModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
  ],
  exports: [
    AppointmentModalComponent,
    PatientModalComponent,
    PrescriptionModalComponent,
  ],
})
export class SharedComponentsModule {}
