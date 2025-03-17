import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="comments-section">
      <h3>Yorumlar</h3>
      
      <div *ngIf="isLoggedIn" class="comment-form">
        <form [formGroup]="commentForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <textarea 
              formControlName="comment" 
              class="form-control" 
              placeholder="Yorumunuzu yazın..."
              rows="3"></textarea>
            <div *ngIf="commentForm.get('comment')?.errors?.['required'] && commentForm.get('comment')?.touched" class="error-message">
              Yorum alanı boş olamaz
            </div>
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="commentForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Gönderiliyor...' : 'Yorum Yap' }}
          </button>
        </form>
      </div>
      
      <div *ngIf="!isLoggedIn" class="login-prompt">
        <p>Yorum yapabilmek için <a routerLink="/login">giriş yapın</a>.</p>
      </div>
      
      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div *ngIf="success" class="alert alert-success">
        {{ success }}
      </div>
      
      <div class="comments-list">
        <div *ngIf="comments.length === 0" class="no-comments">
          <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        </div>
        
        <div *ngFor="let comment of comments" class="comment-item">
          <div class="comment-header">
            <div class="comment-author">
              <img [src]="'https://ui-avatars.com/api/?name=' + comment.username" alt="Kullanıcı" class="author-avatar">
              <span class="author-name">{{ comment.username }}</span>
            </div>
            <div class="comment-date">
              {{ comment.createdAt | date:'dd.MM.yyyy HH:mm' }}
            </div>
          </div>
          <div class="comment-content">
            {{ comment.comment }}
          </div>
          <div *ngIf="canDelete(comment)" class="comment-actions">
            <button (click)="deleteComment(comment.id)" class="btn-delete">Sil</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap');
    
    .comments-section {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #ff00e6;
      font-family: 'Poppins', sans-serif;
    }
    
    h3 {
      color: #ff00e6;
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      position: relative;
      padding-bottom: 0.5rem;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
      letter-spacing: 1px;
    }
    
    h3::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: linear-gradient(45deg, #5000ff, #ff00e6);
      border-radius: 3px;
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }
    
    .comment-form {
      margin-bottom: 2rem;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid rgba(255, 0, 230, 0.3);
      border-radius: 8px;
      font-size: 1rem;
      background: rgba(20, 20, 40, 0.6);

      color: #ffffff;
      transition: all 0.3s ease;
      resize: vertical;
      box-shadow: 0 0 10px rgba(80, 0, 255, 0.2);
    }
    
    .form-control:focus {
      outline: none;
      border-color: #ff00e6;
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
    }
    
    .form-control::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    
    .error-message {
      color: #ff00e6;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 50px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 1rem;
      font-family: 'Poppins', sans-serif;
      position: relative;
      overflow: hidden;
      z-index: 1;
    }
    
    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #5000ff, #ff00e6);
      opacity: 0;
      z-index: -1;
      transition: opacity 0.3s;
    }
    
    .btn:hover:not(:disabled)::before {
      opacity: 1;
    }
    
    .btn-primary {
      background: rgba(80, 0, 255, 0.2);
      color: #ffffff;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
    }
    
    .btn-primary:hover:not(:disabled) {
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
      transform: translateY(-2px);
    }
    
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .login-prompt {
      background: rgba(20, 20, 40, 0.6);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      text-align: center;
      color: #ffffff;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(80, 0, 255, 0.2);
    }
    
    .login-prompt a {
      color: #ff00e6;
      text-decoration: none;
      font-weight: 600;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
      transition: all 0.3s ease;
    }
    
    .login-prompt a:hover {
      text-decoration: underline;
      text-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }
    
    .alert {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border-radius: 8px;
    }
    
    .alert-danger {
      background: rgba(20, 20, 40, 0.6);
      color: #ff00e6;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
    }
    
    .alert-success {
      background: rgba(20, 20, 40, 0.6);
      color: #00ffaa;
      border: 1px solid rgba(0, 255, 170, 0.3);
      box-shadow: 0 0 10px rgba(0, 255, 170, 0.3);
    }
    
    .comments-list {
      margin-top: 2rem;
    }
    
    .no-comments {
      text-align: center;
      padding: 2rem;
      background: rgba(40, 40, 80, 0.5);
      border-radius: 8px;
      color: #ffffff;
      font-style: italic;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(80, 0, 255, 0.2);
    }
    
    .comment-item {
      background: rgba(40, 40, 80, 0.5);
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 0 15px rgba(80, 0, 255, 0.2);
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 0, 230, 0.3);
    }
    
    .comment-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 20px rgba(255, 0, 230, 0.3);
    }
    
    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255, 0, 230, 0.3);
    }
    
    .comment-author {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .author-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #ff00e6;
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }
    
    .author-name {
      font-weight: 600;
      color: #ffffff;
    }
    
    .comment-date {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .comment-content {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #ffffff;
      white-space: pre-wrap;
    }
    
    .comment-actions {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
    }
    
    .btn-delete {
      background: none;
      border: none;
      color: #ff00e6;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.5);
    }
    
    .btn-delete:hover {
      color: #ffffff;
      text-decoration: underline;
      text-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }
    
    @media (max-width: 768px) {
      .comment-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      
      .comment-date {
        font-size: 0.8rem;
      }
      
      .comment-content {
        font-size: 1rem;
      }
    }
  `]
})
export class CommentComponent implements OnInit {
  @Input() postId!: number;
  
  commentForm: FormGroup;
  comments: Comment[] = [];
  isLoggedIn: boolean = false;
  isSubmitting: boolean = false;
  error: string = '';
  success: string = '';
  currentUserEmail: string = '';
  
  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    private authService: AuthService
  ) {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    this.checkAuth();
    this.loadComments();
  }
  
  checkAuth(): void {
    const token = this.authService.getToken();
    if (token) {
      this.isLoggedIn = true;
      this.currentUserEmail = this.authService.getUserEmail() || '';
    } else {
      this.isLoggedIn = false;
    }
  }
  
  loadComments(): void {
    if (!this.postId) return;
    
    this.commentService.getCommentsByPostId(this.postId).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (err) => {
        console.error('Yorumlar yüklenirken hata oluştu:', err);
        this.error = 'Yorumlar yüklenirken bir hata oluştu.';
      }
    });
  }
  
  onSubmit(): void {
    if (this.commentForm.valid && this.isLoggedIn) {
      this.isSubmitting = true;
      this.error = '';
      this.success = '';
      
      const commentData: Comment = {
        comment: this.commentForm.get('comment')?.value.trim(),
        postId: this.postId,
        userEmail: this.currentUserEmail,
        userId: this.authService.getUserId() || undefined,
        username: '' // Backend tarafında doldurulacak
      };
      
      this.commentService.createComment(commentData).subscribe({
        next: (response) => {
          this.comments.unshift(response);
          this.commentForm.reset();
          this.success = 'Yorumunuz başarıyla eklendi.';
          this.isSubmitting = false;
          
          // 3 saniye sonra başarı mesajını kaldır
          setTimeout(() => {
            this.success = '';
          }, 3000);
        },
        error: (err) => {
          console.error('Yorum eklenirken hata oluştu:', err);
          if (err.error?.customException?.message) {
            this.error = err.error.customException.message;
          } else {
            this.error = 'Yorum eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
          }
          this.isSubmitting = false;
        }
      });
    }
  }
  
  canDelete(comment: Comment): boolean {
    return this.isLoggedIn && (this.currentUserEmail === comment.userEmail || this.authService.isAdmin());
  }
  
  deleteComment(commentId?: number): void {
    if (!commentId) return;
    
    if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== commentId);
          this.success = 'Yorum başarıyla silindi.';
          
          // 3 saniye sonra başarı mesajını kaldır
          setTimeout(() => {
            this.success = '';
          }, 3000);
        },
        error: (err) => {
          console.error('Yorum silinirken hata oluştu:', err);
          this.error = 'Yorum silinirken bir hata oluştu.';
        }
      });
    }
  }
}