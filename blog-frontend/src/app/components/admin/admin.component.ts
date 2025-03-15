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
  template: `
    <div class="admin-container">
      <div class="admin-sidebar">
        <div class="sidebar-header">
          <h3>Admin Paneli</h3>
        </div>
        <nav class="sidebar-nav">
          <button 
            (click)="selectSection('users')" 
            [class.active]="selectedSection === 'users'"
            class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7 14s-1 0-1-1 1-4 4-4 4 3 4 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 4 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
            </svg>
            Kullanıcı Yönetimi
          </button>
          <button 
            (click)="selectSection('categories')" 
            [class.active]="selectedSection === 'categories'"
            class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>
              <path d="M2.267 14.854a.5.5 0 0 0 .708.708l7.433-7.434a.5.5 0 0 0-.708-.708L2.267 14.854z"/>
              <path d="M2.267 14.854a.5.5 0 0 1-.708-.708l7.434-7.433a.5.5 0 0 1 .708.708L2.267 14.854z"/>
            </svg>
            Kategori Yönetimi
          </button>
          <button 
            (click)="selectSection('posts')" 
            [class.active]="selectedSection === 'posts'"
            class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
              <path d="M3.5 3.5a.5.5 0 0 1 1 0v8.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L3.5 12.293V3.5z"/>
            </svg>
            Post Yönetimi
          </button>
        </nav>
        <div class="sidebar-footer">
          <button (click)="navigateToHome()" class="btn-home">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5z"/>
            </svg>
            Ana Sayfa
          </button>
        </div>
      </div>

      <div class="admin-content">
        <div *ngIf="!isAdmin" class="alert alert-warning">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </div>

        <div *ngIf="isAdmin">
          <!-- Kullanıcı Yönetimi -->
          <div *ngIf="selectedSection === 'users'" class="admin-section">
            <h3>Kullanıcı Yönetimi</h3>
            <div class="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Kullanıcı Adı</th>
                    <th>E-posta</th>
                    <th>Rol</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of users">
                    <td>{{ user.id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <select 
                        [value]="user.role"
                        (change)="updateUserRole(user.id, $event)"
                        class="role-select">
                        <option value="USER">Kullanıcı</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span [class]="user.enabled ? 'status-active' : 'status-inactive'">
                        {{ user.enabled ? 'Aktif' : 'Pasif' }}
                      </span>
                    </td>
                    <td>
                      <button 
                        (click)="deleteUser(user.id)"
                        class="btn btn-danger"
                        [disabled]="isCurrentUser(user.id)">
                        Sil
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Kategori Yönetimi -->
          <div *ngIf="selectedSection === 'categories'" class="admin-section">
            <h3>Kategori Yönetimi</h3>
            <div class="category-form">
              <input 
                type="text" 
                [(ngModel)]="newCategoryName" 
                placeholder="Yeni kategori adı"
                class="form-input">
              <button 
                (click)="createCategory()" 
                class="btn btn-primary"
                [disabled]="!newCategoryName.trim()">
                Ekle
              </button>
            </div>
            <div class="categories-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Kategori Adı</th>
                    <th>Oluşturulma Tarihi</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let category of categories">
                    <td>{{ category.id }}</td>
                    <td>
                      <input 
                        type="text" 
                        [(ngModel)]="category.name" 
                        (blur)="updateCategory(category)"
                        class="form-input">
                    </td>
                    <td>{{ category.createdAt | date:'medium' }}</td>
                    <td>
                      <button 
                        (click)="deleteCategory(category.id)"
                        class="btn btn-danger">
                        Sil
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Post Yönetimi -->
          <div *ngIf="selectedSection === 'posts'" class="admin-section">
            <h3>Post Yönetimi</h3>
            <div class="posts-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Başlık</th>
                    <th>Yazar</th>
                    <th>Kategori</th>
                    <th>Oluşturulma Tarihi</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let post of posts">
                    <td>{{ post.id }}</td>
                    <td>{{ post.title }}</td>
                    <td>{{ post.userEmail }}</td>
                    <td>{{ post.categoryName }}</td>
                    <td>{{ post.createdAt ? (post.createdAt | date:'dd.MM.yyyy HH:mm') : 'Tarih yok' }}</td>
                    <td>
                      <div class="action-buttons">
                        <button 
                          (click)="editPost(post.id)"
                          class="btn btn-primary">
                          Düzenle
                        </button>
                        <button 
                          (click)="deletePost(post.id)"
                          class="btn btn-danger">
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      min-height: 100vh;
      background: #FEFAE0;
      display: flex;
    }

    .admin-sidebar {
      width: 250px;
      background: #fff;
      border-right: 1px solid #D4A373;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      box-shadow: 2px 0 8px rgba(212, 163, 115, 0.1);
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #D4A373;
      margin-bottom: 1rem;
    }

    .sidebar-header h3 {
      color: #2C3E50;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      color: #2C3E50;
      font-size: 1rem;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.3s;
    }

    .nav-item:hover {
      background: #FEFAE0;
    }

    .nav-item.active {
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      color: #2C3E50;
      font-weight: 500;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid #D4A373;
    }

    .btn-home {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      color: #2C3E50;
      font-size: 1rem;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.3s;
    }

    .btn-home:hover {
      background: #FEFAE0;
    }

    .admin-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    .admin-header {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 2rem;
      position: relative;
    }

    .btn-home-icon {
      position: absolute;
      left: 0;
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      color: #2C3E50;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(212, 163, 115, 0.3);
      transition: all 0.3s;
      cursor: pointer;
    }

    .btn-home-icon:hover {
      transform: translateY(-2px) rotate(-360deg);
      box-shadow: 0 6px 20px rgba(212, 163, 115, 0.4);
      background: linear-gradient(45deg, #CCD5AE, #D4A373);
    }

    .btn-home-icon svg {
      transition: transform 0.3s;
    }

    h2 {
      color: #2C3E50;
      text-align: center;
      margin-bottom: 2rem;
      font-size: 2.5rem;
      font-weight: 700;
    }

    h3 {
      color: #2C3E50;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .admin-sections {
      display: grid;
      gap: 2rem;
    }

    .users-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #D4A373;
    }

    th {
      background: #FEFAE0;
      color: #2C3E50;
      font-weight: 600;
    }

    tr:hover {
      background: #FEFAE0;
    }

    .role-select {
      padding: 0.5rem;
      border: 1px solid #D4A373;
      border-radius: 6px;
      background: #fff;
      color: #2C3E50;
    }

    .status-active {
      color: #28a745;
      font-weight: 500;
    }

    .status-inactive {
      color: #dc3545;
      font-weight: 500;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-danger {
      background: #dc3545;
      color: #fff;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c82333;
      transform: translateY(-2px);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alert {
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 1rem;
    }

    .alert-warning {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }

    .category-form {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #D4A373;
      border-radius: 6px;
      font-size: 1rem;
      color: #2C3E50;
      background: #fff;
      transition: all 0.3s;
    }

    .form-input:focus {
      outline: none;
      border-color: #CCD5AE;
      box-shadow: 0 0 0 2px rgba(212, 163, 115, 0.2);
    }

    .btn-primary {
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      color: #2C3E50;
      border: none;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(212, 163, 115, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .categories-table {
      overflow-x: auto;
    }

    .posts-table {
      overflow-x: auto;
    }

    .posts-table table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .posts-table th,
    .posts-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #D4A373;
    }

    .posts-table th {
      background: #FEFAE0;
      color: #2C3E50;
      font-weight: 600;
    }

    .posts-table tr:hover {
      background: #FEFAE0;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .admin-container {
        flex-direction: column;
      }

      .admin-sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #D4A373;
      }

      .admin-content {
        padding: 1rem;
      }

      .sidebar-nav {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: 0.5rem;
      }

      .nav-item {
        white-space: nowrap;
      }
    }
  `]
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

  editPost(id: number) {
    this.router.navigate(['/create-post', id]);
  }

  selectSection(section: string) {
    this.selectedSection = section;
  }
} 