import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PostService } from '../../services/post.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';
import { RouterModule } from '@angular/router';
import { CategoryResponseDto } from '../../models/category-response.dto';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { WriterAiService } from '../../services/writer-ai.service';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { TranslationService } from '../../services/translation.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface UploadedImage {
  url: string;
}

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent implements OnInit {
  postForm: FormGroup;
  categories: CategoryResponseDto[] = [];
  submitError: string = '';
  isSubmitting: boolean = false;
  isLoggedIn: boolean = false;
  isEditMode: boolean = false;
  postId: number | null = null;
  uploadedImages: UploadedImage[] = [];
  imageUploadError: string = '';
  isImageUploading: boolean = false;
  aiGeneratedContent: string = '';
  isAiGenerating: boolean = false;
  aiError: string = '';
  showApplyButton: boolean = false;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private imageService: ImageService,
    private writerAiService: WriterAiService,
    private translationService: TranslationService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.checkAuth();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.postId = +params['id'];
        this.loadPostData(this.postId);
      }
    });
  }

  private processSSEResponse(text: string): string {
    if (!text) return '';
    
    // Tüm veri satırlarını düzgün şekilde işle
    let content = '';
    
    // 'data:' ile başlayan tüm satırları eşleştirecek regex
    const dataRegex = /data:(.*?)(?=\ndata:|$)/gs;
    let matches = [...text.matchAll(dataRegex)];
    
    // Her bir veri parçasını işle
    if (matches && matches.length > 0) {
      for (const match of matches) {
        if (match[1]) {
          // Veri içeriğini temizle ve ekle
          let dataContent = match[1].trim();
          // [DONE] etiketlerini kaldır
          dataContent = dataContent.replace(/\[DONE\]/g, '');
          
          // Bir önceki içeriğe eklerken yeni satır karakteri ekle
          if (content && dataContent) {
            content += dataContent;
          } else {
            content += dataContent;
          }
        }
      }
    } else {
      // Regex eşleşmezse eski yöntemi kullan
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          let dataContent = line.substring(5).trim();
          dataContent = dataContent.replace(/\[DONE\]/g, '');
          content += dataContent;
        }
      }
    }
    
    // Fazla boşlukları temizle ve içeriği düzenle
    content = content
      // Birden fazla ardışık boş satırı iki boş satırla değiştir
      .replace(/\n{3,}/g, '\n\n')
      // Sonda kalan fazla boşlukları temizle
      .trim();
    
    return content;
  }

  generateWithAI() {
    // Daha önce görüntülenen hataları temizle
    this.submitError = '';
    
    // Form değerlerini al ve güvenli şekilde temizle
    const title = this.postForm.get('title')?.value ? this.postForm.get('title')?.value.trim() : '';
    let categoryId = '';
    
    // Kategori değerini numeric olarak doğrula
    const rawCategoryId = this.postForm.get('categoryId')?.value || '';
    if (rawCategoryId && /^\d+$/.test(rawCategoryId.toString())) {
      categoryId = rawCategoryId.toString();
    }
    
    // Content alanını kontrol etmeye gerek yok, AI ile oluşturulacak
    
    // Başlık kontrolü
    if (!title) {
      this.aiError = this.translationService.getTranslation('create_post_title_required') || "AI ile içerik oluşturmak için lütfen başlık giriniz.";
      this.postForm.get('title')?.markAsTouched();
      
      // Başlık alanına odaklan
      setTimeout(() => {
        document.getElementById('title')?.focus();
        document.getElementById('title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    
    // Kategori kontrolü
    if (!categoryId) {
      this.aiError = this.translationService.getTranslation('create_post_category_required') || "AI ile içerik oluşturmak için lütfen kategori seçiniz.";
      this.postForm.get('categoryId')?.markAsTouched();
      
      // Kategori alanına odaklan
      setTimeout(() => {
        document.getElementById('categoryId')?.focus();
        document.getElementById('categoryId')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    
    this.isAiGenerating = true;
    this.aiGeneratedContent = '';
    this.aiError = '';
    this.showApplyButton = false;
    
    // Content boş olsa bile API çağrısı yapabiliriz, boş olması sorun değil
    const content = this.postForm.get('content')?.value ? this.postForm.get('content')?.value.trim() : '';
    
    // İşlem başladığında content alanının touched durumunu sıfırla
    // Bu, daha önce gösterilmiş validation hatalarını temizler
    this.postForm.get('content')?.markAsPristine();
    this.postForm.get('content')?.markAsUntouched();
    
    // Güvenli şekilde temizlenmiş değerlerle API çağrısı yap
    this.writerAiService.generateContent(title, categoryId, content)
      .pipe(
        catchError(error => {
          console.error('AI ile içerik oluşturma hatası:', error);
          this.isAiGenerating = false;
          this.aiError = error.message || 'İçerik oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.DownloadProgress) {
            const progressEvent = event as any;
            
            if (progressEvent.partialText) {
              const processedContent = this.processSSEResponse(progressEvent.partialText);
              
              if (processedContent) {
                // Birleşik kelimeleri düzeltme işlemini SSE akışı sırasında da uygulayalım
                const formattedContent = this.formatContent(processedContent);
                this.aiGeneratedContent = formattedContent;
              }
            }
          } 
          else if (event.type === HttpEventType.Response) {
            const response = event as HttpResponse<any>;
            this.isAiGenerating = false;
            
            if (response.body) {
              let responseText = '';
              
              if (typeof response.body === 'string') {
                responseText = this.processSSEResponse(response.body);
              } else {
                responseText = JSON.stringify(response.body);
              }
              
              if (responseText) {
                // Son bir formatlama yap
                this.aiGeneratedContent = this.formatContent(responseText);
                this.showApplyButton = true;
              }
            }
          }
        },
        error: (error) => {
          console.error('AI içerik hatası:', error);
          this.isAiGenerating = false;
          this.aiError = error.message || 'İçerik oluşturulurken bir hata oluştu.';
          
          // Hata durumunda butona odaklan
          setTimeout(() => {
            document.querySelector('.ai-generate-btn')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        },
        complete: () => {
          this.isAiGenerating = false;
        }
      });
  }

  // Birleşik kelimeleri ve formatlamayı düzeltmek için yardımcı metot
  private formatContent(content: string): string {
    if (!content) return '';
    
    let formattedContent = content;
    
    // Markdown başlıkları ve özel karakterleri düzenleme
    formattedContent = formattedContent
      // [DONE] etiketlerini temizle
      .replace(/\[DONE\]/g, '')
      // Fazla boş satırları azalt
      .replace(/\n{3,}/g, '\n\n')
      // Markdown sembollerini (*,**) temizle ama içeriği koru
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1');
    
    // Birleşik kelimeleri düzelt (küçük harften büyük harfe geçişlerde)
    // Örnek: "merhaBa" -> "merha Ba"
    formattedContent = formattedContent.replace(/([a-zışğüçöâîûû])([A-ZİŞĞÜÇÖÂÎÛ])/g, '$1 $2');
    
    // Satır başlarındaki birleşik kelimeleri düzelt
    // Her satırı ayrı ayrı işleyelim
    const lines = formattedContent.split('\n');
    const processedLines = lines.map(line => {
      // Satır başında büyük harfle başlayan ve içinde büyük-küçük harf geçişi olan kelimeleri düzelt
      return line.replace(/^([A-ZİŞĞÜÇÖ][a-zışğüçöâîû]*)([A-ZİŞĞÜÇÖ][a-zışğüçöâîû]*)/g, '$1 $2');
    });
    
    // İşlenmiş satırları birleştir
    formattedContent = processedLines.join('\n');
    
    return formattedContent;
  }

  applyAiContent() {
    if (this.aiGeneratedContent) {
      // Metni tam anlamıyla temizle ve düzenle
      let formattedContent = this.aiGeneratedContent;
      
      // Markdown başlık sembollerini temizle ama satır sonlarını koru
      formattedContent = formattedContent
        // Markdown başlık işaretlerini (#) kaldırırken başlığı koru
        .replace(/^(#+)\s*(.*?)$/gm, '$2')
        // "Başlık:" tarzı etiketleri düzelt
        .replace(/^(Baş[ıi]?l[ıi]?k\s*:)\s*(.*?)$/gim, '$2')
        // Çift yıldızları (bold) kaldır
        .replace(/\*\*/g, '')
        // Tek yıldızları (italic) kaldır
        .replace(/\*/g, '')
        // Fazla boş satırları iki boş satıra düşür
        .replace(/\n{3,}/g, '\n\n');
      
      // Satır sonlarına göre birleşik kelimeleri düzelt
      const paragraphs = formattedContent.split('\n');
      const processedParagraphs = [];
      
      for (const paragraph of paragraphs) {
        // Birleşmiş kelimeleri arayıp ayır
        // Örnek: "kurmakiçin" -> "kurmak için"
        const processed = paragraph.replace(/([a-zışğüçöâîû])([A-ZİŞĞÜÇÖÂÎÛ])/g, '$1 $2');
        processedParagraphs.push(processed);
      }
      
      // Düzeltilmiş paragrafları birleştir
      formattedContent = processedParagraphs.join('\n');
      
      // Metin içindeki büyük harf küçük harf geçişlerinde boşluk ekleyerek birleşik kelimeleri düzelt
      formattedContent = formattedContent.replace(/([a-zışğüçöâîû])([A-ZİŞĞÜÇÖÂÎÛ])/g, '$1 $2');
      
      // Form alanına uygula - form kontrollerine değerleri doğru şekilde ata
      this.postForm.get('content')?.setValue(formattedContent);
      
      // Content kontrol durumunu güncelleyelim ve valid olarak işaretleyelim
      this.postForm.get('content')?.markAsDirty();
      this.postForm.get('content')?.updateValueAndValidity();
      
      // Hata oluşmaması için touched olarak işaretlemeyelim
      // Böylece kullanıcı sonradan değiştirene kadar hata gösterilmez
      this.postForm.get('content')?.markAsPristine();
      
      // AI içeriğini temizle ve butonu gizle
      this.aiGeneratedContent = '';
      this.showApplyButton = false;
      this.aiError = '';
    }
  }

  loadPostData(id: number) {
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          categoryId: post.categoryId.toString()
        });
        
        if (post.images && post.images.length > 0) {
          this.uploadedImages = post.images.map(url => ({ url }));
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
      
      if (this.uploadedImages.length + files.length > 5) {
        this.imageUploadError = 'En fazla 5 resim yükleyebilirsiniz.';
        return;
      }
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > 20 * 1024 * 1024) {
          this.imageUploadError = 'Dosya boyutu 20MB\'dan küçük olmalıdır.';
          continue;
        }
        
        if (!file.type.startsWith('image/')) {
          this.imageUploadError = 'Sadece resim dosyaları yükleyebilirsiniz.';
          continue;
        }
        
        this.isImageUploading = true;
        
        this.imageService.uploadImage(file).subscribe({
          next: (response) => {
            this.uploadedImages.push(response);
            this.isImageUploading = false;
          },
          error: (error) => {
            this.imageUploadError = 'Resim yüklenirken bir hata oluştu.';
            this.isImageUploading = false;
          }
        });
      }
    }
  }

  removeImage(image: UploadedImage) {
    const index = this.uploadedImages.findIndex(img => img.url === image.url);
    if (index !== -1) {
      this.uploadedImages.splice(index, 1);
    }
  }

  onSubmit() {
    // Form validasyonunu manuel olarak da kontrol edelim
    const title = this.postForm.get('title')?.value ? this.postForm.get('title')?.value.trim() : '';
    const categoryId = this.postForm.get('categoryId')?.value;
    const content = this.postForm.get('content')?.value ? this.postForm.get('content')?.value.trim() : '';
    
    // Tüm hatalar temizlenir
    this.submitError = '';
    
    // Başlık kontrolü
    if (!title) {
      this.submitError = this.translationService.getTranslation('create_post_title_required') || 'Lütfen bir başlık giriniz.';
      this.postForm.get('title')?.markAsTouched();
      // Başlık alanına odaklan
      setTimeout(() => {
        document.getElementById('title')?.focus();
        document.getElementById('title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    
    // Kategori kontrolü
    if (!categoryId) {
      this.submitError = this.translationService.getTranslation('create_post_category_required') || 'Lütfen bir kategori seçiniz.';
      this.postForm.get('categoryId')?.markAsTouched();
      // Kategori seçimine odaklan
      setTimeout(() => {
        document.getElementById('categoryId')?.focus();
        document.getElementById('categoryId')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    
    // İçerik kontrolü
    if (!content) {
      this.submitError = this.translationService.getTranslation('create_post_content_required') || 'Lütfen içerik giriniz.';
      this.postForm.get('content')?.markAsTouched();
      // İçerik alanına odaklan
      setTimeout(() => {
        document.getElementById('content')?.focus();
        document.getElementById('content')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    
    // Form geçerliliğini elle kontrol et
    // İçerik AI ile tamamlanmış olabileceği için işaret durumları karışabilir
    if (title && categoryId && content) {
      const userEmail = this.authService.getUserEmail();
      
      if (!userEmail) {
        this.submitError = this.translationService.getTranslation('login_required') || 'Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        return;
      }

      const postData = {
        title: title,
        content: content,
        categoryId: parseInt(categoryId),
        images: this.uploadedImages.map(img => img.url),
        userEmail: userEmail
      };

      this.isSubmitting = true;
      this.submitError = '';

      if (this.isEditMode && this.postId) {
        this.postService.updatePost(this.postId, postData).subscribe({
          next: (response) => {
            this.router.navigate(['/post', response.id]);
          },
          error: (error) => {
            this.handleSubmitError(error);
            this.isSubmitting = false;
          }
        });
      } else {
        this.postService.createPost(postData).subscribe({
          next: (response) => {
            this.router.navigate(['/post', response.id]);
          },
          error: (error) => {
            this.handleSubmitError(error);
            this.isSubmitting = false;
          }
        });
      }
    } else {
      // Form geçerli değilse, eksik kalan ilk alana odaklan
      if (!title) {
        document.getElementById('title')?.focus();
        document.getElementById('title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (!categoryId) {
        document.getElementById('categoryId')?.focus();
        document.getElementById('categoryId')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (!content) {
        document.getElementById('content')?.focus();
        document.getElementById('content')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Tüm alanları dokunulmuş olarak işaretle
      Object.keys(this.postForm.controls).forEach(field => {
        const control = this.postForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      
      this.submitError = this.translationService.getTranslation('form_validation_error') || 'Lütfen formdaki eksik alanları doldurun.';
    }
  }

  private handleSubmitError(error: any) {
    if (error.error?.customException?.message) {
      this.submitError = error.error.customException.message;
    } else if (error.error?.message) {
      this.submitError = error.error.message;
    } else {
      this.submitError = this.isEditMode ? 'Post güncellenirken bir hata oluştu.' : 'Post oluşturulurken bir hata oluştu.';
    }
    
    if (error.status === 401) {
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  cancel() {
    this.router.navigate(['/']);
  }

  /**
   * Metni HTML içeriğine dönüştürür ve satır sonlarını <p> etiketleri ile değiştirir
   * @param content Formatlama yapılacak içerik
   * @returns Güvenli HTML içeriği
   */
  formatHtmlContent(content: string): SafeHtml {
    if (!content) return '';
    
    // Satır sonlarını paragraf etiketlerine dönüştürme
    const formattedContent = content
      .replace(/\n{2,}/g, '</p><p>') // İki veya daha fazla yeni satırı paragraf bölmesi olarak işle
      .replace(/\n/g, '<br>'); // Tek yeni satırları <br> ile değiştir
    
    // Son içeriği paragraf içine sarma
    const htmlContent = `<p>${formattedContent}</p>`;
    
    // Güvenli HTML olarak dönme
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }
} 