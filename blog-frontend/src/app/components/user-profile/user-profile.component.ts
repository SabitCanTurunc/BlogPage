import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { PostResponseDto } from '../../models/post-response.dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="container">
        <div class="row">
          <div class="col-md-4">
            <div class="profile-sidebar">
              <div class="profile-header">
                <div class="profile-avatar">
                  <img [src]="'https://ui-avatars.com/api/?name=' + userEmail" alt="Profil" class="avatar">
                </div>
                <h2 class="profile-name">{{ userEmail }}</h2>
                <p class="profile-role">{{ isAdmin ? 'Yönetici' : 'Kullanıcı' }}</p>
              </div>
              
              <div class="profile-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ userPosts.length }}</span>
                  <span class="stat-label">Yazı</span>
                </div>
              </div>
              
              <div class="profile-actions">
                <button class="btn btn-primary" (click)="activeTab = 'posts'">Yazılarım</button>
                <button class="btn btn-secondary" (click)="activeTab = 'account'">Hesap Ayarları</button>
                <button class="btn btn-danger" (click)="confirmDeleteAccount()">Hesabı Sil</button>
                <button class="btn btn-outline" (click)="logout()">Çıkış Yap</button>
              </div>
            </div>
          </div>
          
          <div class="col-md-8">
            <div class="profile-content">
              <!-- Yazılar Sekmesi -->
              <div *ngIf="activeTab === 'posts'" class="posts-tab">
                <h3>Yazılarım</h3>
                
                <div *ngIf="userPosts.length === 0" class="no-posts">
                  <p>Henüz hiç yazı yazmadınız.</p>
                  <a routerLink="/create-post" class="btn btn-primary">Yeni Yazı Oluştur</a>
                </div>
                
                <div *ngIf="userPosts.length > 0" class="posts-list">
                  <a routerLink="/create-post" class="btn btn-primary mb-4">Yeni Yazı Oluştur</a>
                  
                  <div *ngFor="let post of userPosts" class="post-item">
                    <div class="post-header">
                      <h4 class="post-title">{{ post.title }}</h4>
                      <div class="post-meta">
                        <span class="post-date">{{ post.createdAt | date:'dd.MM.yyyy' }}</span>
                        <span class="post-category">{{ post.categoryName }}</span>
                      </div>
                    </div>
                    <div class="post-actions">
                      <a [routerLink]="['/post', post.id]" class="btn-view">Görüntüle</a>
                      <a [routerLink]="['/edit-post', post.id]" class="btn-edit">Düzenle</a>
                      <button (click)="confirmDeletePost(post)" class="btn-delete">Sil</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Hesap Ayarları Sekmesi -->
              <div *ngIf="activeTab === 'account'" class="account-tab">
                <h3>Hesap Ayarları</h3>
                
                <form [formGroup]="accountForm" (ngSubmit)="updateAccount()" class="account-form">
                  <div class="form-group">
                    <label for="username">Kullanıcı Adı</label>
                    <input 
                      type="text" 
                      id="username" 
                      formControlName="username" 
                      class="form-control"
                      [class.is-invalid]="accountForm.get('username')?.invalid && accountForm.get('username')?.touched">
                    <div *ngIf="accountForm.get('username')?.errors?.['required'] && accountForm.get('username')?.touched" class="error-message">
                      Kullanıcı adı gereklidir
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="email">E-posta</label>
                    <input 
                      type="email" 
                      id="email" 
                      formControlName="email" 
                      class="form-control" 
                      [disabled]="true">
                    <small class="form-text text-muted">E-posta adresi değiştirilemez</small>
                  </div>
                  
                  <div class="form-group">
                    <label for="currentPassword">Mevcut Şifre</label>
                    <input 
                      type="password" 
                      id="currentPassword" 
                      formControlName="currentPassword" 
                      class="form-control"
                      [class.is-invalid]="accountForm.get('currentPassword')?.invalid && accountForm.get('currentPassword')?.touched">
                    <div *ngIf="accountForm.get('currentPassword')?.errors?.['required'] && accountForm.get('currentPassword')?.touched" class="error-message">
                      Mevcut şifre gereklidir
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="newPassword">Yeni Şifre</label>
                    <input 
                      type="password" 
                      id="newPassword" 
                      formControlName="newPassword" 
                      class="form-control"
                      [class.is-invalid]="accountForm.get('newPassword')?.invalid && accountForm.get('newPassword')?.touched">
                    <div *ngIf="accountForm.get('newPassword')?.errors?.['minlength'] && accountForm.get('newPassword')?.touched" class="error-message">
                      Şifre en az 6 karakter olmalıdır
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="confirmPassword">Şifre Tekrar</label>
                    <input 
                      type="password" 
                      id="confirmPassword" 
                      formControlName="confirmPassword" 
                      class="form-control"
                      [class.is-invalid]="accountForm.get('confirmPassword')?.invalid && accountForm.get('confirmPassword')?.touched">
                    <div *ngIf="accountForm.get('confirmPassword')?.errors?.['passwordMismatch'] && accountForm.get('confirmPassword')?.touched" class="error-message">
                      Şifreler eşleşmiyor
                    </div>
                  </div>
                  
                  <div *ngIf="updateError" class="alert alert-danger">
                    {{ updateError }}
                  </div>
                  
                  <div *ngIf="updateSuccess" class="alert alert-success">
                    {{ updateSuccess }}
                  </div>
                  
                  <button type="submit" class="btn btn-primary" [disabled]="accountForm.invalid || isSubmitting">
                    {{ isSubmitting ? 'Güncelleniyor...' : 'Güncelle' }}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap');
    
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, rgba(10, 10, 26, 0.95), rgba(20, 20, 40, 0.9));
      padding: 2rem 0;
      font-family: 'Poppins', sans-serif;
    }
    
    .profile-container {
      padding: 3rem 0;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .row {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -15px;
    }
    
    .col-md-4 {
      flex: 0 0 33.333333%;
      max-width: 33.333333%;
      padding: 0 15px;
    }
    
    .col-md-8 {
      flex: 0 0 66.666667%;
      max-width: 66.666667%;
      padding: 0 15px;
    }
    
    .profile-sidebar {
      background: rgba(15, 15, 30, 0.8);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 0 30px rgba(80, 0, 255, 0.3);
      border: 1px solid rgba(255, 0, 230, 0.3);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      margin-bottom: 2rem;
    }
    
    .profile-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .profile-avatar {
      width: 120px;
      height: 120px;
      margin: 0 auto 1.5rem;
    }
    
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 4px solid #ff00e6;
      object-fit: cover;
      box-shadow: 0 0 20px rgba(255, 0, 230, 0.8);
    }
    
    .profile-name {
      color: #ffffff;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }
    
    .profile-role {
      color: #ff00e6;
      font-size: 1rem;
      margin-bottom: 0;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
    }
    
    .profile-stats {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
      padding: 1rem 0;
      border-top: 1px solid rgba(255, 0, 230, 0.3);
      border-bottom: 1px solid rgba(255, 0, 230, 0.3);
    }
    
    .stat-item {
      text-align: center;
      padding: 0 1rem;
    }
    
    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
      text-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #ff00e6;
    }
    
    .profile-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      display: inline-block;
      text-decoration: none;
      position: relative;
      overflow: hidden;
      z-index: 1;
    }
    
    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #5000ff, #ff00e6);
      opacity: 0;
      z-index: -1;
      transition: opacity 0.3s;
    }
    
    .btn:hover:not(:disabled)::before {
      opacity: 1;
    }
    
    .btn-primary {
      background: rgba(80, 0, 255, 0.2);
      color: #ffffff;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
    }
    
    .btn-primary:hover:not(:disabled) {
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
      transform: translateY(-2px);
    }
    
    .btn-secondary {
      background: rgba(255, 0, 230, 0.2);
      color: #ffffff;
      border: 1px solid rgba(80, 0, 255, 0.3);
      box-shadow: 0 0 10px rgba(80, 0, 255, 0.3);
    }
    
    .btn-secondary:hover:not(:disabled) {
      box-shadow: 0 0 15px rgba(80, 0, 255, 0.5);
      transform: translateY(-2px);
    }
    
    .btn-danger {
      background: rgba(255, 0, 100, 0.3);
      color: white;
      border: 1px solid rgba(255, 0, 100, 0.5);
      box-shadow: 0 0 10px rgba(255, 0, 100, 0.3);
    }
    
    .btn-danger:hover:not(:disabled) {
      box-shadow: 0 0 15px rgba(255, 0, 100, 0.5);
      transform: translateY(-2px);
    }
    
    .btn-outline {
      background: transparent;
      border: 1px solid rgba(255, 0, 230, 0.5);
      color: #ff00e6;
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
    }
    
    .btn-outline:hover {
      color: #ffffff;
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
      transform: translateY(-2px);
    }
    
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .profile-content {
      background: rgba(15, 15, 30, 0.8);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 0 30px rgba(80, 0, 255, 0.3);
      border: 1px solid rgba(255, 0, 230, 0.3);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    
    h3 {
      color: #ffffff;
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      position: relative;
      padding-bottom: 0.5rem;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }
    
    h3::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: linear-gradient(45deg, #5000ff, #ff00e6);
      border-radius: 3px;
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }
    
    .no-posts {
      text-align: center;
      padding: 2rem;
      background: rgba(40, 40, 80, 0.5);
      border-radius: 8px;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(80, 0, 255, 0.2);
    }
    
    .no-posts p {
      margin-bottom: 1rem;
      color: #ffffff;
      font-size: 1.1rem;
    }
    
    .posts-list {
      margin-top: 1.5rem;
    }
    
    .post-item {
      background: rgba(40, 40, 80, 0.5);
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 15px rgba(80, 0, 255, 0.2);
    }
    
    .post-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 20px rgba(255, 0, 230, 0.3);
    }
    
    .post-header {
      flex: 1;
    }
    
    .post-title {
      color: #ffffff;
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.5);
    }
    
    .post-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
    }
    
    .post-date {
      color: #ffffff;
      opacity: 0.7;
    }
    
    .post-category {
      background: rgba(80, 0, 255, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      color: #ffffff;
      font-weight: 500;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
    }
    
    .post-actions {
      display: flex;
      gap: 0.75rem;
    }
    
    .btn-view, .btn-edit, .btn-delete {
      background: none;
      border: none;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
    }
    
    .btn-view {
      color: #ffffff;
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
    }
    
    .btn-edit {
      color: #5000ff;
      text-shadow: 0 0 5px rgba(80, 0, 255, 0.8);
    }
    
    .btn-delete {
      color: #ff00e6;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
    }
    
    .btn-view:hover, .btn-edit:hover, .btn-delete:hover {
      text-decoration: underline;
    }
    
    .account-form {
      max-width: 600px;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #ffffff;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid rgba(255, 0, 230, 0.3);
      border-radius: 8px;
      font-size: 1rem;
      background: rgba(40, 40, 80, 0.5);
      color: #ffffff;
      transition: all 0.3s ease;
      box-shadow: 0 0 10px rgba(80, 0, 255, 0.2);
    }
    
    .form-control:focus {
      outline: none;
      border-color: #ff00e6;
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
    }
    
    .form-control.is-invalid {
      border-color: #ff00e6;
      box-shadow: 0 0 15px rgba(255, 0, 100, 0.5);
    }
    
    .error-message {
      color: #ff00e6;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
    }
    
    .form-text {
      font-size: 0.875rem;
      margin-top: 0.25rem;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .alert {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border-radius: 8px;
    }
    
    .alert-danger {
      background: rgba(40, 40, 80, 0.5);
      color: #ff00e6;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
    }
    
    .alert-success {
      background: rgba(40, 40, 80, 0.5);
      color: #00ffaa;
      border: 1px solid rgba(0, 255, 170, 0.3);
      box-shadow: 0 0 10px rgba(0, 255, 170, 0.3);
    }
    
    .mb-4 {
      margin-bottom: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .row {
        flex-direction: column;
      }
      
      .col-md-4, .col-md-8 {
        flex: 0 0 100%;
        max-width: 100%;
      }
      
      .post-item {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .post-actions {
        margin-top: 1rem;
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  activeTab: 'posts' | 'account' = 'posts';
  userEmail: string = '';
  isAdmin: boolean = false;
  userPosts: PostResponseDto[] = [];
  
  accountForm: FormGroup;
  isSubmitting: boolean = false;
  updateError: string = '';
  updateSuccess: string = '';
  shouldValidatePassword: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private postService: PostService,
    private userService: UserService,
    private router: Router
  ) {
    this.accountForm = this.fb.group({
      username: ['', [Validators.required]],
      email: [{ value: '', disabled: true }],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }
  
  ngOnInit(): void {
    this.checkAuth();
    this.loadUserPosts();
    this.loadUserProfile();
  }
  
  checkAuth(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.userEmail = this.authService.getUserEmail() || '';
    this.isAdmin = this.authService.isAdmin();
  }
  
  loadUserPosts(): void {
    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        this.userPosts = posts.filter(post => post.userEmail === this.userEmail);
      },
      error: (err) => {
        console.error('Kullanıcı yazıları yüklenirken hata oluştu:', err);
      }
    });
  }
  
  loadUserProfile(): void {
    // Burada kullanıcı bilgilerini yükleyeceğiz
    // Şimdilik sadece email'i dolduruyoruz
    this.accountForm.patchValue({
      email: this.userEmail
    });
  }
  
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  updateAccount(): void {
    if (this.accountForm.valid) {
      this.isSubmitting = true;
      this.updateError = '';
      this.updateSuccess = '';
      
      // Burada kullanıcı bilgilerini güncelleyeceğiz
      // Şimdilik sadece başarılı mesajı gösteriyoruz
      setTimeout(() => {
        this.updateSuccess = 'Hesap bilgileriniz başarıyla güncellendi.';
        this.isSubmitting = false;
        
        // 3 saniye sonra başarı mesajını kaldır
        setTimeout(() => {
          this.updateSuccess = '';
        }, 3000);
      }, 1000);
    }
  }
  
  confirmDeletePost(post: PostResponseDto): void {
    if (confirm(`"${post.title}" başlıklı yazıyı silmek istediğinizden emin misiniz?`)) {
      this.postService.deletePost(post.id).subscribe({
        next: () => {
          this.userPosts = this.userPosts.filter(p => p.id !== post.id);
        },
        error: (err) => {
          console.error('Yazı silinirken hata oluştu:', err);
        }
      });
    }
  }
  
  confirmDeleteAccount(): void {
    if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      const password = prompt('Hesabınızı silmek için şifrenizi girin:');
      
      if (!password) {
        return; // Kullanıcı iptal etti veya boş şifre girdi
      }
      
      this.userService.deleteAccount({ email: this.userEmail, password }).subscribe({
        next: (response: any) => {
          alert('Hesabınız başarıyla silindi. Ana sayfaya yönlendiriliyorsunuz.');
          this.authService.logout();
          this.router.navigate(['/']);
        },
        error: (err: any) => {
          alert(err.error?.message || 'Hesap silinirken bir hata oluştu.');
        }
      });
    }
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
} 