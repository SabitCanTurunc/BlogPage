import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="create-post-form">
        <h2>Yeni Blog Yazısı</h2>
        
        <div *ngIf="!isLoggedIn" class="alert alert-warning">
          Lütfen önce giriş yapın.
        </div>

        <form *ngIf="isLoggedIn" [formGroup]="postForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="title">Başlık</label>
            <input 
              type="text" 
              id="title" 
              formControlName="title" 
              class="form-control"
              placeholder="Blog yazınızın başlığını girin">
            <div *ngIf="postForm.get('title')?.errors?.['required'] && postForm.get('title')?.touched" class="error-message">
              Başlık alanı zorunludur
            </div>
          </div>

          <div class="form-group">
            <label for="categoryId">Kategori</label>
            <select id="categoryId" formControlName="categoryId" class="form-control">
              <option value="">Kategori seçin</option>
              <option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
            <div *ngIf="postForm.get('categoryId')?.errors?.['required'] && postForm.get('categoryId')?.touched" class="error-message">
              Kategori seçimi zorunludur
            </div>
          </div>

          <div class="form-group">
            <label for="content">İçerik</label>
            <textarea 
              id="content" 
              formControlName="content" 
              class="form-control"
              rows="10"
              placeholder="Blog yazınızın içeriğini girin"></textarea>
            <div *ngIf="postForm.get('content')?.errors?.['required'] && postForm.get('content')?.touched" class="error-message">
              İçerik alanı zorunludur
            </div>
          </div>

          <div class="form-group">
            <label for="images">Görseller (URL'leri virgülle ayırın)</label>
            <input 
              type="text" 
              id="images" 
              formControlName="images" 
              class="form-control"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg">
          </div>

          <div class="form-actions">
            <button type="button" (click)="cancel()" class="btn btn-secondary">İptal</button>
            <button type="submit" [disabled]="!postForm.valid || isSubmitting" class="btn btn-primary">
              {{ isSubmitting ? 'Gönderiliyor...' : 'Yayınla' }}
            </button>
          </div>
        </form>

        <div *ngIf="submitError" class="alert alert-danger">
          {{ submitError }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #FEFAE0;
      padding: 2rem 0;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .create-post-form {
      background: #fff;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(212, 163, 115, 0.2);
      border: 1px solid rgba(212, 163, 115, 0.3);
    }

    h2 {
      color: #2C3E50;
      margin-bottom: 2rem;
      text-align: center;
      font-size: 2rem;
      font-weight: 700;
      border-bottom: 2px solid #D4A373;
      padding-bottom: 0.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2C3E50;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #D4A373;
      border-radius: 8px;
      font-size: 1rem;
      background: #E9EDC9;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #CCD5AE;
      box-shadow: 0 0 0 2px rgba(212, 163, 115, 0.2);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 200px;
    }

    .error-message {
      color: #2C3E50;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #D4A373;
      color: #2C3E50;
    }

    .btn-primary:hover:not(:disabled) {
      background: #CCD5AE;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
      transform: translateY(-2px);
    }

    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .alert {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }

    .alert-danger {
      background: #FEFAE0;
      color: #2C3E50;
      border: 1px solid #D4A373;
    }

    .alert-warning {
      background: #FEFAE0;
      color: #2C3E50;
      border: 1px solid #D4A373;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .create-post-form {
        padding: 1.5rem;
      }

      h2 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class CreatePostComponent implements OnInit {
  postForm: FormGroup;
  categories: any[] = [];
  submitError: string = '';
  isSubmitting: boolean = false;
  isLoggedIn: boolean = false;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      categoryId: ['', Validators.required],
      images: ['']
    });
  }

  ngOnInit() {
    this.checkAuth();
  }

  checkAuth() {
    const token = this.authService.getToken();
    console.log('Token:', token);
    console.log('Current User:', this.authService.getCurrentUser());
    
    if (!token) {
      this.isLoggedIn = false;
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    this.isLoggedIn = true;
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        if (error.status === 401) {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      }
    });
  }

  onSubmit() {
    if (this.postForm.valid) {
      const userEmail = this.authService.getUserEmail();
      
      if (!userEmail) {
        this.submitError = 'Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        return;
      }

      const imagesValue = this.postForm.get('images')?.value;
      const images = imagesValue ? imagesValue.split(',').map((url: string) => url.trim()).filter((url: string) => url) : [];

      const postData = {
        title: this.postForm.get('title')?.value.trim(),
        content: this.postForm.get('content')?.value.trim(),
        categoryId: parseInt(this.postForm.get('categoryId')?.value),
        images: images,
        userEmail: userEmail
      };

      this.isSubmitting = true;
      this.submitError = '';

      this.postService.createPost(postData).subscribe({
        next: (response) => {
          this.router.navigate(['/post', response.id]);
        },
        error: (error) => {
          console.error('Post yükleme hatası:', error);
          if (error.error?.customException?.message) {
            this.submitError = error.error.customException.message;
          } else if (error.error?.message) {
            this.submitError = error.error.message;
          } else {
            this.submitError = 'Post oluşturulurken bir hata oluştu.';
          }
          
          if (error.status === 401) {
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          }
          this.isSubmitting = false;
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/']);
  }
} 