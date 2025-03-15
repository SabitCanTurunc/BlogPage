import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
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
    .profile-container {
      padding: 3rem 0;
      background-color: #FEFAE0;
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
      background: #fff;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(212, 163, 115, 0.1);
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
      border: 4px solid #D4A373;
      object-fit: cover;
    }
    
    .profile-name {
      color: #2C3E50;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    
    .profile-role {
      color: #D4A373;
      font-size: 1rem;
      margin-bottom: 0;
    }
    
    .profile-stats {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
      padding: 1rem 0;
      border-top: 1px solid rgba(212, 163, 115, 0.2);
      border-bottom: 1px solid rgba(212, 163, 115, 0.2);
    }
    
    .stat-item {
      text-align: center;
      padding: 0 1rem;
    }
    
    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #2C3E50;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #D4A373;
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
    }
    
    .btn-primary {
      background: #D4A373;
      color: #2C3E50;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #CCD5AE;
      transform: translateY(-2px);
    }
    
    .btn-secondary {
      background: #CCD5AE;
      color: #2C3E50;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #E9EDC9;
      transform: translateY(-2px);
    }
    
    .btn-danger {
      background: #E76F51;
      color: white;
    }
    
    .btn-danger:hover:not(:disabled) {
      background: #F4A261;
      transform: translateY(-2px);
    }
    
    .btn-outline {
      background: transparent;
      border: 1px solid #D4A373;
      color: #D4A373;
    }
    
    .btn-outline:hover {
      background: #D4A373;
      color: #2C3E50;
      transform: translateY(-2px);
    }
    
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .profile-content {
      background: #fff;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(212, 163, 115, 0.1);
    }
    
    h3 {
      color: #2C3E50;
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      position: relative;
      padding-bottom: 0.5rem;
    }
    
    h3::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      border-radius: 3px;
    }
    
    .no-posts {
      text-align: center;
      padding: 2rem;
      background: #E9EDC9;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    
    .no-posts p {
      margin-bottom: 1rem;
      color: #2C3E50;
      font-size: 1.1rem;
    }
    
    .posts-list {
      margin-top: 1.5rem;
    }
    
    .post-item {
      background: #E9EDC9;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;
    }
    
    .post-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(212, 163, 115, 0.2);
    }
    
    .post-header {
      flex: 1;
    }
    
    .post-title {
      color: #2C3E50;
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    
    .post-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
    }
    
    .post-date {
      color: #2C3E50;
      opacity: 0.7;
    }
    
    .post-category {
      background: #D4A373;
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      color: #2C3E50;
      font-weight: 500;
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
      color: #2C3E50;
    }
    
    .btn-edit {
      color: #D4A373;
    }
    
    .btn-delete {
      color: #E76F51;
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
      color: #2C3E50;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #D4A373;
      border-radius: 8px;
      font-size: 1rem;
      background: #E9EDC9;
      transition: all 0.3s ease;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #CCD5AE;
      box-shadow: 0 0 0 2px rgba(212, 163, 115, 0.2);
    }
    
    .form-control.is-invalid {
      border-color: #E76F51;
    }
    
    .error-message {
      color: #E76F51;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .form-text {
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .alert {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border-radius: 8px;
    }
    
    .alert-danger {
      background: #FEFAE0;
      color: #E76F51;
      border: 1px solid #E76F51;
    }
    
    .alert-success {
      background: #E9EDC9;
      color: #2C3E50;
      border: 1px solid #CCD5AE;
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
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private postService: PostService,
    private router: Router
  ) {
    this.accountForm = this.fb.group({
      username: ['', [Validators.required]],
      email: [{ value: '', disabled: true }],
      currentPassword: ['', [Validators.required]],
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
      // Burada hesap silme işlemini yapacağız
      alert('Hesap silme işlemi şu anda aktif değil.');
    }
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
} 