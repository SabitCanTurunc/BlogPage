import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { PostResponseDto } from '../../models/post-response.dto';
import { UserResponseDto } from '../../models/user-response.dto';
import { CommentComponent } from '../comment/comment.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocalDatePipe } from '../../pipes/translate.pipe';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SummaryDialogComponent } from '../summary-dialog/summary-dialog.component';
import { SummaryService } from '../../services/summary.service';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SubscriptionPlan } from '../../models/subscription-plan.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    CommentComponent, 
    TranslatePipe, 
    LocalDatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {
  post: PostResponseDto | null = null;
  author: UserResponseDto | null = null;
  error: string = '';
  loading: boolean = true;
  hasFullAccess: boolean = false;
  truncatedContent: string = '';

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private summaryService: SummaryService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadPost(params['id']);
      }
    });
  }

  loadPost(id: number) {
    this.loading = true;
    this.error = '';

    // Önce kullanıcının abonelik planını kontrol et
    if (this.authService.isLoggedIn()) {
      this.userService.hasPremiumAccess().pipe(
        tap(hasPremium => {
          this.hasFullAccess = hasPremium;
        }),
        switchMap(() => this.postService.getPostById(id))
      ).subscribe({
        next: (post: PostResponseDto) => {
          this.post = post;
          
          // Premium içerik için erişim kontrolü
          if (post.premium && !this.hasFullAccess) {
            // Premium içeriği yarıya indir
            this.truncateContent(post.content);
          }
          
          this.loadAuthorInfo(post.userEmail);
        },
        error: (error) => {
          this.error = 'post_load_error';
          this.loading = false;
        }
      });
    } else {
      // Giriş yapmamış kullanıcılar için (temel erişim)
      this.hasFullAccess = false;
      this.postService.getPostById(id).subscribe({
        next: (post: PostResponseDto) => {
          this.post = post;
          
          // Premium içerik kontrolü
          if (post.premium) {
            this.truncateContent(post.content);
          }
          
          this.loadAuthorInfo(post.userEmail);
        },
        error: (error) => {
          this.error = 'post_load_error';
          this.loading = false;
        }
      });
    }
  }

  // İçeriği belirli bir uzunluğa kesme
  truncateContent(content: string) {
    if (!content) return;
    
    // İçeriği yarıya indirme
    const contentLength = content.length;
    const halfLength = Math.floor(contentLength / 2);
    
    this.truncatedContent = content.substring(0, halfLength) + 
      '\n\n<div class="premium-content-message">' +
      '<div class="premium-content-backdrop"></div>' +
      '<div class="premium-content-inner">' +
      '<div class="premium-icon">🔒</div>' +
      '<h3>{{ "premium_content" | translate }}</h3>' +
      '<p>{{ "premium_content_info" | translate }}</p>' +
      '<a href="/profile" class="upgrade-button">{{ "upgrade_plan" | translate }}</a>' +
      '</div>' +
      '</div>';
  }

  loadAuthorInfo(email: string) {
    this.userService.getUserProfileByEmail(email).pipe(
      catchError(err => {
        return of({
          id: 0,
          email: email,
          username: email.split('@')[0],
          name: email.split('@')[0],
          role: 'USER',
          enabled: true,
          profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as UserResponseDto);
      })
    ).subscribe({
      next: (userData) => {
        this.author = userData;
        this.loading = false;
      },
      error: (err) => {
        this.author = {
          id: 0,
          email: email,
          username: email.split('@')[0],
          name: email.split('@')[0],
          role: 'USER',
          enabled: true,
          profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.loading = false;
      }
    });
  }
  
  navigateToAuthorProfile(email: string): void {
    this.router.navigate(['/user', email]);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.post?.userEmail || '')}`;
    }
  }

  openSummaryDialog(): void {
    if (!this.post || !this.post.id) {
      return;
    }
    
    const dialogRef = this.dialog.open(SummaryDialogComponent, {
      maxWidth: '95vw',
      width: '600px',
      panelClass: ['custom-dialog-container', 'animate-dialog'],
      data: { 
        summary: '', 
        loading: true,
        postTitle: this.post.title,
        postId: this.post.id,
        postImage: this.post.images && this.post.images.length > 0 ? this.post.images[0] : null,
        images: this.post.images || []
      },
      backdropClass: 'dialog-backdrop',
      disableClose: false,
      autoFocus: false,
      hasBackdrop: true
    });
    
    this.summaryService.getSummaryByPostId(this.post.id).subscribe({
      next: (response) => {
        if (response && response.summary) {
          dialogRef.componentInstance.data.summary = response.summary;
          dialogRef.componentInstance.data.loading = false;
          dialogRef.componentInstance.loading = false;
          dialogRef.componentInstance.startTypewriterEffect();
        } else {
          console.error('Özet bulunamadı');
          dialogRef.componentInstance.data.loading = false;
          dialogRef.componentInstance.loading = false;
        }
      },
      error: (error) => {
        console.error('Özet yüklenirken hata oluştu:', error);
        dialogRef.componentInstance.data.loading = false;
        dialogRef.componentInstance.loading = false;
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.openSummaryDialog();
      }
    });
  }

  formatHtmlContent(content: string): SafeHtml {
    if (!content) return '';
    
    // Premium içerik kontrolü - Premium içerik ve kullanıcı aboneliği yoksa kısaltılmış içeriği kullan
    const contentToFormat = (this.post?.premium && !this.hasFullAccess) ? this.truncatedContent : content;
    
    // Kod bloklarını işle (önce bunları işlememiz gerekiyor çünkü içindeki markdown'ı dönüştürmek istemiyoruz)
    const codeBlocks: string[] = [];
    let codeBlockCounter = 0;
    
    // Code block'ları geçici olarak çıkart ve yerine placeholder koy
    let processedContent = contentToFormat.replace(/```([\s\S]*?)```/g, (match, code) => {
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
}