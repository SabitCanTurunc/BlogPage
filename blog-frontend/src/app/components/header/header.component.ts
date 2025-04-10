import { Component, OnInit, PLATFORM_ID, Inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { UserResponseDto } from '../../models/user-response.dto';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userEmail: string = '';
  isAdmin: boolean = false;
  isDropdownOpen: boolean = false;
  isMenuOpen: boolean = false;
  userProfile: UserResponseDto | null = null;
  currentLanguage: string = 'tr';
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private translationService: TranslationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private elementRef: ElementRef
  ) {}
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.translationService.currentLang$.subscribe(lang => {
        this.currentLanguage = lang;
      });
    }

    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userEmail = this.authService.getUserEmail() || '';
        this.isAdmin = this.authService.isAdmin();
        this.loadUserProfile();
      }
    });
  }

  loadUserProfile(): void {
    if (this.isLoggedIn) {
      this.userService.getUserProfile().subscribe({
        next: (profile) => {
          this.userProfile = profile;
        },
        error: (err) => {
          // Hata durumunda sessizce devam et
        }
      });
    }
  }
  
  toggleDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (this.isDropdownOpen) {
      // Eğer dropdown zaten açıksa, animasyonlu kapat
      this.closeDropdown();
    } else {
      // Eğer dropdown kapalıysa, direkt aç
      this.isDropdownOpen = true;
    }
  }
  
  closeDropdown(): void {
    if (this.isDropdownOpen) {
      // Dropdown element referansını al
      const dropdownElement = this.elementRef.nativeElement.querySelector('.dropdown-menu');
      
      // Kapanma animasyonu sınıfını ekle
      dropdownElement.classList.add('closing');
      
      // Animasyon süresi kadar bekleyip dropdown'ı kapat
      setTimeout(() => {
        this.isDropdownOpen = false;
        dropdownElement.classList.remove('closing');
      }, 300); // 300ms animasyon süresi
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  closeDropdownAndMenu(): void {
    this.closeDropdown();
    this.closeMenu();
  }
  
  logoutAndCloseAll(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
      // Animasyon süresini bekleyip diğer işlemleri yap
      setTimeout(() => {
        this.closeMenu();
        if (isPlatformBrowser(this.platformId)) {
          localStorage.clear();
        }
        this.authService.logout();
        this.router.navigate(['/']);
        if (isPlatformBrowser(this.platformId)) {
          window.location.reload();
        }
      }, 300);
    } else {
      this.closeMenu();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.clear();
      }
      this.authService.logout();
      this.router.navigate(['/']);
      if (isPlatformBrowser(this.platformId)) {
        window.location.reload();
      }
    }
  }

  getDisplayName(): string {
    if (this.userProfile?.name && this.userProfile?.surname) {
      return `${this.userProfile.name} ${this.userProfile.surname}`;
    }
    return this.userEmail;
  }

  toggleLanguage(): void {
    const newLang = this.currentLanguage === 'tr' ? 'en' : 'tr';
    this.translationService.setLanguage(newLang);
  }

  toggleLanguageAndReload(): void {
    this.toggleLanguage();
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Eğer tıklanan eleman dropdown içinde değilse ve dropdown açıksa, kapat
    if (this.isDropdownOpen && !this.elementRef.nativeElement.querySelector('.user-dropdown').contains(event.target)) {
      this.closeDropdown();
    }
  }
}