import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { PostResponseDto } from '../../models/post-response.dto';
import { HeaderComponent } from '../header/header.component';
import { InfiniteScrollDirective } from '../../directives/infinite-scroll.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InfiniteScrollDirective],
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
  
  // Sayfalama değişkenleri
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  hasMorePosts: boolean = true;
  loadingMore: boolean = false;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit() {
    this.loadPosts(true);
  }
  
  // Infinite scroll direktifinden gelen olayı dinle
  onScroll() {
    console.log("Infinite scroll olayı alındı");
    if (!this.loading && !this.loadingMore && this.hasMorePosts && this.searchQuery.trim() === '') {
      console.log('Daha fazla post yükleniyor...');
      this.loadMorePosts();
    }
  }
  
  // Daha fazla post yükle
  loadMorePosts(): void {
    console.log('loadMorePosts çağrıldı. CurrentPage:', this.currentPage, 'TotalPages:', this.totalPages);
    
    if (this.currentPage < this.totalPages - 1) {
      this.loadingMore = true;
      this.currentPage++;
      
      console.log('Yeni sayfa yükleniyor. Page:', this.currentPage, 'Size:', this.pageSize);
      
      this.postService.getPagedPosts(this.currentPage, this.pageSize, this.selectedCategory || undefined).subscribe({
        next: (response) => {
          console.log('Sayfa başarıyla yüklendi:', response);
          console.log('Alınan post sayısı:', response.posts?.length || 0);
          
          const newPosts = response.posts as PostResponseDto[];
          this.posts = [...this.posts, ...newPosts];
          this.filteredPosts = [...this.filteredPosts, ...newPosts];
          this.loadingMore = false;
          
          console.log('Toplam post sayısı:', this.posts.length);
        },
        error: (error) => {
          console.error('Post yükleme hatası:', error);
          this.error = 'Daha fazla yazı yüklenirken bir hata oluştu.';
          this.loadingMore = false;
        }
      });
    } else {
      console.log('Daha fazla sayfa yok. Yükleme durduruldu.');
      this.hasMorePosts = false;
    }
  }

  // İlk yükleme veya kategori değişimi
  loadPosts(isInitialLoad: boolean = false) {
    this.loading = true;
    this.error = '';
    this.currentPage = 0;
    this.hasMorePosts = true;
    
    console.log('İlk postlar yükleniyor...');
    
    // Sayfalı veri getirme
    this.postService.getPagedPosts(this.currentPage, this.pageSize, this.selectedCategory || undefined).subscribe({
      next: (response) => {
        console.log('İlk sayfa başarıyla yüklendi:', response);
        
        this.posts = response.posts || [];
        this.filteredPosts = response.posts || [];
        this.totalPages = response.totalPages || 0;
        
        // totalPages 1'den büyükse daha fazla post vardır
        this.hasMorePosts = response.totalPages > 1;
        
        console.log('HasMorePosts:', this.hasMorePosts);
        console.log('TotalPages:', this.totalPages);
        
        if (isInitialLoad) {
          // İlk yüklemede kategorileri ve popüler yazarları hesapla
          this.postService.getAllPosts().subscribe(allPosts => {
            this.categories = [...new Set(allPosts.map(post => post.categoryName))].sort();
            this.authorStats = allPosts.reduce((acc: { [key: string]: number }, post) => {
              acc[post.userEmail] = (acc[post.userEmail] || 0) + 1;
              return acc;
            }, {});
            this.popularAuthors = Object.entries(this.authorStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([author]) => author);
            this.recentPosts = [...allPosts]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5);
          });
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('İlk sayfa yükleme hatası:', error);
        this.error = 'Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        this.loading = false;
      }
    });
  }

  filterByCategory(category: string | null) {
    this.selectedCategory = category;
    this.currentPage = 0;
    this.loadPosts();
  }

  searchPosts() {
    if (this.searchQuery.trim()) {
      // Arama yaparken sayfalama devre dışı, normal filtre kullan
      this.postService.getAllPosts().subscribe({
        next: (posts: PostResponseDto[]) => {
          const query = this.searchQuery.toLowerCase().trim();
          this.filteredPosts = posts.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            post.userEmail.toLowerCase().includes(query) ||
            post.categoryName.toLowerCase().includes(query)
          );
        }
      });
    } else {
      // Arama temizlendiğinde sayfalı verileri geri yükle
      this.loadPosts();
    }
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