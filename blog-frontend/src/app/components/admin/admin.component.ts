import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { UserResponseDto } from '../../models/user-response.dto';
import { UserRequestDto } from '../../models/user-request.dto';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="admin-container">
      <div class="admin-content">
        <h2>Admin Paneli</h2>
        
        <div *ngIf="!isAdmin" class="alert alert-warning">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </div>

        <div *ngIf="isAdmin" class="admin-section">
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
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      min-height: 100vh;
      background: #FEFAE0;
      padding: 2rem;
    }

    .admin-content {
      max-width: 1200px;
      margin: 0 auto;
      background: #fff;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(212, 163, 115, 0.2);
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

    .admin-section {
      background: #fff;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(212, 163, 115, 0.1);
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

    @media (max-width: 768px) {
      .admin-container {
        padding: 1rem;
      }

      .admin-content {
        padding: 1rem;
      }

      h2 {
        font-size: 2rem;
      }

      h3 {
        font-size: 1.5rem;
      }

      th, td {
        padding: 0.75rem;
        font-size: 0.9rem;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  users: UserResponseDto[] = [];
  isAdmin: boolean = false;
  currentUserId: number | null = null;

  constructor(
    private adminService: AdminService,
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
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);
      return;
    }

    console.log('Admin erişimi onaylandı');
    this.loadUsers();
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
} 