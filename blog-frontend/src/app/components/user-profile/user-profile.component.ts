import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { PostResponseDto } from '../../models/post-response.dto';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  filteredPosts: PostResponseDto[] = [];
  isOwnProfile: boolean = true;
  viewedUserEmail: string = '';
  searchQuery: string = '';
  userProfileImage: string | null = null;
  isUploadingImage: boolean = false;
  
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
      email: [{ value: '', disabled: true }],
      name: [''],
      surname: [''],
      phoneNumber: [''],
      gender: [''],
      description: ['']
    });
    
    // Şifre değiştirme formu
    this.passwordForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  ngOnInit(): void {
    // Önce email'i ayarla
    this.userEmail = this.authService.getUserEmail() || '';
    
    this.route.params.subscribe(params => {
      if (params['email']) {
        // URL'den email parametresi alındı, başka bir kullanıcının profili görüntüleniyor
        this.viewedUserEmail = params['email'];
        this.isOwnProfile = this.authService.isLoggedIn() && this.viewedUserEmail === this.userEmail;
        this.loadUserPosts(this.viewedUserEmail);
        this.loadUserProfileByEmail(this.viewedUserEmail);
      } else {
        // Parametre yok, kendi profili görüntüleniyor
        if (!this.authService.isLoggedIn()) {
          this.router.navigate(['/login']);
          return;
        }
        this.isOwnProfile = true;
        this.loadUserPosts(this.userEmail);
        this.loadUserProfile();
      }
    });
  }
  
  loadUserPosts(email: string): void {
    if (!email) {
      console.error('Email adresi bulunamadı');
      return;
    }

    this.userService.getUserProfileByEmail(email).subscribe({
      next: (userData) => {
        if (userData && userData.id) {
          this.postService.getUserPosts(userData.id).subscribe({
            next: (posts) => {
              this.userPosts = posts;
              this.filteredPosts = [...this.userPosts];
            },
            error: (err) => {
              console.error('Yazılar yüklenirken hata oluştu:', err);
              Swal.fire({
                title: 'Hata',
                text: 'Yazılar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.',
                icon: 'error',
                background: '#1a1a2e',
                color: '#ffffff',
                customClass: {
                  popup: 'modern-swal-popup',
                  title: 'modern-swal-title',
                  htmlContainer: 'modern-swal-content'
                }
              });
            }
          });
        } else {
          console.error('Kullanıcı bilgileri bulunamadı');
        }
      },
      error: (err) => {
        console.error('Kullanıcı bilgileri yüklenirken hata oluştu:', err);
        Swal.fire({
          title: 'Hata',
          text: 'Kullanıcı bilgileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.',
          icon: 'error',
          background: '#1a1a2e',
          color: '#ffffff',
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title',
            htmlContainer: 'modern-swal-content'
          }
        });
      }
    });
  }
  
  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe({
      next: (userData) => {
        if (userData) {
          this.accountForm.patchValue({
            username: userData.username || '',
            email: userData.email || '',
            name: userData.name || '',
            surname: userData.surname || '',
            phoneNumber: userData.phoneNumber || '',
            gender: userData.gender || '',
            description: userData.description || ''
          });
          
          if (userData.profileImageUrl) {
            this.userProfileImage = userData.profileImageUrl;
          }

          this.isAdmin = userData.role === 'ADMIN';
        }
      },
      error: (err) => {
        const errorMessage = err.error?.customException?.message || err.error?.message || 'Profil bilgileri yüklenirken bir hata oluştu.';
        Swal.fire({
          title: 'Hata',
          text: errorMessage,
          icon: 'error',
          background: '#1a1a2e',
          color: '#ffffff',
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title',
            htmlContainer: 'modern-swal-content'
          }
        });
      }
    });
  }
  
  loadUserProfileByEmail(email: string): void {
    this.userService.getUserProfileByEmail(email).subscribe({
      next: (userData) => {
        if (userData) {
          this.accountForm.patchValue({
            username: userData.username || '',
            email: userData.email || '',
            name: userData.name || '',
            surname: userData.surname || '',
            phoneNumber: userData.phoneNumber || '',
            gender: userData.gender || '',
            description: userData.description || ''
          });
          
          if (userData.profileImageUrl) {
            this.userProfileImage = userData.profileImageUrl;
          }

          this.isAdmin = userData.role === 'ADMIN';
        }
      },
      error: (err) => {
        const errorMessage = err.error?.customException?.message || err.error?.message || 'Profil bilgileri yüklenirken bir hata oluştu.';
        Swal.fire({
          title: 'Hata',
          text: errorMessage,
          icon: 'error',
          background: '#1a1a2e',
          color: '#ffffff',
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title',
            htmlContainer: 'modern-swal-content'
          }
        });
      }
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
      
      const updateData = {
        email: this.userEmail,
        username: this.accountForm.get('username')?.value,
        name: this.accountForm.get('name')?.value,
        surname: this.accountForm.get('surname')?.value,
        phoneNumber: this.accountForm.get('phoneNumber')?.value,
        gender: this.accountForm.get('gender')?.value,
        description: this.accountForm.get('description')?.value
      };
      
      this.userService.updateUserProfile(updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.updateSuccess = response.message || 'Hesap bilgileriniz başarıyla güncellendi.';
            this.loadUserProfile();
          } else {
            this.updateError = response.message || 'Güncelleme sırasında bir hata oluştu.';
          }
          this.isSubmitting = false;
          
          if (this.updateSuccess) {
            setTimeout(() => {
              this.updateSuccess = '';
            }, 3000);
          }
        },
        error: (err) => {
          this.updateError = err.message || 'Güncelleme sırasında bir hata oluştu.';
          this.isSubmitting = false;
        }
      });
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
            this.passwordResetSuccess = response.message || 'Şifreniz başarıyla değiştirildi.';
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
          // Backend'den gelen detaylı hata mesajını göster
          if (err.error?.customException?.message) {
            // Backend üzerinde oluşturulan özel hata mesajı
            this.passwordResetError = err.error.customException.message;
          } else if (err.error?.message) {
            // Standart hata mesajı
            this.passwordResetError = err.error.message;
          } else if (err.message) {
            // Error sınıfı üzerindeki mesaj
            this.passwordResetError = err.message;
          } else {
            // Genel hata mesajı
            this.passwordResetError = 'Şifre değiştirme sırasında bir hata oluştu. Lütfen tekrar deneyin.';
          }
          
          this.isSubmittingPassword = false;
        }
      });
    }
  }
  
  // Doğrulama kodunu yeniden gönder
  resendPasswordResetCode(): void {
    this.isResendingCode = true;
    this.passwordResetError = '';
    this.passwordResetSuccess = '';
    
    this.authService.forgotPassword(this.userEmail).subscribe({
      next: (response) => {
        if (response.success) {
          this.passwordResetSuccess = response.message || 'Doğrulama kodu tekrar gönderildi. Lütfen e-posta kutunuzu kontrol ediniz.';
        } else {
          this.passwordResetError = response.message || 'Doğrulama kodu gönderilemedi.';
        }
        this.isResendingCode = false;
      },
      error: (err) => {
        // Backend'den gelen detaylı hata mesajını göster
        if (err.error?.customException?.message) {
          // Backend üzerinde oluşturulan özel hata mesajı
          this.passwordResetError = err.error.customException.message;
        } else if (err.error?.message) {
          // Standart hata mesajı
          this.passwordResetError = err.error.message;
        } else if (err.message) {
          // Error sınıfı üzerindeki mesaj
          this.passwordResetError = err.message;
        } else {
          // Genel hata mesajı
          this.passwordResetError = 'Doğrulama kodu gönderilirken bir hata oluştu. Lütfen tekrar deneyin.';
        }
        
        this.isResendingCode = false;
      }
    });
  }
  
  confirmDeletePost(post: PostResponseDto): void {
    Swal.fire({
      title: 'Yazıyı Sil',
      text: `"${post.title}" başlıklı yazıyı silmek istediğinizden emin misiniz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal',
      background: '#1a1a2e',
      color: '#ffffff',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        htmlContainer: 'modern-swal-content',
        confirmButton: 'modern-swal-confirm',
        cancelButton: 'modern-swal-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.postService.deletePost(post.id).subscribe({
          next: () => {
            this.userPosts = this.userPosts.filter(p => p.id !== post.id);
            this.filteredPosts = this.filteredPosts.filter(p => p.id !== post.id);
            Swal.fire({
              title: 'Başarılı',
              text: 'Yazı başarıyla silindi.',
              icon: 'success',
              background: '#1a1a2e',
              color: '#ffffff',
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content'
              }
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Hata',
              text: 'Yazı silinirken bir hata oluştu.',
              icon: 'error',
              background: '#1a1a2e',
              color: '#ffffff',
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content'
              }
            });
          }
        });
      }
    });
  }
  
  confirmDeleteAccount(): void {
    Swal.fire({
      title: 'Hesabı Sil',
      text: 'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal',
      background: '#1a1a2e',
      color: '#ffffff',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        htmlContainer: 'modern-swal-content',
        confirmButton: 'modern-swal-confirm',
        cancelButton: 'modern-swal-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Şifre doğrulama için ikinci bir SweetAlert
        Swal.fire({
          title: 'Şifre Doğrulama',
          text: 'Hesabınızı silmek için şifrenizi girin:',
          input: 'password',
          inputPlaceholder: 'Şifrenizi girin',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Onayla',
          cancelButtonText: 'İptal',
          background: '#1a1a2e',
          color: '#ffffff',
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title',
            htmlContainer: 'modern-swal-content',
            confirmButton: 'modern-swal-confirm',
            cancelButton: 'modern-swal-cancel',
            input: 'modern-swal-input'
          }
        }).then((passwordResult) => {
          if (passwordResult.isConfirmed && passwordResult.value) {
            this.userService.deleteAccount({ email: this.userEmail, password: passwordResult.value }).subscribe({
              next: () => {
                Swal.fire({
                  title: 'Başarılı',
                  text: 'Hesabınız başarıyla silindi. Ana sayfaya yönlendiriliyorsunuz.',
                  icon: 'success',
                  background: '#1a1a2e',
                  color: '#ffffff',
                  customClass: {
                    popup: 'modern-swal-popup',
                    title: 'modern-swal-title',
                    htmlContainer: 'modern-swal-content'
                  }
                }).then(() => {
                  this.authService.logout();
                  this.router.navigate(['/']);
                });
              },
              error: (err) => {
                Swal.fire({
                  title: 'Hata',
                  text: err.error?.message || 'Hesap silinirken bir hata oluştu.',
                  icon: 'error',
                  background: '#1a1a2e',
                  color: '#ffffff',
                  customClass: {
                    popup: 'modern-swal-popup',
                    title: 'modern-swal-title',
                    htmlContainer: 'modern-swal-content'
                  }
                });
              }
            });
          }
        });
      }
    });
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

  searchPosts(): void {
    if (!this.searchQuery.trim()) {
      this.filteredPosts = [...this.userPosts];
      return;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredPosts = this.userPosts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.categoryName.toLowerCase().includes(query)
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        Swal.fire({
          title: 'Hata',
          text: 'Resim boyutu 5MB\'dan küçük olmalıdır.',
          icon: 'error',
          background: '#1a1a2e',
          color: '#ffffff',
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title',
            htmlContainer: 'modern-swal-content'
          }
        });
        return;
      }

      this.isUploadingImage = true;
      this.userService.uploadProfileImage(file).subscribe({
        next: (response) => {
          this.userProfileImage = response.profileImageUrl || null;
          this.isUploadingImage = false;
          
          Swal.fire({
            title: 'Başarılı',
            text: 'Profil resminiz başarıyla güncellendi.',
            icon: 'success',
            background: '#1a1a2e',
            color: '#ffffff',
            customClass: {
              popup: 'modern-swal-popup',
              title: 'modern-swal-title',
              htmlContainer: 'modern-swal-content'
            }
          });
        },
        error: (err) => {
          this.isUploadingImage = false;
          Swal.fire({
            title: 'Hata',
            text: err.error?.message || 'Profil resmi yüklenirken bir hata oluştu.',
            icon: 'error',
            background: '#1a1a2e',
            color: '#ffffff',
            customClass: {
              popup: 'modern-swal-popup',
              title: 'modern-swal-title',
              htmlContainer: 'modern-swal-content'
            }
          });
        }
      });
    }
  }
} 