import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="blog-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1>Blog Platformu</h1>
          <p class="hero-subtitle">Düşüncelerinizi paylaşın, bilgi birikimini artırın</p>
          <div class="hero-buttons">
            <button *ngIf="!isLoggedIn" (click)="navigateToSignup()" class="btn btn-light">
              Ücretsiz Hesap Oluştur
            </button>
            <button *ngIf="!isLoggedIn" (click)="navigateToLogin()" class="btn btn-outline-light">
              Giriş Yap
            </button>
            <button *ngIf="isLoggedIn" (click)="navigateToCreatePost()" class="btn btn-light">
              Yeni Yazı Oluştur
            </button>
            <button *ngIf="isLoggedIn" (click)="logout()" class="btn btn-danger">
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-content">
            <div class="sidebar-section">
              <h3>Kategoriler</h3>
              <div class="category-list">
                <button 
                  class="category-item"
                  [class.active]="selectedCategory === null"
                  (click)="filterByCategory(null)">
                  Tümü
                </button>
                <button 
                  *ngFor="let category of categories"
                  class="category-item"
                  [class.active]="selectedCategory === category"
                  (click)="filterByCategory(category)">
                  {{ category }}
                </button>
              </div>
            </div>

            <div class="sidebar-section">
              <h3>Popüler Yazarlar</h3>
              <div class="popular-authors">
                <div *ngFor="let author of popularAuthors" class="author-item">
                  <img [src]="'https://ui-avatars.com/api/?name=' + author" alt="Yazar" class="author-avatar">
                  <span class="author-name">{{ author }}</span>
                </div>
              </div>
            </div>

            <div class="sidebar-section">
              <h3>Son Yazılar</h3>
              <div class="recent-posts">
                <div *ngFor="let post of recentPosts" class="recent-post-item">
                  <a [routerLink]="['/post', post.id]" class="recent-post-link">
                    {{ post.title }}
                  </a>
                  <span class="recent-post-date">{{ post.createdAt | date:'shortDate' }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Posts Grid -->
        <div class="posts-section">
          <div class="posts-grid">
            <article *ngFor="let post of filteredPosts" class="post-card">
              <div class="card">
                <div class="card-body">
                  <div class="post-meta">
                    <span class="post-date">{{ post.createdAt | date:'mediumDate' }}</span>
                    <span class="post-category">{{ post.category }}</span>
                  </div>
                  <h2 class="post-title">{{ post.title }}</h2>
                  <p class="post-excerpt">{{ post.content | slice:0:200 }}{{ post.content.length > 200 ? '...' : '' }}</p>
                  <div class="post-footer">
                    <div class="post-author">
                      <img [src]="'https://ui-avatars.com/api/?name=' + post.username" alt="Yazar" class="author-avatar">
                      <span class="author-name">{{ post.username }}</span>
                    </div>
                    <a [routerLink]="['/post', post.id]" class="read-more">
                      Devamını Oku
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </article>
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
      </div>
    </div>
  `,
  styles: [`
    .blog-container {
      min-height: 100vh;
      background-color: #FEFAE0;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(212, 163, 115, 0.1) 0%, transparent 20%),
        radial-gradient(circle at 90% 80%, rgba(204, 213, 174, 0.1) 0%, transparent 20%);
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #CCD5AE 0%, #E9EDC9 100%);
      color: #2C3E50;
      padding: 6rem 2rem;
      text-align: center;
      margin-bottom: 3rem;
      position: relative;
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(212, 163, 115, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(204, 213, 174, 0.2) 0%, transparent 50%);
      z-index: 1;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 800px;
      margin: 0 auto;
    }

    .hero-content h1 {
      font-size: 4rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      background: linear-gradient(45deg, #2C3E50, #D4A373);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .hero-subtitle {
      color: #2C3E50;
      font-size: 1.5rem;
      opacity: 0.9;
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-light {
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      color: #2C3E50;
      border: none;
      padding: 1rem 2.5rem;
      font-weight: 600;
      border-radius: 50px;
      box-shadow: 0 4px 15px rgba(212, 163, 115, 0.3);
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-light:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(212, 163, 115, 0.4);
    }

    .btn-outline-light {
      background: transparent;
      color: #2C3E50;
      border: 2px solid #D4A373;
      padding: 1rem 2.5rem;
      font-weight: 600;
      border-radius: 50px;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-outline-light:hover {
      background: rgba(212, 163, 115, 0.1);
      border-color: #D4A373;
      transform: translateY(-3px);
    }

    .btn-danger {
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      color: #2C3E50;
      border: none;
      padding: 1rem 2.5rem;
      font-weight: 600;
      border-radius: 50px;
      box-shadow: 0 4px 15px rgba(212, 163, 115, 0.3);
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-danger:hover {
      background: linear-gradient(45deg, #CCD5AE, #D4A373);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(212, 163, 115, 0.4);
    }

    /* Main Content Layout */
    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
    }

    /* Sidebar Styles */
    .sidebar {
      position: sticky;
      top: 2rem;
      height: fit-content;
    }

    .sidebar-content {
      background: #E9EDC9;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(212, 163, 115, 0.2);
      padding: 2rem;
      border: 1px solid rgba(212, 163, 115, 0.3);
    }

    .sidebar-section {
      margin-bottom: 2rem;
    }

    .sidebar-section:last-child {
      margin-bottom: 0;
    }

    .sidebar-section h3 {
      color: #D4A373;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      position: relative;
      padding-bottom: 0.5rem;
    }

    .sidebar-section h3::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      border-radius: 3px;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-item {
      padding: 1rem 1.5rem;
      border: none;
      background: #FEFAE0;
      text-align: left;
      border-radius: 12px;
      transition: all 0.3s;
      color: #2C3E50;
      font-size: 1rem;
      font-weight: 500;
      border: 1px solid rgba(212, 163, 115, 0.2);
    }

    .category-item:hover {
      background: #FAEDCD;
      transform: translateX(5px);
    }

    .category-item.active {
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      color: #2C3E50;
      box-shadow: 0 4px 15px rgba(212, 163, 115, 0.3);
    }

    /* Popular Authors */
    .popular-authors {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .author-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 4px;
      transition: all 0.3s;
      background: #FEFAE0;
      border: 1px solid rgba(212, 163, 115, 0.2);
    }

    .author-item:hover {
      background: #FAEDCD;
      transform: translateX(5px);
    }

    .author-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .author-name {
      color: #2C3E50;
      font-size: 0.9rem;
    }

    /* Recent Posts */
    .recent-posts {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .recent-post-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .recent-post-link {
      color: #2C3E50;
      text-decoration: none;
      font-size: 0.9rem;
      line-height: 1.4;
      transition: color 0.2s;
    }

    .recent-post-link:hover {
      color: #D4A373;
    }

    .recent-post-date {
      color: rgba(44, 62, 80, 0.6);
      font-size: 0.8rem;
    }

    /* Posts Section */
    .posts-section {
      min-height: 500px;
    }

    .posts-grid {
      display: grid;
      gap: 2rem;
    }

    .post-card {
      background: #FEFAE0;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(212, 163, 115, 0.2);
      transition: all 0.3s;
      border: 1px solid rgba(212, 163, 115, 0.3);
      overflow: hidden;
    }

    .post-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 12px 40px rgba(212, 163, 115, 0.3);
    }

    .card-body {
      padding: 2rem;
      background: #FEFAE0;
    }

    .card {
      background-color: #FEFAE0;
      border: none;
    }

    .post-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      color: #2C3E50;
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

    .post-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #2C3E50;
      margin-bottom: 1.5rem;
      line-height: 1.4;
      border-bottom: 2px solid #D4A373;
      padding-bottom: 0.5rem;
    }

    .post-excerpt {
      color: #2C3E50;
      line-height: 1.8;
      margin-bottom: 2rem;
      font-size: 1.1rem;
      background: #E9EDC9;
      padding: 1.5rem;
      border-radius: 12px;
    }

    .post-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 2px solid #D4A373;
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 1rem;
      background: #E9EDC9;
      border-radius: 50px;
      transition: all 0.3s;
      border: 1px solid rgba(212, 163, 115, 0.3);
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

    .read-more {
      display: flex;
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

    .read-more:hover {
      background: #CCD5AE;
      transform: translateX(5px);
    }

    .read-more svg {
      transition: transform 0.3s;
    }

    .read-more:hover svg {
      transform: translateX(4px);
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    /* Responsive Design */
    @media (max-width: 992px) {
      .main-content {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: relative;
        top: 0;
      }

      .hero-buttons {
        flex-direction: column;
      }

      .prompt-buttons {
        flex-direction: column;
      }
    }

    @media (max-width: 768px) {
      .hero-section {
        padding: 3rem 1rem;
      }

      .hero-content h1 {
        font-size: 2.5rem;
      }

      .main-content {
        padding: 0 1rem;
      }
    }

    .alert-info {
      background: #E9EDC9;
      border: 1px solid rgba(212, 163, 115, 0.3);
      color: #2C3E50;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(212, 163, 115, 0.2);
    }

    .login-prompt {
      background: #E9EDC9;
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 8px 32px rgba(212, 163, 115, 0.2);
      border: 1px solid rgba(212, 163, 115, 0.3);
    }

    .login-prompt h4 {
      color: #D4A373;
      margin-bottom: 1.5rem;
      font-size: 2rem;
      font-weight: 700;
    }

    .login-prompt p {
      color: #2C3E50;
      margin-bottom: 2rem;
      font-size: 1.2rem;
      line-height: 1.6;
    }

    .prompt-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-primary {
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      border: none;
      color: #2C3E50;
      padding: 1rem 2.5rem;
      font-weight: 600;
      border-radius: 50px;
      box-shadow: 0 4px 15px rgba(212, 163, 115, 0.3);
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(212, 163, 115, 0.4);
    }

    .btn-outline-primary {
      color: #D4A373;
      border: 2px solid #D4A373;
      padding: 1rem 2.5rem;
      font-weight: 600;
      border-radius: 50px;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-outline-primary:hover {
      background: rgba(212, 163, 115, 0.1);
      transform: translateY(-3px);
    }
  `]
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  categories: string[] = [];
  selectedCategory: string | null = null;
  error: string = '';
  loading: boolean = true;
  isLoggedIn: boolean = false;
  popularAuthors: string[] = [];
  recentPosts: Post[] = [];

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    this.error = '';

    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.filteredPosts = posts;
        this.categories = [...new Set(posts.map(post => post.category))].sort();
        
        // Popüler yazarları hesapla (en çok yazı yazanlar)
        const authorCounts = posts.reduce((acc, post) => {
          acc[post.username] = (acc[post.username] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });
        
        this.popularAuthors = Object.entries(authorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([author]) => author);

        // Son yazıları al
        this.recentPosts = [...posts]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        this.loading = false;
      },
      error: (err) => {
        console.error('Post yükleme hatası:', err);
        this.error = 'Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        this.loading = false;
      }
    });
  }

  filterByCategory(category: string | null) {
    this.selectedCategory = category;
    this.filteredPosts = category 
      ? this.posts.filter(post => post.category === category)
      : this.posts;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  navigateToCreatePost() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/post/create']);
    }
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/home']);
  }
} 