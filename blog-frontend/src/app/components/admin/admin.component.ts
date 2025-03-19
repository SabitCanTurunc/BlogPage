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

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
  selectedSection: string = 'users';
  userChanges: Map<number, string> = new Map();
  categoryChanges: Map<number, string> = new Map();
  userEnabledChanges: Map<number, boolean> = new Map();
  userSearchQuery: string = '';
  categorySearchQuery: string = '';
  postSearchQuery: string = '';

  constructor(
    private adminService: AdminService,
    private categoryService: CategoryService,
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.checkAdminAccess();
  }

  checkAdminAccess() {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getUserId();
    
    if (!this.isAdmin) {
      console.log('Yetkisiz erişim denemesi');
      return;
    }

    console.log('Admin erişimi onaylandı');
    this.loadUsers();
    this.loadCategories();
    this.loadPosts();
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
        console.error('Error fetching users', err);
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
        console.log('Kullanıcı rolü güncellendi:', updatedUser);
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
      },
      error: (error: any) => {
        console.error('Rol güncellenirken hata:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  deleteUser(userId: number) {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          this.toastr.success('Kullanıcı başarıyla silindi');
        },
        error: (err) => {
          console.error('Error deleting user', err);
          this.toastr.error('Kullanıcı silinirken bir hata oluştu');
        }
      });
    }
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
        console.error('Error fetching categories', err);
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
        console.log('Kategori güncellendi:', updatedCategory);
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
    if (confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          this.loadCategories();
          this.toastr.success('Kategori başarıyla silindi');
        },
        error: (err) => {
          console.error('Error deleting category', err);
          this.toastr.error('Kategori silinirken bir hata oluştu');
        }
      });
    }
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
    if (confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.loadPosts();
          this.toastr.success('Gönderi başarıyla silindi');
        },
        error: (err) => {
          console.error('Error deleting post', err);
          this.toastr.error('Gönderi silinirken bir hata oluştu');
        }
      });
    }
  }

  selectSection(section: string) {
    this.selectedSection = section;
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

    // Tüm promise'ları birleştir
    const allPromises = [...updateRolePromises, ...updateEnabledPromises];

    Promise.all(allPromises)
      .then(() => {
        this.loadUsers();
        this.userChanges.clear();
        this.userEnabledChanges.clear();
        this.toastr.success('Tüm kullanıcı değişiklikleri kaydedildi');
      })
      .catch(error => {
        console.error('Kullanıcı değişiklikleri kaydedilirken hata:', error);
        this.toastr.error('Kullanıcı değişiklikleri kaydedilirken bir hata oluştu');
      });
  }

  saveAllCategoryChanges() {
    if (this.categoryChanges.size === 0) {
      this.toastr.info('Kaydedilecek kategori değişikliği bulunmuyor');
      return;
    }

    const updatePromises = Array.from(this.categoryChanges.entries()).map(([categoryId, newName]) => {
      const categoryRequest: CategoryRequestDto = {
        name: newName
      };
      return firstValueFrom(this.categoryService.updateCategory(categoryId, categoryRequest));
    });

    Promise.all(updatePromises)
      .then(() => {
        this.loadCategories();
        this.categoryChanges.clear();
        this.toastr.success('Tüm kategori değişiklikleri kaydedildi');
      })
      .catch(error => {
        console.error('Kategori değişiklikleri kaydedilirken hata:', error);
        this.toastr.error('Kategori değişiklikleri kaydedilirken bir hata oluştu');
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
} 