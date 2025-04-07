import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
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
    @Inject(PLATFORM_ID) private platformId: Object
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
  
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
  closeDropdown(): void {
    this.isDropdownOpen = false;
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.closeDropdown();
    this.closeMenu();
    this.authService.logout();
    this.router.navigate(['/']);
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
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
}