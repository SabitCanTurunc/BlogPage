import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { PostResponseDto } from '../../models/post-response.dto';
import { HeaderComponent } from '../header/header.component';
import { Subscription } from 'rxjs';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { ErrorHandlerUtil } from '../../utils/error-handler.util';

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
  
  // Sayfalama değişkenleri
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  subscriptions: Subscription[] = [];
  
  // Yan panel yükleme durumları
  loadingSidebar: boolean = true;
  sidebarError: string = '';

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit() {
    this.loadPosts(true);
    this.loadSidebarData();
  }
  
  ngOnDestroy() {
    // Abonelikleri temizle
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Yan panel verilerini yükle
  loadSidebarData() {
    this.loadingSidebar = true;
    this.sidebarError = '';
    
    const categoriesSub = this.postService.getCategories().subscribe({
      next: (categories: string[]) => {
        this.categories = categories;
      },
      error: (err: any) => {
        this.sidebarError = ErrorHandlerUtil.handleError(err, 'Kategoriler yüklenemedi');
      }
    });
    
    const popularAuthorsSub = this.postService.getPopularAuthors().subscribe({
      next: (authors: string[]) => {
        this.popularAuthors = authors;
      },
      error: (err: any) => {
        if (!this.sidebarError) {
          this.sidebarError = ErrorHandlerUtil.handleError(err, 'Popüler yazarlar yüklenemedi');
        }
      }
    });
    
    const recentPostsSub = this.postService.getRecentPosts().subscribe({
      next: (recentPosts: PostResponseDto[]) => {
        this.recentPosts = recentPosts;
      },
      error: (err: any) => {
        if (!this.sidebarError) {
          this.sidebarError = ErrorHandlerUtil.handleError(err, 'Son yazılar yüklenemedi');
        }
      }
    });
    
    // Tüm isteklerin tamamlanmasını bekle
    forkJoin({
      categories: this.postService.getCategories().pipe(catchError(err => {
        return of([]);
      })),
      authors: this.postService.getPopularAuthors().pipe(catchError(err => {
        return of([]);
      })),
      recent: this.postService.getRecentPosts().pipe(catchError(err => {
        return of([]);
      }))
    }).subscribe({
      next: (results) => {
        // Eğer üç veri de boş ise hata mesajı göster
        if (results.categories.length === 0 && results.authors.length === 0 && results.recent.length === 0) {
          this.sidebarError = 'Yan panel verileri yüklenemedi';
        }
        
        // Sonuçları güncelle (yukarıdaki abonelikler zaten güncelliyor ama emin olmak için)
        if (results.categories.length > 0) this.categories = results.categories;
        if (results.authors.length > 0) this.popularAuthors = results.authors;
        if (results.recent.length > 0) this.recentPosts = results.recent;
      },
      error: (err) => {
        this.sidebarError = ErrorHandlerUtil.handleError(err, 'Yan panel verileri yüklenemedi');
      },
      complete: () => {
        // Tüm işlemler tamamlandığında yükleme durumunu kapat
        this.loadingSidebar = false;
      }
    });
    
    // Abonelikleri kaydet
    this.subscriptions.push(categoriesSub, popularAuthorsSub, recentPostsSub);
  }
  
  // Daha fazla yazı yüklemek için buton metodu
  loadMorePosts() {
    // Sayfa sınırlarını kontrol et
    if (this.currentPage >= this.totalPages - 1 || this.loading) {
      return;
    }
    
    this.loading = true;
    this.cdr.markForCheck();
    
    const sub = this.postService.getPagedPosts(this.currentPage + 1, this.pageSize, this.selectedCategory || undefined)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          const newPosts = response.posts || [];
          
          // Mevcut postlara ekle
          this.posts = [...this.posts, ...newPosts];
          this.filteredPosts = [...this.filteredPosts, ...newPosts];
          this.currentPage++;
          this.loading = false;
          
          // UI'ı güncelle
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.loading = false;
          this.error = ErrorHandlerUtil.handleError(err, 'Daha fazla yazı yüklenirken bir hata oluştu');
          this.cdr.markForCheck();
        }
      });
      
    this.subscriptions.push(sub);
  }

  // İlk yükleme veya kategori değişimi
  loadPosts(isInitialLoad: boolean = false) {
    this.loading = true;
    this.error = '';
    this.currentPage = 0;
    
    // Sayfalı veri getirme
    const sub = this.postService.getPagedPosts(this.currentPage, this.pageSize, this.selectedCategory || undefined).subscribe({
      next: (response) => {
        this.posts = response.posts || [];
        this.filteredPosts = response.posts || [];
        this.totalPages = response.totalPages || 0;
        this.loading = false;
      },
      error: (error) => {
        this.error = ErrorHandlerUtil.handleError(error, 'Blog yazıları yüklenirken bir hata oluştu');
        this.loading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  filterByCategory(category: string | null) {
    this.selectedCategory = category;
    this.currentPage = 0;
    this.loadPosts();
  }

  searchPosts() {
    if (this.searchQuery.trim()) {
      // Arama yaparken sayfalama devre dışı, arama API'sini çağır
      const sub = this.postService.searchPosts(this.searchQuery).subscribe({
        next: (posts: PostResponseDto[]) => {
          this.filteredPosts = posts;
        },
        error: (err) => {
          console.error('Arama sırasında hata:', err);
          this.error = ErrorHandlerUtil.handleError(err, 'Arama yapılırken bir hata oluştu');
        }
      });
      
      this.subscriptions.push(sub);
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