import { IonicModule } from '@ionic/angular/lazy';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultationPage } from './consultation.page';
import { ConsultationPageRoutingModule } from './consultation-routing.module';
import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedComponentsModule,
    ConsultationPageRoutingModule,
  ],
  declarations: [ConsultationPage],
})
export class ConsultationPageModule {}
