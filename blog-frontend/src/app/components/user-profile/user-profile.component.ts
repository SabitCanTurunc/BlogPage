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
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
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