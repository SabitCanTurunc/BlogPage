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
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { UserResponseDto } from '../../models/user-response.dto';

interface UploadedImage {
  url: string;
  isAiImage?: boolean; // AI tarafından oluşturulmuş görselleri işaretlemek için
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
  isAiImageGenerating: boolean = false;
  aiImageError: string = '';
  aiImagePrompt: string = '';
  showAiImageDialog: boolean = false;
  aiGeneratedImageUrl: string = '';
  showApplyImageButton: boolean = false;
  showMarkdownPreview: boolean = false;
  
  // Kullanıcının abonelik planını saklayacak özellik
  userSubscriptionPlan: string = '';

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
    private sanitizer: DomSanitizer,
    private userService: UserService
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      categoryId: ['', Validators.required],
      premium: [false]
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
    
    // Kullanıcının AI özelliğini kullanma yetkisini kontrol et
    if (!this.canUseAiContentGeneration()) {
      this.aiError = this.translationService.getTranslation('ai_feature_required_plus_subscription') || 
        "AI ile içerik oluşturma özelliği sadece PLUS ve MAX aboneliklerine sahip kullanıcılar tarafından kullanılabilir.";
      return;
    }
    
    // Form değerlerini al ve güvenli şekilde temizle
    const title = this.postForm.get('title')?.value ? this.postForm.get('title')?.value.trim() : '';
    let categoryId = '';
    
    // Kategori değerini numeric olarak doğrula
    const rawCategoryId = this.postForm.get('categoryId')?.value || '';
    if (rawCategoryId && /^\d+$/.test(rawCategoryId.toString())) {
      categoryId = rawCategoryId.toString();
    }
    
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
      .replace(/\n{3,}/g, '\n\n');
    
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
      // Form alanına AI içeriğini markdown formatıyla uygula
      this.postForm.get('content')?.setValue(this.aiGeneratedContent);
      
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
      
      // Markdown önizleme modunu etkinleştir
      this.showMarkdownPreview = true;
    }
  }

  loadPostData(id: number) {
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          categoryId: post.categoryId.toString(),
          premium: post.premium
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
    this.isLoggedIn = this.authService.isLoggedIn();
    
    if (this.isLoggedIn) {
      // Kullanıcı giriş yapmışsa kategorileri yükle
      this.loadCategories();
      
      // Kullanıcının email adresini al
      const userEmail = this.authService.getUserEmail();
      
      if (userEmail) {
        // Kullanıcının profil bilgilerini ve abonelik planını al
        this.userService.getUserProfile().subscribe({
          next: (response: UserResponseDto) => {
            this.userSubscriptionPlan = response.subscriptionPlan || 'ESSENTIAL';
            console.log('Kullanıcı abonelik planı:', this.userSubscriptionPlan);
          },
          error: (error) => {
            console.error('Kullanıcı profili alınamadı:', error);
            // Hata durumunda varsayılan olarak ESSENTIAL planı kullan
            this.userSubscriptionPlan = 'ESSENTIAL';
          }
        });
      } else {
        // Kullanıcı email bilgisi yoksa varsayılan olarak ESSENTIAL planı kullan
        this.userSubscriptionPlan = 'ESSENTIAL';
      }
    }
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

      // Yükleme durumunu göster
      this.isSubmitting = true;
      this.submitError = '';

      // AI ile oluşturulan görselleri kontrol et
      const aiImages = this.uploadedImages.filter(img => img.isAiImage);
      
      // Eğer AI görselleri yoksa direkt olarak gönder
      if (aiImages.length === 0) {
        this.savePost(userEmail, title, content, categoryId);
        return;
      }
      
      // AI görsellerini Cloudinary'ye yükle
      let uploadedCount = 0;
      let cloudinaryUrls: { [key: string]: string } = {};
      
      // Her bir AI görselini Cloudinary'ye yükle
      for (let i = 0; i < aiImages.length; i++) {
        const aiImage = aiImages[i];
        
        this.writerAiService.uploadImageFromUrl(aiImage.url)
          .subscribe({
            next: (response) => {
              if (response && response.url) {
                // Orijinal URL'yi yeni URL ile eşleştir
                cloudinaryUrls[aiImage.url] = response.url;
              }
              
              uploadedCount++;
              
              // Tüm yüklemeler tamamlandığında post'u kaydet
              if (uploadedCount === aiImages.length) {
                // Görsel URL'leri güncelle
                this.uploadedImages = this.uploadedImages.map(img => {
                  if (img.isAiImage && cloudinaryUrls[img.url]) {
                    return { url: cloudinaryUrls[img.url], isAiImage: false };
                  }
                  return img;
                });
                
                this.savePost(userEmail, title, content, categoryId);
              }
            },
            error: (error) => {
              console.error('Cloudinary yükleme hatası:', error);
              uploadedCount++;
              
              // Hata olsa bile diğer görselleri yüklemeye devam et
              if (uploadedCount === aiImages.length) {
                // Sorunlu görselleri filtrele
                this.uploadedImages = this.uploadedImages.filter(img => {
                  return !img.isAiImage || cloudinaryUrls[img.url];
                });
                
                this.savePost(userEmail, title, content, categoryId);
              }
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

  // Post'u kaydetme işlemi
  private savePost(userEmail: string, title: string, content: string, categoryId: string | number) {
    const postData = {
      title: title,
      content: content,
      categoryId: categoryId,
      images: this.uploadedImages.map(img => img.url),
      userEmail: userEmail,
      isPremium: this.postForm.get('premium')?.value || false
    };

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
    
    // Kod bloklarını işle (önce bunları işlememiz gerekiyor çünkü içindeki markdown'ı dönüştürmek istemiyoruz)
    const codeBlocks: string[] = [];
    let codeBlockCounter = 0;
    
    // Code block'ları geçici olarak çıkart ve yerine placeholder koy
    let processedContent = content.replace(/```([\s\S]*?)```/g, (match, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlockCounter}__`;
      codeBlocks.push(code);
      codeBlockCounter++;
      return placeholder;
    });
    
    // Inline code'ları geçici olarak çıkart
    const inlineCodes: string[] = [];
    let inlineCodeCounter = 0;
    
    processedContent = processedContent.replace(/`([^`]+)`/g, (match, code) => {
      const placeholder = `__INLINE_CODE_${inlineCodeCounter}__`;
      inlineCodes.push(code);
      inlineCodeCounter++;
      return placeholder;
    });
    
    // Başlıkları dönüştür
    let htmlContent = processedContent
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
    
    // Liste öğelerini işlemek için ayrıntılı yaklaşım
    let inList = false;
    const lines = htmlContent.split('\n');
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Liste öğesi mi kontrol et
      if (line.match(/^- (.*?)$/)) {
        const listItem = line.replace(/^- (.*?)$/, '<li>$1</li>');
        
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        
        processedLines.push(listItem);
        
        // Son liste öğesi mi kontrol et
        const nextLine = i < lines.length - 1 ? lines[i + 1] : null;
        if (!nextLine || !nextLine.match(/^- (.*?)$/)) {
          processedLines.push('</ul>');
          inList = false;
        }
      } else {
        processedLines.push(line);
      }
    }
    
    htmlContent = processedLines.join('\n');
    
    // Bold ve italik metinleri dönüştür
    htmlContent = htmlContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Paragrafları dönüştür
      .replace(/\n{2,}/g, '</p><p>')
      // Satır sonlarını <br> olarak dönüştür
      .replace(/\n/g, '<br>');
    
    // Son içeriği paragraf içine sarma
    htmlContent = `<p>${htmlContent}</p>`;
    
    // Code block'ları geri koy
    for (let i = 0; i < codeBlocks.length; i++) {
      const code = codeBlocks[i]
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      htmlContent = htmlContent.replace(
        `__CODE_BLOCK_${i}__`, 
        `</p><pre><code>${code}</code></pre><p>`
      );
    }
    
    // Inline code'ları geri koy
    for (let i = 0; i < inlineCodes.length; i++) {
      const code = inlineCodes[i]
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      htmlContent = htmlContent.replace(
        `__INLINE_CODE_${i}__`, 
        `<code>${code}</code>`
      );
    }
    
    // Güvenli HTML olarak dönme
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  generateImageWithAI() {
    // Kullanıcının AI görsel oluşturma yetkisini kontrol et
    if (!this.canUseAiImageGeneration()) {
      Swal.fire({
        title: this.translationService.getTranslation('ai_image_feature_max_only') || 'MAX Abonelik Gerekli',
        text: this.translationService.getTranslation('ai_image_feature_max_description') || 
          'AI ile görsel oluşturma özelliği sadece MAX aboneliğine sahip kullanıcılar tarafından kullanılabilir.',
        icon: 'info',
        confirmButtonText: this.translationService.getTranslation('ok') || 'Tamam'
      });
      return;
    }
    
    // Başlık, kategori ve içeriği al
    const title = this.postForm.get('title')?.value ? this.postForm.get('title')?.value.trim() : '';
    const categoryId = this.postForm.get('categoryId')?.value;
    const content = this.postForm.get('content')?.value ? this.postForm.get('content')?.value.trim() : '';
    
    // Kategori adını bul
    let categoryName = '';
    if (categoryId) {
      const category = this.categories.find(c => c.id === parseInt(categoryId));
      if (category) {
        categoryName = category.name;
      }
    }
    
    // Prompt için içeriği hazırla
    let combinedPrompt = '';
    
    if (title) {
      combinedPrompt += `Başlık: ${title}. `;
    }
    
    if (categoryName) {
      combinedPrompt += `Kategori: ${categoryName}. `;
    }
    
    // İçeriğin ilk 300 karakterini al (çok uzun olmaması için)
    if (content) {
      const shortContent = content.length > 300 ? content.substring(0, 300) + '...' : content;
      combinedPrompt += `İçerik: ${shortContent}`;
    }
    
    // Hazır prompt ile dialogu göster
    this.showAiImageDialog = true;
    this.aiImagePrompt = combinedPrompt;
    this.aiImageError = '';
    this.aiGeneratedImageUrl = '';
    this.showApplyImageButton = false;
  }

  closeAiImageDialog() {
    this.showAiImageDialog = false;
    this.aiImagePrompt = '';
    this.aiImageError = '';
    this.aiGeneratedImageUrl = '';
    this.showApplyImageButton = false;
  }

  submitAiImageGeneration() {
    if (!this.aiImagePrompt.trim()) {
      this.aiImageError = 'Lütfen görsel açıklaması girin';
      return;
    }

    this.isAiImageGenerating = true;
    this.aiImageError = '';
    this.aiGeneratedImageUrl = '';
    this.showApplyImageButton = false;

    this.writerAiService.generateImageWithAI(this.aiImagePrompt)
      .subscribe({
        next: (response) => {
          if (response && response.url) {
            // URL'yi göster ama henüz ekleme
            this.aiGeneratedImageUrl = response.url;
            this.showApplyImageButton = true;
          } else {
            this.aiImageError = 'Görsel URL alınamadı, lütfen tekrar deneyin';
          }
          this.isAiImageGenerating = false;
        },
        error: (error) => {
          console.error('AI görsel hatası:', error);
          this.isAiImageGenerating = false;
          this.aiImageError = error.message || 'Görsel oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
        }
      });
  }
  
  applyAiImage() {
    if (this.aiGeneratedImageUrl) {
      // AI tarafından oluşturulan URL'yi direkt olarak önizleme dizisine ekle
      this.uploadedImages.push({ 
        url: this.aiGeneratedImageUrl,
        isAiImage: true // AI tarafından oluşturulduğunu işaretle
      });
      
      // Dialog'u kapat ve durumu sıfırla
      this.showAiImageDialog = false;
      this.aiImagePrompt = '';
      this.aiGeneratedImageUrl = '';
      this.showApplyImageButton = false;
    }
  }

  toggleMarkdownPreview() {
    this.showMarkdownPreview = !this.showMarkdownPreview;
  }

  // Kullanıcının AI içerik oluşturma yetkisi olup olmadığını kontrol eden yeni metod
  canUseAiContentGeneration(): boolean {
    return this.userSubscriptionPlan === 'PLUS' || this.userSubscriptionPlan === 'MAX';
  }

  // Kullanıcının AI görsel oluşturma yetkisi olup olmadığını kontrol eden yeni metod
  canUseAiImageGeneration(): boolean {
    return this.userSubscriptionPlan === 'MAX';
  }
} 