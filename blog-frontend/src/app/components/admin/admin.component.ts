import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { UserResponseDto } from '../../models/user-response.dto';
import { UserRequestDto } from '../../models/user-request.dto';
import { CategoryService } from '../../services/category.service';
import { CategoryResponseDto } from '../../models/category-response.dto';
import { CategoryRequestDto } from '../../models/category-request.dto';
import { PostService } from '../../services/post.service';
import { PostResponseDto } from '../../models/post-response.dto';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  users: UserResponseDto[] = [];
  categories: CategoryResponseDto[] = [];
  posts: PostResponseDto[] = [];
  isAdmin: boolean = false;
  currentUserId: number | null = null;
  newCategoryName: string = '';
  selectedSection: string = 'users';

  constructor(
    private adminService: AdminService,
    private categoryService: CategoryService,
    private postService: PostService,
    private authService: AuthService,
    private router: Router
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
      next: (users: UserResponseDto[]) => {
        console.log('Kullanıcılar yüklendi:', users);
        this.users = users;
      },
      error: (error: any) => {
        console.error('Kullanıcılar yüklenirken hata:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
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
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          console.log('Kullanıcı silindi:', userId);
          this.users = this.users.filter(u => u.id !== userId);
        },
        error: (error: any) => {
          console.error('Kullanıcı silinirken hata:', error);
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
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
      next: (categories) => {
        console.log('Kategoriler yüklendi:', categories);
        this.categories = categories;
      },
      error: (error) => {
        console.error('Kategoriler yüklenirken hata:', error);
      }
    });
  }

  createCategory() {
    if (!this.newCategoryName.trim()) return;

    const categoryRequestDto: CategoryRequestDto = {
      name: this.newCategoryName.trim()
    };

    this.categoryService.createCategory(categoryRequestDto).subscribe({
      next: (newCategory) => {
        console.log('Kategori oluşturuldu:', newCategory);
        this.categories.push(newCategory);
        this.newCategoryName = '';
      },
      error: (error) => {
        console.error('Kategori oluşturulurken hata:', error);
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

  deleteCategory(id: number) {
    if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          console.log('Kategori silindi:', id);
          this.categories = this.categories.filter(c => c.id !== id);
        },
        error: (error) => {
          console.error('Kategori silinirken hata:', error);
        }
      });
    }
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        console.log('Postlar yüklendi:', JSON.stringify(posts, null, 2));
        this.posts = posts;
      },
      error: (error) => {
        console.error('Postlar yüklenirken hata:', error);
      }
    });
  }

  deletePost(id: number) {
    if (confirm('Bu postu silmek istediğinizden emin misiniz?')) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          console.log('Post silindi:', id);
          this.posts = this.posts.filter(p => p.id !== id);
        },
        error: (error) => {
          console.error('Post silinirken hata:', error);
        }
      });
    }
  }

  selectSection(section: string) {
    this.selectedSection = section;
  }
} 