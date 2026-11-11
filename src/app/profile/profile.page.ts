import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular/lazy';
import { Observable } from 'rxjs';
import { DoctorProfile } from '../models/doctor-app.models';
import { DoctorDataService } from '../services/doctor-data.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  public profile$!: Observable<DoctorProfile>;
  public isDark = false;
  public soundAlerts = true;
  public editFeesMode = false;

  // Editable copy of fees
  public inClinicFee = 150;
  public videoFee = 120;
  public emergencyFee = 250;

  constructor(
    public doctorService: DoctorDataService,
    public themeService: ThemeService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.profile$ = this.doctorService.doctorProfile$;
    this.themeService.isDarkMode$.subscribe(dark => {
      this.isDark = dark;
    });

    this.profile$.subscribe(p => {
      this.inClinicFee = p.consultationFees.inClinic;
      this.videoFee = p.consultationFees.telehealthVideo;
      this.emergencyFee = p.consultationFees.emergency;
    });
  }

  public toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  public setDoctorStatus(status: 'online' | 'in-consult' | 'break' | 'offline'): void {
    this.doctorService.updateDoctorStatus(status);
    this.showToast(`Doctor availability changed to ${status.toUpperCase()}`);
  }

  public saveFees(): void {
    this.doctorService.updateDoctorProfile({
      consultationFees: {
        inClinic: this.inClinicFee,
        telehealthVideo: this.videoFee,
        emergency: this.emergencyFee,
      },
    });
    this.editFeesMode = false;
    this.showToast('Consultation fee schedule updated & saved!');
  }

  public resetAllData(): void {
    if (confirm('Reset application data to initial medical seed data?')) {
      localStorage.clear();
      window.location.reload();
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
}
