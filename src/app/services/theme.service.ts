import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private renderer: Renderer2;
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('darkMode');    
    if (savedTheme !== null) {
      const isDark = savedTheme === 'true';
      this.darkModeSubject.next(isDark);
      this.applyTheme(isDark);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkModeSubject.next(prefersDark);
      this.applyTheme(prefersDark);
      localStorage.setItem('darkMode', String(prefersDark));
    }
  }

  toggleDarkMode(): void {
    const newValue = !this.darkModeSubject.value;
    this.darkModeSubject.next(newValue);
    localStorage.setItem('darkMode', String(newValue));
    this.applyTheme(newValue);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      this.renderer.addClass(document.documentElement, 'dark');
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.documentElement, 'dark');
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }
  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }
}