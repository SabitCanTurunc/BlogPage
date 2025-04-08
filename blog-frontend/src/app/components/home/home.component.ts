import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { PostResponseDto } from '../../models/post-response.dto';
import { UserResponseDto } from '../../models/user-response.dto';
import { Subscription } from 'rxjs';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { ErrorHandlerUtil } from '../../utils/error-handler.util';
import { UserService } from '../../services/user.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocalDatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

interface Author {
  email: string;
  name: string;
  profileImage: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe, LocalDatePipe],
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
  popularAuthors: Author[] = [];
  recentPosts: PostResponseDto[] = [];
  authorStats: { [key: string]: number } = {};
  searchQuery: string = '';
  
  // Sayfalama değişkenleri
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  subscriptions: Subscription[] = [];
  
  // Yan panel yükleme durumları
  loadingSidebar: boolean = true;
  sidebarError: string = '';

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private translationService: TranslationService
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit() {
    this.loadPosts(true);
    this.loadSidebarData();
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  loadSidebarData() {
    this.loadingSidebar = true;
    this.sidebarError = '';
    
    const categoriesSub = this.postService.getCategories().subscribe({
      next: (categories: string[]) => {
        this.categories = categories;
      },
      error: (err: any) => {
        this.sidebarError = this.translationService.getTranslation('categories_load_error');
      }
    });
    
    const popularAuthorsSub = this.postService.getPopularAuthors().subscribe({
      next: (authors: string[]) => {
        // Her yazar için profil bilgilerini al
        const authorProfiles = authors.map(email => 
          this.userService.getUserProfileByEmail(email).pipe(
            catchError(err => {
              return of({
                email: email,
                name: email.split('@')[0],
                profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`
              } as UserResponseDto);
            })
          )
        );
        
        // Tüm profil bilgilerini al
        forkJoin(authorProfiles).subscribe({
          next: (profiles: UserResponseDto[]) => {
            this.popularAuthors = profiles.map(profile => ({
              email: profile.email,
              name: profile.name || profile.email.split('@')[0],
              profileImage: profile.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.email)}`
            }));
          },
          error: (err) => {
            this.popularAuthors = authors.map(email => ({
              email: email,
              name: email.split('@')[0],
              profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`
            }));
          }
        });
      },
      error: (err: any) => {
        if (!this.sidebarError) {
          this.sidebarError = this.translationService.getTranslation('authors_load_error');
        }
      }
    });
    
    const recentPostsSub = this.postService.getRecentPosts().subscribe({
      next: (recentPosts: PostResponseDto[]) => {
        this.recentPosts = recentPosts;
      },
      error: (err: any) => {
        if (!this.sidebarError) {
          this.sidebarError = this.translationService.getTranslation('recent_posts_load_error');
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
          this.sidebarError = this.translationService.getTranslation('sidebar_load_error');
        }
        
        // Sonuçları güncelle
        if (results.categories.length > 0) this.categories = results.categories;
        if (results.authors.length > 0) {
          // Her yazar için profil bilgilerini al
          const authorProfiles = results.authors.map(email => 
            this.userService.getUserProfileByEmail(email).pipe(
              catchError(err => {
                return of({
                  email: email,
                  name: email.split('@')[0],
                  profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`
                } as UserResponseDto);
              })
            )
          );
          
          // Tüm profil bilgilerini al
          forkJoin(authorProfiles).subscribe({
            next: (profiles: UserResponseDto[]) => {
              this.popularAuthors = profiles.map(profile => ({
                email: profile.email,
                name: profile.name || profile.email.split('@')[0],
                profileImage: profile.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.email)}`
              }));
            },
            error: (err) => {
              this.popularAuthors = results.authors.map(email => ({
                email: email,
                name: email.split('@')[0],
                profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`
              }));
            }
          });
        }
        if (results.recent.length > 0) this.recentPosts = results.recent;
      },
      error: (err) => {
        this.sidebarError = this.translationService.getTranslation('sidebar_load_error');
      },
      complete: () => {
        this.loadingSidebar = false;
      }
    });
    
    // Abonelikleri kaydet
    this.subscriptions.push(categoriesSub, popularAuthorsSub, recentPostsSub);
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
        this.filteredPosts = [...this.posts];
        this.totalPages = response.totalPages || 1;
        this.loading = false;
        
        // Kullanıcı bilgilerini ekle
        this.enrichPostsWithUserInfo(this.posts);
        
        // UI'ı güncelle
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.error = this.translationService.getTranslation('posts_load_error');
        this.cdr.markForCheck();
      }
    });
    
    this.subscriptions.push(sub);
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
          
          // Kullanıcı bilgilerini ekle
          this.enrichPostsWithUserInfo(newPosts);
          
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
          this.error = this.translationService.getTranslation('load_more_error');
          this.cdr.markForCheck();
        }
      });
      
    this.subscriptions.push(sub);
  }
  
  // Postlara kullanıcı bilgilerini ekle
  enrichPostsWithUserInfo(posts: PostResponseDto[]) {
    posts.forEach(post => {
      // Her post için kullanıcı bilgilerini al
      this.userService.getUserProfileByEmail(post.userEmail).subscribe({
        next: (userProfile) => {
          post.userName = userProfile.name;
          post.userSurname = userProfile.surname;
          post.userProfileImage = userProfile.profileImageUrl;
          this.cdr.markForCheck();
        },
        error: (err) => {
          // Hata durumunda varsayılan değerleri kullan
          post.userName = undefined;
          post.userSurname = undefined;
          post.userProfileImage = undefined;
        }
      });
    });
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

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      const name = img.alt || img.getAttribute('data-email') || 'User';
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
    }
  }
}