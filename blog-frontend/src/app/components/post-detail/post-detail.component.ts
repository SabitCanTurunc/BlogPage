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
    <div class="container mt-4">
      <div *ngIf="post" class="post-detail">
        <div class="post-header">
          <div class="post-meta">
            <span class="post-date">{{ post.createdAt | date:'mediumDate' }}</span>
          </div>
          <div class="post-meta">
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

        <app-comment [postId]="post.id"></app-comment>

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
        <div class="spinner">
          <div class="spinner-inner"></div>
        </div>
        <span>Yükleniyor...</span>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap');
    
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, rgba(10, 10, 26, 0.95), rgba(20, 20, 40, 0.9));
      padding: 2rem 0;
      font-family: 'Poppins', sans-serif;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .post-detail {
      background: rgba(15, 15, 30, 0.8);
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 0 30px rgba(80, 0, 255, 0.3);
      border: 1px solid rgba(255, 0, 230, 0.3);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
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
      color: #ff00e6;
      font-weight: 500;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
    }

    .post-category {
      background: rgba(80, 0, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      color: #ffffff;
      font-weight: 500;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
    }

    h1 {
      color: #ffffff;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      line-height: 1.4;
      border-bottom: 2px solid #ff00e6;
      padding-bottom: 0.5rem;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
      letter-spacing: 1px;
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: center;
      padding: 0.5rem 1rem;
      background: rgba(80, 0, 255, 0.2);
      border-radius: 50px;
      transition: all 0.3s;
      border: 1px solid rgba(255, 0, 230, 0.3);
      width: fit-content;
      margin: 0 auto;
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
    }

    .post-author:hover {
      background: rgba(255, 0, 230, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
    }

    .author-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #ff00e6;
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }

    .author-name {
      color: #ffffff;
      font-weight: 500;
    }

    .post-content {
      font-size: 1.2rem;
      line-height: 1.8;
      color: #ffffff;
      white-space: pre-wrap;
      background: rgba(20, 20, 80, 0.5);
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 20px rgba(80, 0, 255, 0.2);
    }

    .post-images {
      margin-top: 3rem;
    }

    .post-images h3 {
      color: #ff00e6;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      position: relative;
      padding-bottom: 0.5rem;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
    }

    .post-images h3::after {
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

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .image-item {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(80, 0, 255, 0.3);
      transition: all 0.3s;
      border: 1px solid rgba(255, 0, 230, 0.3);
    }

    .image-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 0 30px rgba(255, 0, 230, 0.5);
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
      border-top: 2px solid #ff00e6;
      text-align: center;
    }

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
      padding: 0.75rem 1.5rem;
      background: rgba(80, 0, 255, 0.2);
      border-radius: 50px;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
      position: relative;
      overflow: hidden;
      z-index: 1;
    }

    .back-button::before {
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

    .back-button:hover::before {
      opacity: 1;
    }

    .back-button:hover {
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
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
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #ff00e6;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      position: relative;
      margin-bottom: 1rem;
    }

    .spinner::before, .spinner::after {
      content: '';
      position: absolute;
      border-radius: 50%;
    }

    .spinner::before {
      width: 100%;
      height: 100%;
      background-image: linear-gradient(90deg, #5000ff 0%, #ff00e6 100%);
      animation: spin 0.5s infinite linear;
    }

    .spinner::after {
      width: 85%;
      height: 85%;
      background-color: rgba(15, 15, 30, 0.8);
      top: 7.5%;
      left: 7.5%;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .alert-danger {
      background: rgba(20, 20, 40, 0.6);
      border: 1px solid rgba(255, 0, 230, 0.3);
      color: #ff00e6;
      border-radius: 12px;
      padding: 1rem;
      margin-top: 1rem;
      box-shadow: 0 0 20px rgba(255, 0, 230, 0.3);
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
}