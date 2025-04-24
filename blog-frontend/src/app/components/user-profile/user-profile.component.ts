import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { ImageService } from '../../services/image.service';
import { HighlightService } from '../../services/highlight.service';
import { SubscriptionService } from '../../services/subscription.service';
import { PostResponseDto } from '../../models/post-response.dto';
import { SubscriptionPlan, SubscriptionRequest } from '../../models/subscription-plan.model';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocalDatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, TranslatePipe, LocalDatePipe],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  activeTab: 'posts' | 'account' | 'changePassword' | 'subscription' = 'posts';
  userEmail: string = '';
  isAdmin: boolean = false;
  userPosts: PostResponseDto[] = [];
  filteredPosts: PostResponseDto[] = [];
  isOwnProfile: boolean = true;
  viewedUserEmail: string = '';
  searchQuery: string = '';
  userProfileImage: string | null = null;
  isUploadingImage: boolean = false;
  
  // Abonelik bilgileri
  currentSubscriptionPlan: SubscriptionPlan = SubscriptionPlan.ESSENTIAL;
  targetPlan: SubscriptionPlan | null = null;
  pendingRequests: SubscriptionRequest[] = [];
  isPendingUpgrade: boolean = false;
  isProcessingRequest: boolean = false;
  subscriptionRequests: SubscriptionRequest[] = [];
  
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
  
  // Highlight özellikleri
  highlightedPosts: number[] = []; // Öne çıkarılmış post ID'leri
  dailyHighlightCount: number = 0; // Günlük öne çıkarılan post sayısı
  isHighlighting: boolean = false; // Öne çıkarma işlemi devam ediyor mu?
  highlightingPostId: number | null = null; // Hangi post öne çıkarılıyor?
  
  SubscriptionPlan = SubscriptionPlan; // Enum'u template'de kullanabilmek için
  
  // Abonelik isteklerini yükle
  isRequestFormOpen: boolean = false;
  requestMessage: string = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private postService: PostService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translationService: TranslationService,
    private highlightService: HighlightService,
    private subscriptionService: SubscriptionService
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
        
        // Kendi profili ise, abonelik isteklerini yükle
        this.loadSubscriptionRequests();
      }
    });
    
    // Kendi profili görüntüleniyorsa highlight'ları yükle
    if (this.isOwnProfile) {
      this.loadHighlights();
    }
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
          
          // Abonelik planını ayarla
          if (userData.subscriptionPlan) {
            // Backend plan değerini frontend formatına dönüştür
            const planStr = String(userData.subscriptionPlan);
            console.log('Backend\'den gelen plan:', planStr);
            
            if (planStr === 'PLUS') {
              this.currentSubscriptionPlan = SubscriptionPlan.PREMIUM;
            } else if (planStr === 'MAX') {
              this.currentSubscriptionPlan = SubscriptionPlan.UNLIMITED;
            } else if (planStr === 'ESSENTIAL') {
              this.currentSubscriptionPlan = SubscriptionPlan.ESSENTIAL;
            } else {
              console.warn('Bilinmeyen plan tipi:', planStr);
              this.currentSubscriptionPlan = SubscriptionPlan.ESSENTIAL;
            }
            
            console.log('Ayarlanan frontend plan:', this.currentSubscriptionPlan);
          }
        }
      },
      error: (err) => {
        const errorMessage = err.error?.customException?.message || err.error?.message || this.translationService.getTranslation('profile_load_error');
        Swal.fire({
          title: this.translationService.getTranslation('error'),
          text: errorMessage,
          icon: 'error',
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
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title text-white',
        htmlContainer: 'modern-swal-content text-white',
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
              title: this.translationService.getTranslation('success'),
              text: this.translationService.getTranslation('post_delete_success'),
              icon: 'success',
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title text-white',
                htmlContainer: 'modern-swal-content text-white',
                confirmButton: 'modern-swal-confirm'
              }
            }).then(() => {
              this.loadUserPosts(this.viewedUserEmail || this.userEmail);
            });
          },
          error: (err) => {
            let errorMessage = this.translationService.getTranslation('post_delete_error');
            if (err.status === 409) {
              errorMessage = this.translationService.getTranslation('post_delete_constraint_error') + 
                           ' ' + this.translationService.getTranslation('please_delete_related_data_first');
            } else if (err.status === 0) {
              errorMessage = this.translationService.getTranslation('server_connection_error');
            }
            Swal.fire({
              title: this.translationService.getTranslation('error'),
              text: errorMessage,
              icon: 'error',
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
      cancelButtonText: this.translationService.getTranslation('no'),
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title text-white',
        htmlContainer: 'modern-swal-content text-white',
        confirmButton: 'modern-swal-confirm',
        cancelButton: 'modern-swal-cancel'
      }
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
              confirmButtonText: 'OK',
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content',
                confirmButton: 'modern-swal-confirm'
              }
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
              confirmButtonText: 'OK',
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content',
                confirmButton: 'modern-swal-confirm'
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
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title',
            htmlContainer: 'modern-swal-content',
            confirmButton: 'modern-swal-confirm'
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
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title',
            htmlContainer: 'modern-swal-content',
            confirmButton: 'modern-swal-confirm'
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
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content',
                confirmButton: 'modern-swal-confirm'
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
            customClass: {
              popup: 'modern-swal-popup',
              title: 'modern-swal-title',
              htmlContainer: 'modern-swal-content',
              confirmButton: 'modern-swal-confirm'
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
      backdrop: 'rgba(0,0,0,0.4)',
      background: getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim(),
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title text-white',
        htmlContainer: 'modern-swal-content text-white',
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
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content',
                confirmButton: 'modern-swal-confirm'
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
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content',
                confirmButton: 'modern-swal-confirm'
              }
            });
          }
        });
      }
    });
  }
  
  /**
   * Kullanıcının öne çıkardığı postları yükler
   */
  loadHighlights(): void {
    if (!this.isOwnProfile) return;
    
    this.highlightService.getDailyHighlights().subscribe({
      next: (highlights) => {
        // Günlük highlight sayısını güncelle
        this.dailyHighlightCount = highlights.length;
        
        // Öne çıkarılmış post ID'lerini topla ve diziye ekle
        const highlightedPostIds = highlights.map((highlight: any) => highlight.postId);
        this.highlightedPosts = highlightedPostIds;
        
        // Tüm highlight'ları da yükle
        this.highlightService.getUserHighlights().subscribe({
          next: (allHighlights) => {
            // Tüm highlight'ları diziye ekle (var olanları koruyarak)
            const allHighlightIds = allHighlights.map((highlight: any) => highlight.postId);
            this.highlightedPosts = [...new Set([...this.highlightedPosts, ...allHighlightIds])];
          },
          error: (err) => {
            // Sessizce hata ele al
          }
        });
      },
      error: (err) => {
        // Sessizce hata ele al
      }
    });
  }
  
  /**
   * Bir postu öne çıkarır
   * @param postId Öne çıkarılacak post ID'si
   */
  highlightPost(postId: number): void {
    if (!this.isOwnProfile) {
      this.isHighlighting = false;
      this.highlightingPostId = null;
      return;
    }
    
    // İşlem zaten devam ediyorsa ve farklı bir post işleniyorsa
    if (this.isHighlighting && this.highlightingPostId !== postId) {
      return;
    }
    
    // Günlük limit kontrolü
    if (this.dailyHighlightCount >= 2) {
      Swal.fire({
        title: this.translationService.getTranslation('error'),
        text: this.translationService.getTranslation('daily_highlight_limit_reached'),
        icon: 'error',
        customClass: {
          popup: 'modern-swal-popup',
          title: 'modern-swal-title',
          htmlContainer: 'modern-swal-content',
          confirmButton: 'modern-swal-confirm',
          cancelButton: 'modern-swal-cancel'
        }
      });
      // Limit aşıldıysa isHighlighting'i sıfırla
      this.isHighlighting = false;
      this.highlightingPostId = null;
      return;
    }
    
    this.isHighlighting = true;
    this.highlightingPostId = postId;
    
    this.highlightService.highlightPost(postId).subscribe({
      next: (response) => {
        // Başarılı highlight işlemi
        if (!this.highlightedPosts.includes(postId)) {
          this.highlightedPosts.push(postId);
          this.dailyHighlightCount++;
        }
        
        Swal.fire({
          title: this.translationService.getTranslation('success'),
          text: this.translationService.getTranslation('post_highlighted_success'),
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title',
            htmlContainer: 'modern-swal-content',
            confirmButton: 'modern-swal-confirm'
          }
        });
      },
      error: (err) => {
        Swal.fire({
          title: this.translationService.getTranslation('error'),
          text: err.message || this.translationService.getTranslation('post_highlight_error'),
          icon: 'error',
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title',
            htmlContainer: 'modern-swal-content',
            confirmButton: 'modern-swal-confirm'
          }
        });
      },
      complete: () => {
        this.isHighlighting = false;
        this.highlightingPostId = null;
      }
    });
  }
  
  /**
   * Bir postun öne çıkarılıp çıkarılmadığını kontrol eder
   * @param postId Kontrol edilecek post ID'si
   * @returns Öne çıkarılmış mı?
   */
  isHighlighted(postId: number): boolean {
    // Daha güvenilir kontrol
    if (!this.highlightedPosts || this.highlightedPosts.length === 0) {
      return false;
    }
    return this.highlightedPosts.includes(postId);
  }
  
  /**
   * Postun öne çıkarma durumunu tersine çevirir
   * @param postId Post ID
   */
  toggleHighlight(postId: number): void {
    if (!this.isOwnProfile) {
      return;
    }
    
    // İşlem zaten devam ediyorsa ve farklı bir post işleniyorsa
    if (this.isHighlighting && this.highlightingPostId !== postId) {
      return;
    }
    
    // Aynı post için işlem devam ediyorsa, işlemi sıfırla
    if (this.isHighlighting && this.highlightingPostId === postId) {
      this.isHighlighting = false;
      this.highlightingPostId = null;
      return;
    }
    
    // Öne çıkarılmış mı kontrol et
    const isCurrentlyHighlighted = this.isHighlighted(postId);
    
    // Öne çıkarılmamış ve günlük limit dolmuşsa uyarı göster
    if (!isCurrentlyHighlighted && this.dailyHighlightCount >= 2) {
      Swal.fire({
        title: this.translationService.getTranslation('error'),
        text: this.translationService.getTranslation('daily_highlight_limit_reached'),
        icon: 'error',
        customClass: {
          popup: 'modern-swal-popup',
          title: 'modern-swal-title',
          htmlContainer: 'modern-swal-content',
          confirmButton: 'modern-swal-confirm',
          cancelButton: 'modern-swal-cancel'
        }
      });
      return;
    }
    
    // İşlemi görsel olarak başlat
    this.isHighlighting = true;
    this.highlightingPostId = postId;
    
    if (isCurrentlyHighlighted) {
      // Öne çıkarmayı iptal et
      this.removeHighlight(postId);
    } else {
      // Öne çıkar
      this.highlightPost(postId);
    }
  }
  
  /**
   * Bir postun öne çıkarmasını kaldırır
   * @param postId Öne çıkarması kaldırılacak post ID'si
   */
  removeHighlight(postId: number): void {
    if (!this.isOwnProfile) {
      this.isHighlighting = false;
      this.highlightingPostId = null;
      return;
    }
    
    // İşlem zaten devam ediyorsa ve farklı bir post işleniyorsa
    if (this.isHighlighting && this.highlightingPostId !== postId) {
      return;
    }
    
    // Silme işlemi için son kontrol modal'ı ekleyelim
    const makeDeleteRequest = () => {
      this.highlightService.removePostHighlight(postId).subscribe({
        next: () => {
          // Diziden postId'yi kaldır
          this.highlightedPosts = this.highlightedPosts.filter(id => id !== postId);
          
          // Günlük sayıyı güncelle
          if (this.dailyHighlightCount > 0) {
            this.dailyHighlightCount--;
          }
          
          Swal.fire({
            title: this.translationService.getTranslation('success'),
            text: this.translationService.getTranslation('highlight_removed_success') || 'Öne çıkarma başarıyla kaldırıldı',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              popup: 'modern-swal-popup',
              title: 'modern-swal-title',
              htmlContainer: 'modern-swal-content',
              confirmButton: 'modern-swal-confirm'
            }
          });
        },
        error: (err: any) => {
          Swal.fire({
            title: this.translationService.getTranslation('error'),
            text: err.message || this.translationService.getTranslation('highlight_remove_error') || 'Öne çıkarma kaldırılırken bir hata oluştu',
            icon: 'error',
            customClass: {
              popup: 'modern-swal-popup',
              title: 'modern-swal-title text-white',
              htmlContainer: 'modern-swal-content text-white',
              confirmButton: 'modern-swal-confirm'
            }
          });
          
          // Hata sonrasında sayfayı yenilemeyi teklif et
          if (err.message && err.message.includes('bulunamadı')) {
            setTimeout(() => {
              Swal.fire({
                title: 'Sayfa Yenilensin mi?',
                text: 'En güncel verileri görmek için sayfayı yenilemek isteyebilirsiniz.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sayfayı Yenile',
                cancelButtonText: 'Vazgeç',
                customClass: {
                  popup: 'modern-swal-popup',
                  title: 'modern-swal-title text-white',
                  htmlContainer: 'modern-swal-content text-white',
                  confirmButton: 'modern-swal-confirm',
                  cancelButton: 'modern-swal-cancel'
                }
              }).then((result) => {
                if (result.isConfirmed) {
                  window.location.reload();
                }
              });
            }, 1500);
          }
        },
        complete: () => {
          this.isHighlighting = false;
          this.highlightingPostId = null;
        }
      });
    };
    
    // Fonksiyonu çağıralım
    makeDeleteRequest();
  }

  // Abonelik ile ilgili metotlar
  loadSubscriptionRequests(): void {
    this.subscriptionService.getUserRequests().subscribe({
      next: (requests) => {
        // PENDING ve REJECTED durumundaki istekleri filtrele
        this.subscriptionRequests = requests.filter(request => 
          request.status === 'PENDING' || request.status === 'REJECTED'
        );
        // Sadece bekleyen istekler için isPendingUpgrade değerini ayarla
        this.isPendingUpgrade = requests.filter(request => request.status === 'PENDING').length > 0;
      },
      error: (err) => {
        console.error('Abonelik istekleri yüklenirken hata oluştu:', err);
      }
    });
  }

  // Plan kartı sınıfını belirle (mevcut plan vb.)
  getSubscriptionPlanClass(plan?: SubscriptionPlan): string {
    if (!plan) return '';
    
    const planClass = 
      plan === SubscriptionPlan.ESSENTIAL ? 'plan-essential' : 
      plan === SubscriptionPlan.PREMIUM ? 'plan-premium' : 'plan-unlimited';
    
    if (plan === this.currentSubscriptionPlan) {
      return `${planClass} current`;
    }
    
    return planClass;
  }

  // Plan adını almak için
  getSubscriptionPlanLabel(plan?: SubscriptionPlan): string {
    if (!plan) plan = this.currentSubscriptionPlan;
    
    switch (plan) {
      case SubscriptionPlan.ESSENTIAL:
        return this.translationService.getTranslation('essential_plan');
      case SubscriptionPlan.PREMIUM:
        return this.translationService.getTranslation('premium_plan');
      case SubscriptionPlan.UNLIMITED:
        return this.translationService.getTranslation('unlimited_plan');
      default:
        return this.translationService.getTranslation('essential_plan');
    }
  }

  // Temel plana düşürme
  downgradeToEssential(): void {
    this.requestPlanUpgrade(SubscriptionPlan.ESSENTIAL);
  }

  // Plan yükseltme isteği oluştur
  requestPlanUpgrade(targetPlan: SubscriptionPlan): void {
    this.targetPlan = targetPlan;
    this.requestMessage = '';
    this.isRequestFormOpen = true;
  }

  // Yükseltme isteğini onayla
  confirmUpgrade(): void {
    if (!this.targetPlan) return;
    
    this.isProcessingRequest = true;
    
    const request: SubscriptionRequest = {
      requestedPlan: this.targetPlan,
      message: this.requestMessage
    };
    
    this.subscriptionService.createSubscriptionRequest(request).subscribe({
      next: (response) => {
        this.isProcessingRequest = false;
        this.isRequestFormOpen = false;
        
        // İstek listesini yenile
        this.loadSubscriptionRequests();
        
        // Bildirim göster
        Swal.fire({
          title: this.translationService.getTranslation('success'),
          text: this.translationService.getTranslation('upgrade_request_success'),
          icon: 'success',
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title',
            htmlContainer: 'modern-swal-content'
          }
        });
      },
      error: (err) => {
        this.isProcessingRequest = false;
        
        const errorMessage = err.error?.customException?.message || 
                             err.error?.message || 
                             this.translationService.getTranslation('upgrade_request_error');
        
        Swal.fire({
          title: this.translationService.getTranslation('error'),
          text: errorMessage,
          icon: 'error',
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title',
            htmlContainer: 'modern-swal-content'
          }
        });
      }
    });
  }

  // Yükseltme isteğini iptal et
  cancelUpgrade(): void {
    this.isRequestFormOpen = false;
    this.targetPlan = null;
    this.requestMessage = '';
  }

  // İstek iptalini onayla
  cancelRequest(requestId: number): void {
    if (!requestId) return;
    
    Swal.fire({
      title: this.translationService.getTranslation('confirm_cancel_request'),
      text: this.translationService.getTranslation('cancel_request_description'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translationService.getTranslation('yes'),
      cancelButtonText: this.translationService.getTranslation('no'),
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        htmlContainer: 'modern-swal-content'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isProcessingRequest = true;
        
        this.subscriptionService.cancelRequest(requestId).subscribe({
          next: () => {
            this.isProcessingRequest = false;
            
            // İstek listesini yenile
            this.loadSubscriptionRequests();
            
            Swal.fire({
              title: this.translationService.getTranslation('success'),
              text: this.translationService.getTranslation('cancel_request_success'),
              icon: 'success',
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content'
              }
            });
          },
          error: (err) => {
            this.isProcessingRequest = false;
            
            const errorMessage = err.error?.customException?.message || 
                                err.error?.message || 
                                this.translationService.getTranslation('cancel_request_error');
            
            Swal.fire({
              title: this.translationService.getTranslation('error'),
              text: errorMessage,
              icon: 'error',
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

  // Reddedilen isteği sil
  deleteRequest(requestId: number): void {
    if (!requestId) return;
    
    Swal.fire({
      title: this.translationService.getTranslation('confirm_delete'),
      text: this.translationService.getTranslation('confirm_delete'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translationService.getTranslation('yes'),
      cancelButtonText: this.translationService.getTranslation('no'),
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        htmlContainer: 'modern-swal-content'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isProcessingRequest = true;
        
        this.subscriptionService.deleteRequest(requestId).subscribe({
          next: () => {
            this.isProcessingRequest = false;
            
            // İstek listesini yenile
            this.loadSubscriptionRequests();
            
            Swal.fire({
              title: this.translationService.getTranslation('success'),
              text: this.translationService.getTranslation('delete_success'),
              icon: 'success',
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content'
              }
            });
          },
          error: (err: any) => {
            this.isProcessingRequest = false;
            
            const errorMessage = err.error?.customException?.message || 
                                err.error?.message || 
                                'İstek silinirken bir hata oluştu';
            
            Swal.fire({
              title: this.translationService.getTranslation('error'),
              text: errorMessage,
              icon: 'error',
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