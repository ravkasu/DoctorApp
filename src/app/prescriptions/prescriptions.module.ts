import { IonicModule } from '@ionic/angular/lazy';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrescriptionsPage } from './prescriptions.page';
import { PrescriptionsPageRoutingModule } from './prescriptions-routing.module';
import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedComponentsModule,
    PrescriptionsPageRoutingModule,
  ],
  declarations: [PrescriptionsPage],
})
export class PrescriptionsPageModule {}
