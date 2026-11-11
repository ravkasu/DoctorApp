import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const saved = localStorage.getItem('medpulse_dark_mode');
    if (saved !== null) {
      this.setDarkMode(saved === 'true');
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(prefersDark);
    }
  }

  public toggleDarkMode(): void {
    this.setDarkMode(!this.isDarkModeSubject.value);
  }

  public setDarkMode(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    localStorage.setItem('medpulse_dark_mode', String(isDark));
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
    document.body.classList.toggle('dark-theme', isDark);
  }

  public isDark(): boolean {
    return this.isDarkModeSubject.value;
  }
}
