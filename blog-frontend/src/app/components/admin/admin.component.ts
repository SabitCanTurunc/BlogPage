import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { UserResponseDto } from '../../models/user-response.dto';
import { UserRequestDto } from '../../models/user-request.dto';
import { CategoryService } from '../../services/category.service';
import { CategoryResponseDto } from '../../models/category-response.dto';
import { CategoryRequestDto } from '../../models/category-request.dto';
import { PostService } from '../../services/post.service';
import { PostResponseDto } from '../../models/post-response.dto';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocalDatePipe } from '../../pipes/translate.pipe';
import { UserService } from '../../services/user.service';
import { TranslationService } from '../../services/translation.service';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionPlan, SubscriptionRequest } from '../../models/subscription-plan.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe, LocalDatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  users: UserResponseDto[] = [];
  filteredUsers: UserResponseDto[] = [];
  categories: CategoryResponseDto[] = [];
  filteredCategories: CategoryResponseDto[] = [];
  posts: PostResponseDto[] = [];
  filteredPosts: PostResponseDto[] = [];
  isAdmin: boolean = false;
  currentUserId: number | null = null;
  newCategoryName: string = '';
  selectedSection: 'users' | 'categories' | 'posts' | 'subscriptions' = 'users';
  userChanges: Map<number, string> = new Map();
  categoryChanges: Map<number, string> = new Map();
  userEnabledChanges: Map<number, boolean> = new Map();
  userSearchQuery: string = '';
  categorySearchQuery: string = '';
  postSearchQuery: string = '';
  subscriptionTab: 'pending' | 'all' = 'pending';
  pendingSubscriptionRequests: SubscriptionRequest[] = [];
  allSubscriptionRequests: SubscriptionRequest[] = [];

  constructor(
    private adminService: AdminService,
    private categoryService: CategoryService,
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService,
    private translationService: TranslationService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit() {
    this.checkAdminAccess();
  }

  checkAdminAccess() {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getUserId();
    
    if (!this.isAdmin) {
      return;
    }

    this.loadUsers();
    this.loadCategories();
    this.loadPosts();
    this.loadPendingSubscriptionRequests();
    this.loadAllSubscriptionRequests();
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (data: UserResponseDto[]) => {
        this.users = data;
        this.filteredUsers = [...this.users];
      },
      error: (err: any) => {
        if (err.status === 403) {
          this.router.navigate(['/login']);
        }
        this.toastr.error('Kullanıcılar yüklenirken bir hata oluştu');
      }
    });
  }

  updateUserRole(userId: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value;
    
    const userRequestDto: UserRequestDto = {
      role: newRole
    };

    this.adminService.updateUserRole(userId, userRequestDto).subscribe({
      next: (updatedUser: UserResponseDto) => {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
      },
      error: (error: any) => {
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  deleteUser(userId: number): void {
    Swal.fire({
      title: 'Kullanıcıyı Sil',
      text: 'Bu kullanıcıyı silmek istediğinizden emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal',
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
        this.adminService.deleteUser(userId).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== userId);
            
            Swal.fire({
              title: 'Başarılı',
              text: 'Kullanıcı başarıyla silindi',
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              backdrop: 'rgba(0,0,0,0.4)',
              background: getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim(),
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title text-white',
                htmlContainer: 'modern-swal-content text-white'
              }
            });
          },
          error: (err) => {
            let errorMessage = 'Kullanıcı silinirken bir hata oluştu';
            
            if (err.error?.message) {
              errorMessage = err.error.message;
            }
            
            Swal.fire({
              title: 'Hata',
              text: errorMessage,
              icon: 'error',
              backdrop: 'rgba(0,0,0,0.4)',
              background: getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim(),
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title text-white',
                htmlContainer: 'modern-swal-content text-white'
              }
            });
          }
        });
      }
    });
  }

  isCurrentUser(userId: number): boolean {
    return this.currentUserId === userId;
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (data: CategoryResponseDto[]) => {
        this.categories = data;
        this.filteredCategories = [...this.categories];
      },
      error: (err: any) => {
        this.toastr.error('Kategoriler yüklenirken bir hata oluştu');
      }
    });
  }

  createCategory() {
    if (!this.newCategoryName.trim()) {
      this.toastr.warning('Kategori adı boş olamaz');
      return;
    }

    const categoryRequest: CategoryRequestDto = {
      name: this.newCategoryName
    };

    this.categoryService.createCategory(categoryRequest).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.loadCategories();
        this.toastr.success('Yeni kategori başarıyla oluşturuldu');
      },
      error: (err) => {
        console.error('Error creating category', err);
        this.toastr.error('Kategori oluşturulurken bir hata oluştu');
      }
    });
  }

  updateCategory(category: CategoryResponseDto) {
    const categoryRequestDto: CategoryRequestDto = {
      name: category.name.trim()
    };

    this.categoryService.updateCategory(category.id, categoryRequestDto).subscribe({
      next: (updatedCategory) => {
        const index = this.categories.findIndex(c => c.id === category.id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
      },
      error: (error) => {
        console.error('Kategori güncellenirken hata:', error);
      }
    });
  }

  deleteCategory(categoryId: number) {
    Swal.fire({
      title: 'Kategoriyi Sil',
      text: 'Bu kategoriyi silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal',
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
        this.categoryService.deleteCategory(categoryId).subscribe({
          next: () => {
            this.loadCategories();
            this.toastr.success('Kategori başarıyla silindi', 'Başarılı', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              progressBar: true
            });
          },
          error: (err) => {
            console.error('Error deleting category', err);
            this.toastr.error('Kategori silinirken bir hata oluştu', 'Hata', {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true
            });
          }
        });
      }
    });
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.filteredPosts = [...this.posts];
      },
      error: (err) => {
        console.error('Error fetching posts', err);
        this.toastr.error('Gönderiler yüklenirken bir hata oluştu');
      }
    });
  }

  editPost(id: number) {
    this.router.navigate(['/edit-post', id]);
  }

  deletePost(postId: number) {
    Swal.fire({
      title: 'Gönderiyi Sil',
      text: 'Bu gönderiyi silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal',
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
        this.postService.deletePost(postId).subscribe({
          next: () => {
            this.loadPosts();
            this.toastr.success('Gönderi başarıyla silindi', 'Başarılı', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              progressBar: true
            });
          },
          error: (err) => {
            console.error('Error deleting post', err);
            this.toastr.error('Gönderi silinirken bir hata oluştu', 'Hata', {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true
            });
          }
        });
      }
    });
  }

  selectSection(section: string) {
    this.selectedSection = section as 'users' | 'categories' | 'posts' | 'subscriptions';
  }

  saveAllUserChanges() {
    if (this.userChanges.size === 0 && this.userEnabledChanges.size === 0) {
      this.toastr.info('Kaydedilecek kullanıcı değişikliği bulunmuyor');
      return;
    }

    const updateRolePromises = Array.from(this.userChanges.entries()).map(([userId, newRole]) => {
      const userRequest: UserRequestDto = {
        username: this.users.find(u => u.id === userId)?.username || '',
        email: this.users.find(u => u.id === userId)?.email || '',
        role: newRole
      };
      return firstValueFrom(this.adminService.updateUserRole(userId, userRequest));
    });

    const updateEnabledPromises = Array.from(this.userEnabledChanges.entries()).map(([userId, enabled]) => {
      return firstValueFrom(this.adminService.updateUserEnabled(userId, enabled));
    });

    Promise.all([...updateRolePromises, ...updateEnabledPromises])
      .then(() => {
        this.loadUsers();
        this.userChanges.clear();
        this.userEnabledChanges.clear();
        this.toastr.success('Tüm kullanıcı değişiklikleri başarıyla kaydedildi', 'Başarılı', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
          progressBar: true
        });
      })
      .catch(error => {
        console.error('Error updating users:', error);
        this.toastr.error('Kullanıcı değişiklikleri kaydedilirken bir hata oluştu', 'Hata', {
          timeOut: 5000,
          positionClass: 'toast-top-right',
          progressBar: true
        });
      });
  }

  saveAllCategoryChanges() {
    if (this.categoryChanges.size === 0) {
      this.toastr.info('Kaydedilecek kategori değişikliği bulunmuyor', 'Bilgi', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        progressBar: true
      });
      return;
    }

    const updatePromises = Array.from(this.categoryChanges.entries()).map(([categoryId, newName]) => {
      const categoryRequest: CategoryRequestDto = {
        name: newName.trim()
      };
      return firstValueFrom(this.categoryService.updateCategory(categoryId, categoryRequest));
    });

    Promise.all(updatePromises)
      .then(() => {
        this.loadCategories();
        this.categoryChanges.clear();
        this.toastr.success('Tüm kategori değişiklikleri başarıyla kaydedildi', 'Başarılı', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
          progressBar: true
        });
      })
      .catch(error => {
        console.error('Error updating categories:', error);
        this.toastr.error('Kategori değişiklikleri kaydedilirken bir hata oluştu', 'Hata', {
          timeOut: 5000,
          positionClass: 'toast-top-right',
          progressBar: true
        });
      });
  }

  onUserRoleChange(userId: number, event: any) {
    const newRole = event.target?.value;
    if (newRole) {
      this.userChanges.set(userId, newRole);
    }
  }

  onCategoryNameChange(categoryId: number, event: any) {
    const newName = event.target?.value;
    if (newName) {
      this.categoryChanges.set(categoryId, newName);
    }
  }

  hasUserChanges(): boolean {
    return this.userChanges.size > 0 || this.userEnabledChanges.size > 0;
  }

  hasCategoryChanges(): boolean {
    return this.categoryChanges.size > 0;
  }

  onUserEnabledChange(userId: number, event: any) {
    if (this.isCurrentUser(userId)) {
      this.toastr.warning('Kendi hesabınızın durumunu değiştiremezsiniz');
      return;
    }
    
    const enabled = event.target?.checked;
    if (enabled !== undefined) {
      this.userEnabledChanges.set(userId, enabled);
      
      // UI'da değişikliği hemen göster (kaydedilmemiş olsa bile)
      const index = this.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        this.users[index] = {...this.users[index], enabled};
      }
    }
  }

  toggleUserEnabled(userId: number, enabled: boolean) {
    if (this.isCurrentUser(userId)) {
      this.toastr.warning('Kendi hesabınızın durumunu değiştiremezsiniz');
      return;
    }

    this.userEnabledChanges.set(userId, enabled);
    
    // UI'da değişikliği hemen göster (kaydedilmemiş olsa bile)
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index] = {...this.users[index], enabled};
    }
  }

  searchUsers(): void {
    if (!this.userSearchQuery.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }
    
    const query = this.userSearchQuery.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }
  
  searchCategories(): void {
    if (!this.categorySearchQuery.trim()) {
      this.filteredCategories = [...this.categories];
      return;
    }
    
    const query = this.categorySearchQuery.toLowerCase().trim();
    this.filteredCategories = this.categories.filter(category => 
      category.name.toLowerCase().includes(query)
    );
  }
  
  searchPosts(): void {
    if (!this.postSearchQuery.trim()) {
      this.filteredPosts = [...this.posts];
      return;
    }
    
    const query = this.postSearchQuery.toLowerCase().trim();
    this.filteredPosts = this.posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.userEmail.toLowerCase().includes(query) ||
      post.categoryName.toLowerCase().includes(query)
    );
  }

  // Subscription Management
  setSubscriptionTab(tab: 'pending' | 'all'): void {
    this.subscriptionTab = tab;
  }

  loadPendingSubscriptionRequests(): void {
    this.subscriptionService.getAllPendingRequests().subscribe({
      next: (requests) => {
        this.pendingSubscriptionRequests = requests;
      },
      error: (err) => {
        console.error('Bekleyen abonelik istekleri yüklenemedi:', err);
        this.showError('admin_load_requests_error');
      }
    });
  }

  loadAllSubscriptionRequests(): void {
    this.subscriptionService.getAllRequests().subscribe({
      next: (requests) => {
        this.allSubscriptionRequests = requests;
      },
      error: (err) => {
        console.error('Tüm abonelik istekleri yüklenemedi:', err);
        this.showError('admin_load_requests_error');
      }
    });
  }

  approveRequest(requestId: number): void {
    if (!requestId) return;
    
    const request = this.pendingSubscriptionRequests.find(r => r.id === requestId);
    if (!request) return;
    
    this.subscriptionService.processRequest(requestId, true, request.adminNote || '').subscribe({
      next: (response) => {
        this.showSuccess('admin_request_approved');
        this.loadPendingSubscriptionRequests();
        this.loadAllSubscriptionRequests();
      },
      error: (err) => {
        console.error('Abonelik isteği onaylanamadı:', err);
        this.showError('admin_approve_request_error');
      }
    });
  }

  rejectRequest(requestId: number): void {
    if (!requestId) return;
    
    const request = this.pendingSubscriptionRequests.find(r => r.id === requestId);
    if (!request) return;
    
    this.subscriptionService.processRequest(requestId, false, request.adminNote || '').subscribe({
      next: (response) => {
        this.showSuccess('admin_request_rejected');
        this.loadPendingSubscriptionRequests();
        this.loadAllSubscriptionRequests();
      },
      error: (err) => {
        console.error('Abonelik isteği reddedilemedi:', err);
        this.showError('admin_reject_request_error');
      }
    });
  }

  // Mesaj detayını göstermek için dialog
  showMessageDialog(message: string): void {
    console.log('showMessageDialog çağrıldı, mesaj:', message);
    Swal.fire({
      title: this.translationService.getTranslation('admin_message'),
      html: `<div class="message-dialog-content">${message}</div>`,
      confirmButtonText: this.translationService.getTranslation('close'),
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        htmlContainer: 'modern-swal-content message-dialog'
      }
    });
  }

  getPlanClass(plan: SubscriptionPlan | undefined): string {
    if (!plan) return '';
    
    switch(plan) {
      case SubscriptionPlan.ESSENTIAL:
        return 'plan-essential';
      case SubscriptionPlan.PLUS:
        return 'plan-premium';
      case SubscriptionPlan.MAX:
        return 'plan-unlimited';
      default:
        return '';
    }
  }

  getPlanDisplayName(plan: SubscriptionPlan | undefined): string {
    if (!plan) return '';
    
    const translations = {
      [SubscriptionPlan.ESSENTIAL]: this.translationService.getTranslation('essential_plan'),
      [SubscriptionPlan.PLUS]: this.translationService.getTranslation('premium_plan'),
      [SubscriptionPlan.MAX]: this.translationService.getTranslation('unlimited_plan')
    };
    
    return translations[plan] || String(plan);
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    
    switch(status) {
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  }

  getStatusDisplayName(status: string | undefined): string {
    if (!status) return '';
    
    if (status === 'PENDING') {
      return this.translationService.getTranslation('pending');
    } else if (status === 'APPROVED') {
      return this.translationService.getTranslation('approved');
    } else if (status === 'REJECTED') {
      return this.translationService.getTranslation('rejected');
    }
    
    return status;
  }

  // Toast notification helpers
  showSuccess(messageKey: string): void {
    const message = this.translationService.getTranslation(messageKey);
    this.toastr.success(message);
  }

  showError(messageKey: string): void {
    const message = this.translationService.getTranslation(messageKey);
    this.toastr.error(message);
  }
} 