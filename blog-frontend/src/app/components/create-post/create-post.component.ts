import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PostService } from '../../services/post.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent implements OnInit {
  postForm: FormGroup;
  categories: any[] = [];
  submitError: string = '';
  isSubmitting: boolean = false;
  isLoggedIn: boolean = false;
  isEditMode: boolean = false;
  postId: number | null = null;
  uploadedImages: any[] = [];
  imageUploadError: string = '';

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private imageService: ImageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.checkAuth();
    
    // URL'den post ID'sini al
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.postId = +params['id'];
        this.loadPostData(this.postId);
      }
    });
  }

  loadPostData(id: number) {
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        // Form'u doldur
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          categoryId: post.categoryId.toString()
        });
        
        // Resimleri yükle
        if (post.images && post.images.length > 0) {
          this.uploadedImages = post.images.map((url: string) => ({ url }));
        }
      },
      error: (error) => {
        this.submitError = 'Post yüklenirken bir hata oluştu.';
        
        if (error.status === 401) {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      }
    });
  }

  checkAuth() {
    const token = this.authService.getToken();
    
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

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.imageUploadError = '';
      
      // Maksimum 5 resim yüklenebilir
      if (this.uploadedImages.length + files.length > 5) {
        this.imageUploadError = 'En fazla 5 resim yükleyebilirsiniz.';
        return;
      }
      
      // Her dosya için yükleme işlemi
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Dosya boyutu kontrolü (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.imageUploadError = 'Dosya boyutu 5MB\'dan küçük olmalıdır.';
          continue;
        }
        
        // Dosya türü kontrolü
        if (!file.type.startsWith('image/')) {
          this.imageUploadError = 'Sadece resim dosyaları yükleyebilirsiniz.';
          continue;
        }
        
        // Resmi yükle
        this.imageService.uploadImage(file).subscribe({
          next: (response) => {
            this.uploadedImages.push(response);
          },
          error: (error) => {
            this.imageUploadError = 'Resim yüklenirken bir hata oluştu.';
          }
        });
      }
    }
  }

  removeImage(image: any) {
    const index = this.uploadedImages.findIndex(img => img.url === image.url);
    if (index !== -1) {
      this.uploadedImages.splice(index, 1);
    }
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

      const postData = {
        title: this.postForm.get('title')?.value.trim(),
        content: this.postForm.get('content')?.value.trim(),
        categoryId: parseInt(this.postForm.get('categoryId')?.value),
        images: this.uploadedImages.map(img => img.url),
        userEmail: userEmail
      };

      this.isSubmitting = true;
      this.submitError = '';

      if (this.isEditMode && this.postId) {
        // Düzenleme modu
        this.postService.updatePost(this.postId, postData).subscribe({
          next: (response) => {
            this.router.navigate(['/post', response.id]);
          },
          error: (error) => {
            if (error.error?.customException?.message) {
              this.submitError = error.error.customException.message;
            } else if (error.error?.message) {
              this.submitError = error.error.message;
            } else {
              this.submitError = 'Post güncellenirken bir hata oluştu.';
            }
            
            if (error.status === 401) {
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 2000);
            }
            this.isSubmitting = false;
          }
        });
      } else {
        // Yeni post oluşturma modu
        this.postService.createPost(postData).subscribe({
          next: (response) => {
            this.router.navigate(['/post', response.id]);
          },
          error: (error) => {
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
  }

  cancel() {
    this.router.navigate(['/']);
  }
} 