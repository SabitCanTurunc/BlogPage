import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Comment } from '../../models/comment.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
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
    
    Swal.fire({
      title: 'Yorumu Sil',
      text: 'Bu yorumu silmek istediğinizden emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal',
      background: '#1a1a2e',
      color: '#ffffff',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        htmlContainer: 'modern-swal-content',
        confirmButton: 'modern-swal-confirm',
        cancelButton: 'modern-swal-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.commentService.deleteComment(commentId).subscribe({
          next: () => {
            this.comments = this.comments.filter(c => c.id !== commentId);
            
            Swal.fire({
              title: 'Başarılı',
              text: 'Yorum başarıyla silindi.',
              icon: 'success',
              background: '#1a1a2e',
              color: '#ffffff',
              timer: 3000,
              showConfirmButton: false,
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content'
              }
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Hata',
              text: 'Yorum silinirken bir hata oluştu.',
              icon: 'error',
              background: '#1a1a2e',
              color: '#ffffff',
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                htmlContainer: 'modern-swal-content'
              }
            });
          }
        });
      }
    });
  }
}