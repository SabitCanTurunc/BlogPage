import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  activeTab: 'posts' | 'account' | 'changePassword' = 'posts';
  userEmail: string = '';
  isAdmin: boolean = false;
  userPosts: PostResponseDto[] = [];
  isOwnProfile: boolean = true;
  viewedUserEmail: string = '';
  
  // Hesap güncelleme formu
  accountForm: FormGroup;
  isSubmitting: boolean = false;
  updateError: string = '';
  updateSuccess: string = '';
  
  // Şifre değiştirme
  passwordChangeStep: number = 1;
  passwordForm: FormGroup;
  isSubmittingPassword: boolean = false;
  isRequestingCode: boolean = false;
  isResendingCode: boolean = false;
  passwordResetError: string = '';
  passwordResetSuccess: string = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private postService: PostService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Hesap formu
    this.accountForm = this.fb.group({
      username: ['', [Validators.required]],
      email: [{ value: '', disabled: true }]
    });
    
    // Şifre değiştirme formu
    this.passwordForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['email']) {
        // URL'den email parametresi alındı, başka bir kullanıcının profili görüntüleniyor
        this.viewedUserEmail = params['email'];
        this.isOwnProfile = this.viewedUserEmail === this.authService.getUserEmail();
        this.checkAuth();
        this.loadUserPosts(this.viewedUserEmail);
      } else {
        // Parametre yok, kendi profili görüntüleniyor
        this.isOwnProfile = true;
        this.checkAuth();
        this.loadUserPosts(this.userEmail);
      }
      
      if (this.isOwnProfile) {
        this.loadUserProfile();
      }
    });
  }
  
  checkAuth(): void {
    if (this.isOwnProfile && !this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.userEmail = this.authService.getUserEmail() || '';
    this.isAdmin = this.authService.isAdmin();
  }
  
  loadUserPosts(email: string): void {
    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        this.userPosts = posts.filter(post => post.userEmail === email);
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
  
  // Şifre değiştirme için doğrulama kodu iste
  requestPasswordResetCode(): void {
    this.isRequestingCode = true;
    this.passwordResetError = '';
    this.passwordResetSuccess = '';
    
    this.authService.forgotPassword(this.userEmail).subscribe({
      next: (response) => {
        if (response.success) {
          this.passwordResetSuccess = 'Doğrulama kodu e-posta adresinize gönderildi.';
          this.passwordChangeStep = 2;
        } else {
          this.passwordResetError = response.message || 'Doğrulama kodu gönderilirken bir hata oluştu.';
        }
        this.isRequestingCode = false;
      },
      error: (err) => {
        this.passwordResetError = err.message || 'Doğrulama kodu gönderilirken bir hata oluştu.';
        this.isRequestingCode = false;
      }
    });
  }
  
  // Doğrulama kodunu yeniden gönder
  resendPasswordResetCode(): void {
    this.isResendingCode = true;
    this.passwordResetError = '';
    this.passwordResetSuccess = '';
    
    this.authService.forgotPassword(this.userEmail).subscribe({
      next: (response) => {
        if (response.success) {
          this.passwordResetSuccess = 'Doğrulama kodu tekrar gönderildi. Lütfen e-posta kutunuzu kontrol ediniz.';
        } else {
          this.passwordResetError = response.message || 'Doğrulama kodu gönderilemedi.';
        }
        this.isResendingCode = false;
      },
      error: (err) => {
        this.passwordResetError = err.message || 'Doğrulama kodu gönderilirken bir hata oluştu.';
        this.isResendingCode = false;
      }
    });
  }
  
  // Şifre değiştirme işlemi
  updatePassword(): void {
    if (this.passwordForm.valid) {
      this.isSubmittingPassword = true;
      this.passwordResetError = '';
      this.passwordResetSuccess = '';
      
      const verificationCode = this.passwordForm.get('verificationCode')?.value;
      const newPassword = this.passwordForm.get('newPassword')?.value;
      
      this.authService.resetPassword(this.userEmail, verificationCode, newPassword).subscribe({
        next: (response) => {
          if (response.success) {
            this.passwordResetSuccess = 'Şifreniz başarıyla değiştirildi.';
            this.passwordForm.reset();
            
            // 3 saniye sonra adım 1'e dön
            setTimeout(() => {
              this.passwordChangeStep = 1;
              this.passwordResetSuccess = '';
              this.activeTab = 'posts';
            }, 3000);
          } else {
            this.passwordResetError = response.message || 'Şifre değiştirme başarısız oldu.';
          }
          this.isSubmittingPassword = false;
        },
        error: (err) => {
          this.passwordResetError = err.message || 'Şifre değiştirme sırasında bir hata oluştu.';
          this.isSubmittingPassword = false;
        }
      });
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

  getDisplayedEmail(): string {
    // İzlenen profil başkasına aitse o profili göster, yoksa kendi profilini
    const emailToDisplay = this.viewedUserEmail || this.userEmail;
    
    if (!emailToDisplay) {
      return 'Kullanıcı';
    }
    
    // E-posta adresini @ karakterine kadar kısalt (çok uzunsa)
    const atIndex = emailToDisplay.indexOf('@');
    if (atIndex > 15) {
      return emailToDisplay.substring(0, 12) + '...' + 
             emailToDisplay.substring(atIndex - 3, atIndex) + 
             emailToDisplay.substring(atIndex);
    }
    
    return emailToDisplay;
  }
} 