import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { UserResponseDto } from '../../models/user-response.dto';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
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
    localStorage.clear();
    this.closeDropdown();
    this.closeMenu();
    this.authService.logout();
    this.router.navigate(['/']);
    window.location.reload();
  }

  getDisplayName(): string {
    if (this.userProfile?.name && this.userProfile?.surname) {
      return `${this.userProfile.name} ${this.userProfile.surname}`;
    }
    return this.userEmail;
  }
}