import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <a routerLink="/">
              <h1>Blog</h1>
            </a>
          </div>
          
          <nav class="nav-menu">
            <ul class="nav-list">
              <li class="nav-item">
                <a routerLink="/" class="nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Ana Sayfa</a>
              </li>
            </ul>
          </nav>
          
          <div class="auth-buttons" *ngIf="!isLoggedIn">
            <a routerLink="/login" class="btn btn-login">Giriş Yap</a>
            <a routerLink="/signup" class="btn btn-signup">Kayıt Ol</a>
          </div>
          
          <div class="user-menu" *ngIf="isLoggedIn">
            <div class="dropdown" [class.show]="isDropdownOpen">
              <button class="dropdown-toggle" (click)="toggleDropdown()">
                <img [src]="'https://ui-avatars.com/api/?name=' + userEmail" alt="Kullanıcı" class="user-avatar">
                <span class="user-name">{{ userEmail }}</span>
                <i class="fas fa-chevron-down"></i>
              </button>
              <div class="dropdown-menu" [class.show]="isDropdownOpen">
                <a routerLink="/profile" class="dropdown-item" (click)="closeDropdown()">Profilim</a>
                <a routerLink="/create-post" class="dropdown-item" (click)="closeDropdown()">Yeni Yazı</a>
                <a *ngIf="isAdmin" routerLink="/admin" class="dropdown-item" (click)="closeDropdown()">Yönetim Paneli</a>
                <a (click)="logoutAndCloseDropdown()" class="dropdown-item">Çıkış Yap</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: #FEFAE0;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(212, 163, 115, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo a {
      text-decoration: none;
    }
    
    .logo h1 {
      color: #D4A373;
      font-size: 1.8rem;
      margin: 0;
      font-weight: 700;
    }
    
    .nav-menu {
      margin-right: auto;
      margin-left: 2rem;
    }
    
    .nav-list {
      list-style: none;
      display: flex;
      margin: 0;
      padding: 0;
    }
    
    .nav-item {
      margin-right: 1.5rem;
    }
    
    .nav-link {
      color: #2C3E50;
      text-decoration: none;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.3s ease;
      padding: 0.5rem 0;
      position: relative;
    }
    
    .nav-link:hover, .nav-link.active {
      color: #D4A373;
    }
    
    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: #D4A373;
      border-radius: 2px;
    }
    
    .auth-buttons {
      display: flex;
      gap: 1rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
    }
    
    .btn-login {
      background: transparent;
      border: 1px solid #D4A373;
      color: #D4A373;
    }
    
    .btn-login:hover {
      background: #D4A373;
      color: #2C3E50;
    }
    
    .btn-signup {
      background: #D4A373;
      color: #2C3E50;
    }
    
    .btn-signup:hover {
      background: #CCD5AE;
      transform: translateY(-2px);
    }
    
    .user-menu {
      position: relative;
    }
    
    .dropdown {
      position: relative;
    }
    
    .dropdown-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .dropdown-toggle:hover {
      background: rgba(212, 163, 115, 0.1);
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #D4A373;
    }
    
    .user-name {
      color: #2C3E50;
      font-weight: 500;
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(212, 163, 115, 0.2);
      padding: 0.5rem 0;
      min-width: 180px;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: all 0.3s ease;
    }
    
    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    .dropdown-item {
      display: block;
      padding: 0.75rem 1rem;
      color: #2C3E50;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .dropdown-item:hover {
      background: #E9EDC9;
      color: #D4A373;
    }
    
    @media (max-width: 768px) {
      .nav-menu {
        display: none;
      }
      
      .user-name {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userEmail: string = '';
  isAdmin: boolean = false;
  isDropdownOpen: boolean = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userEmail = this.authService.getUserEmail() || '';
        this.isAdmin = this.authService.isAdmin();
      }
    });
  }
  
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }
  
  logoutAndCloseDropdown(): void {
    this.closeDropdown();
    this.authService.logout();
    this.router.navigate(['/']);
  }
} 