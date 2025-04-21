import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Comment } from '../../models/comment.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocalDatePipe } from '../../pipes/translate.pipe';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslatePipe, LocalDatePipe],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent implements OnInit {
  @Input() postId!: number;
  
  commentForm: FormGroup;
  editCommentForm: FormGroup;
  comments: Comment[] = [];
  isLoggedIn: boolean = false;
  isSubmitting: boolean = false;
  isEditing: boolean = false;
  editingCommentId: number | null = null;
  error: string = '';
  success: string = '';
  currentUserEmail: string = '';
  
  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required]]
    });
    
    this.editCommentForm = this.fb.group({
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
        this.enrichCommentsWithUserInfo();
      },
      error: (err) => {
        this.error = 'Yorumlar yüklenirken bir hata oluştu.';
      }
    });
  }

  enrichCommentsWithUserInfo(): void {
    // Eğer yorum yoksa işlem yapma
    if (!this.comments.length) return;

    // Her yorum için kullanıcı bilgilerini al
    this.comments.forEach((comment, index) => {
      this.userService.getUserProfileByEmail(comment.userEmail)
        .pipe(catchError(() => of(null)))
        .subscribe(userData => {
          if (userData) {
            this.comments[index] = {
              ...comment,
              userName: userData.name,
              userSurname: userData.surname,
              userProfileImage: userData.profileImageUrl
            };
          }
        });
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
          // Yeni yorum eklendiğinde kullanıcı bilgilerini de ekle
          this.userService.getUserProfile().subscribe(userData => {
            const enrichedComment: Comment = {
              ...response,
              userName: userData.name,
              userSurname: userData.surname,
              userProfileImage: userData.profileImageUrl
            };
            
            this.comments.unshift(enrichedComment);
            this.commentForm.reset();
            this.success = 'Yorumunuz başarıyla eklendi.';
            this.isSubmitting = false;
            
            // 3 saniye sonra başarı mesajını kaldır
            setTimeout(() => {
              this.success = '';
            }, 3000);
          });
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
  
  canEdit(comment: Comment): boolean {
    return this.isLoggedIn && (this.currentUserEmail === comment.userEmail || this.authService.isAdmin());
  }
  
  canDelete(comment: Comment): boolean {
    return this.isLoggedIn && (this.currentUserEmail === comment.userEmail || this.authService.isAdmin());
  }
  
  startEditComment(comment: Comment): void {
    this.isEditing = true;
    this.editingCommentId = comment.id || null;
    this.editCommentForm.patchValue({
      comment: comment.comment
    });
  }
  
  cancelEditComment(): void {
    this.isEditing = false;
    this.editingCommentId = null;
    this.editCommentForm.reset();
  }
  
  submitEditComment(): void {
    if (this.editCommentForm.valid && this.editingCommentId) {
      // Düzenlenen yorumu bul
      const originalComment = this.comments.find(c => c.id === this.editingCommentId);
      
      if (!originalComment) {
        Swal.fire({
          title: 'Hata',
          text: 'Düzenlenmek istenen yorum bulunamadı',
          icon: 'error',
          customClass: {
            popup: 'modern-swal-popup',
            title: 'modern-swal-title text-white',
            htmlContainer: 'modern-swal-content text-white'
          }
        });
        return;
      }
      
      const commentData: Comment = {
        comment: this.editCommentForm.get('comment')?.value.trim(),
        postId: this.postId,
        userEmail: originalComment.userEmail, // Orijinal yazarın email'ini kullan
        username: originalComment.username || '', // Orijinal yazarın kullanıcı adını koru
        id: this.editingCommentId
      };
      
      this.commentService.updateComment(this.editingCommentId, commentData).subscribe({
        next: (updatedComment) => {
          // Güncellenmiş yorumu comments dizisinde bul ve güncelle
          const index = this.comments.findIndex(c => c.id === this.editingCommentId);
          if (index !== -1) {
            // Mevcut kullanıcı bilgilerini koru
            const existingComment = this.comments[index];
            this.comments[index] = {
              ...updatedComment,
              userName: existingComment.userName,
              userSurname: existingComment.userSurname,
              userProfileImage: existingComment.userProfileImage,
              userEmail: existingComment.userEmail // Orijinal yazarın email'ini koru
            };
          }
          
          this.cancelEditComment();
          
          Swal.fire({
            title: 'Başarılı',
            text: this.authService.isAdmin() ? 'Yorum başarıyla düzenlendi' : 'Yorumunuz başarıyla güncellendi',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false,
            customClass: {
              popup: 'modern-swal-popup',
              title: 'modern-swal-title text-white',
              htmlContainer: 'modern-swal-content text-white'
            }
          });
        },
        error: (err) => {
          let errorMessage = 'Yorum güncellenirken bir hata oluştu';
          
          if (err.error?.customException?.message) {
            errorMessage = err.error.customException.message;
          } else if (err.status === 403) {
            errorMessage = 'Bu yorumu düzenleme yetkiniz bulunmamaktadır';
          } else if (err.status === 404) {
            errorMessage = 'Düzenlenmek istenen yorum bulunamadı';
          }
          
          Swal.fire({
            title: 'Hata',
            text: errorMessage,
            icon: 'error',
            customClass: {
              popup: 'modern-swal-popup',
              title: 'modern-swal-title text-white',
              htmlContainer: 'modern-swal-content text-white'
            }
          });
        }
      });
    }
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
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title text-white',
        htmlContainer: 'modern-swal-content text-white',
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
              timer: 3000,
              showConfirmButton: false,
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title text-white',
                htmlContainer: 'modern-swal-content text-white'
              }
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Hata',
              text: 'Yorum silinirken bir hata oluştu.',
              icon: 'error',
              customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title text-white',
                htmlContainer: 'modern-swal-content text-white'
              }
            });
          }
        });
      }
    });
  }
  
  navigateToUserProfile(email: string): void {
    this.router.navigate(['/user', email]);
  }
}