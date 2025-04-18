import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'blog-theme-mode';
  private themeSubject = new BehaviorSubject<ThemeMode>('dark');
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadTheme();
  }
  
  get currentTheme$(): Observable<ThemeMode> {
    return this.themeSubject.asObservable();
  }
  
  get currentTheme(): ThemeMode {
    return this.themeSubject.getValue();
  }
  
  toggleTheme(): void {
    const newTheme: ThemeMode = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
  
  setTheme(theme: ThemeMode): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, theme);
      document.documentElement.setAttribute('data-theme', theme);
      this.themeSubject.next(theme);
    }
  }
  
  private loadTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Yerel depolamadan tema ayarını al veya varsayılan olarak 'dark' kullan
      const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode;
      const initialTheme = savedTheme || 'dark';
      
      document.documentElement.setAttribute('data-theme', initialTheme);
      this.themeSubject.next(initialTheme);
    }
  }
} 