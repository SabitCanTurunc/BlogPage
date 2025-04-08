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
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, TranslatePipe],
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
  isUpdating: boolean = false;
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
  
  // Hesap silme formu
  deleteAccountForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private postService: PostService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translationService: TranslationService
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

    // Hesap silme formu
    this.deleteAccountForm = this.fb.group({
      password: ['', [Validators.required]]
    });
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
                title: this.translationService.getTranslation('error'),
                text: this.translationService.getTranslation('post_load_error'),
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
          title: this.translationService.getTranslation('error'),
          text: this.translationService.getTranslation('profile_load_error'),
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
        const errorMessage = err.error?.customException?.message || err.error?.message || this.translationService.getTranslation('profile_load_error');
        Swal.fire({
          title: this.translationService.getTranslation('error'),
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
        const errorMessage = err.error?.customException?.message || err.error?.message || this.translationService.getTranslation('profile_load_error');
        Swal.fire({
          title: this.translationService.getTranslation('error'),
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
  
  updateAccount() {
    if (this.accountForm.valid) {
      this.isUpdating = true;
      
      // Form verisini hazırla
      const formData = {
        email: this.userEmail, // Mevcut kullanıcının email'ini ekle
        username: this.accountForm.get('username')?.value,
        name: this.accountForm.get('name')?.value,
        surname: this.accountForm.get('surname')?.value,
        phoneNumber: this.accountForm.get('phoneNumber')?.value,
        gender: this.accountForm.get('gender')?.value,
        description: this.accountForm.get('description')?.value
      };

      this.userService.updateUserProfile(formData).subscribe({
        next: (response) => {
          this.isUpdating = false;
          Swal.fire({
            title: this.translationService.getTranslation('success'),
            text: this.translationService.getTranslation('account_update_success'),
            icon: 'success',
            confirmButtonText: 'OK'
          });
        },
        error: (error: HttpErrorResponse) => {
          this.isUpdating = false;
          const errorMessage = error.error?.customException?.message || error.error?.message || this.translationService.getTranslation('account_update_error');
          Swal.fire({
            title: this.translationService.getTranslation('error'),
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK'
          });
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
          this.passwordResetSuccess = this.translationService.getTranslation('password_reset_code_sent');
          this.passwordChangeStep = 2;
        } else {
          this.passwordResetError = this.translationService.getTranslation('password_reset_code_error');
        }
        this.isRequestingCode = false;
      },
      error: (err) => {
        this.passwordResetError = this.translationService.getTranslation('password_reset_code_error');
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
          this.passwordResetSuccess = this.translationService.getTranslation('password_update_success');
          this.isSubmittingPassword = false;
          this.passwordChangeStep = 1;
          this.passwordForm.reset();
        },
        error: (error) => {
          const errorMessage = error.error?.customException?.message || 
                               error.error?.message || 
                               this.translationService.getTranslation('password_update_error');
          this.passwordResetError = errorMessage;
          this.isSubmittingPassword = false;
        },
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
          this.passwordResetSuccess = this.translationService.getTranslation('verification_code_resent');
        } else {
          this.passwordResetError = this.translationService.getTranslation('verification_code_resend_error');
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
          this.passwordResetError = this.translationService.getTranslation('verification_code_send_error');
        }
        
        this.isResendingCode = false;
      }
    });
  }
  
  confirmDeletePost(post: PostResponseDto): void {
    Swal.fire({
      title: this.translationService.getTranslation('confirm_delete'),
      text: this.translationService.getTranslation('post_delete_confirm'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translationService.getTranslation('yes'),
      cancelButtonText: this.translationService.getTranslation('no'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.postService.deletePost(post.id).subscribe({
          next: () => {
            this.userPosts = this.userPosts.filter(p => p.id !== post.id);
            this.filteredPosts = this.filteredPosts.filter(p => p.id !== post.id);
            Swal.fire({
              title: this.translationService.getTranslation('success'),
              text: this.translationService.getTranslation('post_delete_success'),
              icon: 'success',
            }).then(() => {
              this.loadUserPosts(this.viewedUserEmail || this.userEmail);
            });
          },
          error: (err) => {
            Swal.fire({
              title: this.translationService.getTranslation('error'),
              text: this.translationService.getTranslation('post_delete_error'),
              icon: 'error',
            });
          }
        });
      }
    });
  }
  
  deleteAccount() {
    if (!this.deleteAccountForm.valid) {
      return;
    }

    const password = this.deleteAccountForm.get('password')?.value;
    if (!password) {
      return;
    }

    Swal.fire({
      title: this.translationService.getTranslation('confirm_delete'),
      text: this.translationService.getTranslation('account_delete_confirm'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translationService.getTranslation('yes'),
      cancelButtonText: this.translationService.getTranslation('no')
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteAccount({
          email: this.userEmail,
          password: password
        }).subscribe({
          next: () => {
            Swal.fire({
              title: this.translationService.getTranslation('success'),
              text: this.translationService.getTranslation('account_delete_success'),
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              this.authService.logout();
              this.router.navigate(['/home']);
            });
          },
          error: (error: HttpErrorResponse) => {
            Swal.fire({
              title: this.translationService.getTranslation('error'),
              text: this.translationService.getTranslation('account_delete_error'),
              icon: 'error',
              confirmButtonText: 'OK'
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

  // Profil resmi yükleme
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: this.translationService.getTranslation('error'),
          text: this.translationService.getTranslation('image_size_error'),
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
      
      // Dosya tipi kontrolü
      if (!file.type.match('image.*')) {
        Swal.fire({
          title: this.translationService.getTranslation('error'),
          text: this.translationService.getTranslation('image_type_error'),
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
          this.isUploadingImage = false;
          if (response && response.profileImageUrl) {
            this.userProfileImage = response.profileImageUrl;
            
            Swal.fire({
              title: this.translationService.getTranslation('success'),
              text: this.translationService.getTranslation('profile_image_updated'),
              icon: 'success',
              background: '#1a1a2e',
              color: '#ffffff',
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content'
              }
            });
          }
        },
        error: (err: any) => {
          this.isUploadingImage = false;
          const errorMessage = err.error?.customException?.message || err.error?.message || this.translationService.getTranslation('profile_image_error');
          
          Swal.fire({
            title: this.translationService.getTranslation('error'),
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
  }
  
  // Profil resmini silme
  deleteProfileImage(): void {
    // Silme işlemi için onay sor
    Swal.fire({
      title: this.translationService.getTranslation('delete_profile_image_title'),
      text: this.translationService.getTranslation('delete_profile_image_text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translationService.getTranslation('yes_delete'),
      cancelButtonText: this.translationService.getTranslation('cancel'),
      background: '#1a1a2e',
      color: '#ffffff',
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        htmlContainer: 'modern-swal-content',
        confirmButton: 'modern-swal-confirm',
        cancelButton: 'modern-swal-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isUploadingImage = true;
        
        this.userService.deleteProfileImage().subscribe({
          next: () => {
            this.isUploadingImage = false;
            this.userProfileImage = null;
            
            Swal.fire({
              title: this.translationService.getTranslation('success'),
              text: this.translationService.getTranslation('profile_image_deleted'),
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
          error: (err: any) => {
            this.isUploadingImage = false;
            const errorMessage = err.error?.customException?.message || err.error?.message || this.translationService.getTranslation('profile_image_delete_error');
            
            Swal.fire({
              title: this.translationService.getTranslation('error'),
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
    });
  }
} 