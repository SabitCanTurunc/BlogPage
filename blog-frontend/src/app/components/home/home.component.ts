import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { PostResponseDto } from '../../models/post-response.dto';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  posts: PostResponseDto[] = [];
  filteredPosts: PostResponseDto[] = [];
  categories: string[] = [];
  selectedCategory: string | null = null;
  error: string = '';
  loading: boolean = true;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  popularAuthors: string[] = [];
  recentPosts: PostResponseDto[] = [];
  authorStats: { [key: string]: number } = {};
  searchQuery: string = '';

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    this.error = '';

    this.postService.getAllPosts().subscribe({
      next: (posts: PostResponseDto[]) => {
        this.posts = posts;
        this.filteredPosts = posts;
        this.categories = [...new Set(posts.map(post => post.categoryName))].sort();
        this.authorStats = posts.reduce((acc: { [key: string]: number }, post) => {
          acc[post.userEmail] = (acc[post.userEmail] || 0) + 1;
          return acc;
        }, {});
        this.popularAuthors = Object.entries(this.authorStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([author]) => author);
        this.recentPosts = [...posts]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        this.loading = false;
      }
    });
  }

  filterByCategory(category: string | null) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  searchPosts() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.posts];

    // Kategori filtresi
    if (this.selectedCategory) {
      filtered = filtered.filter(post => post.categoryName === this.selectedCategory);
    }

    // Arama filtresi
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.userEmail.toLowerCase().includes(query) ||
        post.categoryName.toLowerCase().includes(query)
      );
    }

    this.filteredPosts = filtered;
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
      this.router.navigate(['/create-post']);
    }
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/home']);
  }
}