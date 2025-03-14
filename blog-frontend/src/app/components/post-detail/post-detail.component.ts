import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div *ngIf="post" class="post-detail">
        <div class="post-header">
          <div class="post-meta">
            <span class="post-date">{{ post.createdAt | date:'mediumDate' }}</span>
            <span class="post-category">{{ post.categoryName }}</span>
          </div>
          <h1>{{ post.title }}</h1>
          <div class="post-author">
            <img [src]="'https://ui-avatars.com/api/?name=' + post.userEmail" alt="Yazar" class="author-avatar">
            <span class="author-name">{{ post.userEmail }}</span>
          </div>
        </div>
        
        <div class="post-content">
          {{ post.content }}
        </div>

        <div *ngIf="post.images && post.images.length > 0" class="post-images">
          <h3>Görseller</h3>
          <div class="image-grid">
            <div *ngFor="let image of post.images" class="image-item">
              <img [src]="image" alt="Post görseli">
            </div>
          </div>
        </div>

        <div class="post-footer">
          <a routerLink="/" class="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 1 15 8z"/>
            </svg>
            Ana Sayfaya Dön
          </a>
        </div>
      </div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Yükleniyor...</span>
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

    .post-detail {
      background: #fff;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(212, 163, 115, 0.2);
      border: 1px solid rgba(212, 163, 115, 0.3);
    }

    .post-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .post-meta {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .post-date {
      color: #D4A373;
      font-weight: 500;
    }

    .post-category {
      background: #E9EDC9;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      color: #2C3E50;
      font-weight: 500;
      border: 1px solid rgba(212, 163, 115, 0.3);
    }

    h1 {
      color: #2C3E50;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      line-height: 1.4;
      border-bottom: 2px solid #D4A373;
      padding-bottom: 0.5rem;
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: center;
      padding: 0.5rem 1rem;
      background: #E9EDC9;
      border-radius: 50px;
      transition: all 0.3s;
      border: 1px solid rgba(212, 163, 115, 0.3);
      width: fit-content;
      margin: 0 auto;
    }

    .post-author:hover {
      background: #CCD5AE;
      transform: translateY(-2px);
    }

    .author-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #D4A373;
    }

    .author-name {
      color: #2C3E50;
      font-weight: 500;
    }

    .post-content {
      font-size: 1.2rem;
      line-height: 1.8;
      color: #2C3E50;
      white-space: pre-wrap;
      background: #E9EDC9;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .post-images {
      margin-top: 3rem;
    }

    .post-images h3 {
      color: #D4A373;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      position: relative;
      padding-bottom: 0.5rem;
    }

    .post-images h3::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      border-radius: 3px;
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .image-item {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(212, 163, 115, 0.2);
      transition: all 0.3s;
    }

    .image-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(212, 163, 115, 0.3);
    }

    .image-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .post-footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #D4A373;
      text-align: center;
    }

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      color: #2C3E50;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
      padding: 0.75rem 1.5rem;
      background: #D4A373;
      border-radius: 50px;
      border: none;
    }

    .back-button:hover {
      background: #CCD5AE;
      transform: translateX(-5px);
    }

    .back-button svg {
      transition: transform 0.3s;
    }

    .back-button:hover svg {
      transform: translateX(-4px);
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .alert-danger {
      background: #FEFAE0;
      border: 1px solid #D4A373;
      color: #2C3E50;
      border-radius: 12px;
      padding: 1rem;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .post-detail {
        padding: 1.5rem;
      }

      h1 {
        font-size: 2rem;
      }

      .post-content {
        font-size: 1.1rem;
        padding: 1.5rem;
      }
    }
  `]
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  error: string = '';
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
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
      next: (post) => {
        this.post = post;
        this.loading = false;
      },
      error: (err) => {
        console.error('Post yükleme hatası:', err);
        this.error = 'Post yüklenirken bir hata oluştu.';
        this.loading = false;
      }
    });
  }
} 