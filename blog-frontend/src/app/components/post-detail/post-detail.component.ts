import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { PostResponseDto } from '../../models/post-response.dto';
import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CommentComponent],
  template: `
    <div class="post-detail-container">
      <div class="post-detail-background"></div>
      
      <a routerLink="/" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
        </svg>
        Ana Sayfaya Dön
      </a>
      
      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner">
          <div class="spinner-inner"></div>
        </div>
        <span>Yükleniyor...</span>
      </div>
      
      <div *ngIf="error" class="alert-danger">
        {{ error }}
      </div>
      
      <div *ngIf="post && !loading" class="post-detail-content">
        <div class="post-header">
          <div class="post-meta">
            <div class="post-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
              {{ post.createdAt | date:'mediumDate' }}
            </div>
            <div class="post-meta-item category">
              {{ post.categoryName }}
            </div>
          </div>
          
          <h1 class="post-title">{{ post.title }}</h1>
          
          <div class="post-author" [routerLink]="['/user', post.userEmail]" style="cursor: pointer;">
            <img [src]="'https://ui-avatars.com/api/?name=' + post.userEmail" alt="Yazar" class="author-avatar">
            <span class="author-name">{{ post.userEmail }}</span>
          </div>
        </div>
        
        <div class="post-body">
          <pre class="post-content">{{ post.content }}</pre>
          
          <div *ngIf="post.images && post.images.length > 0" class="post-images">
            <h3>Görseller</h3>
            <div class="image-grid">
              <div *ngFor="let image of post.images" class="image-item">
                <img [src]="image" alt="Post görseli">
              </div>
            </div>
          </div>
        </div>
        
        <div class="comments-section">
          <app-comment [postId]="post.id"></app-comment>
        </div>
      </div>
    </div>
  `,
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  error: string = '';
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private router: Router
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

    this.postService.getPostById(id).subscribe({
      next: (post: PostResponseDto) => {
        this.post = post;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Blog yazısı yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        this.loading = false;
      }
    });
  }
  
  navigateToAuthorProfile(email: string): void {
    this.router.navigate(['/user', email]);
  }
}