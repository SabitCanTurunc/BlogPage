import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HighlightService } from '../../services/highlight.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { environment } from '../../../environments/environment';

interface StoryHighlight {
  id: number;
  postId: number;
  title: string;
  userEmail: string;
  userName: string;
  userProfileImage: string;
  coverImage: string;
  seen: boolean;
}

interface UserHighlights {
  userEmail: string;
  userName: string; 
  userProfileImage: string;
  highlights: StoryHighlight[];
}

interface Story {
  id: number;
  username: string;
  userAvatar: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
}

@Component({
  selector: 'app-story-highlights',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './story-highlights.component.html',
  styleUrls: ['./story-highlights.component.css']
})
export class StoryHighlightsComponent implements OnInit, OnDestroy {
  highlights: StoryHighlight[] = [];
  userHighlights: UserHighlights[] = [];
  isLoading: boolean = true;
  error: string = '';
  
  // Dialog özellikleri
  showDialog: boolean = false;
  selectedUser: UserHighlights | null = null;
  selectedHighlightIndex: number = 0;
  dialogTimer: any = null;
  
  // Document visibility için değişkenler
  visibilityHandler: any = null;
  isPageVisible: boolean = true;
  isBrowser: boolean = false;
  isMobile: boolean = false;

  stories: Story[] = [];
  selectedStory: Story | null = null;
  currentIndex: number = 0;

  touchStartX: number = 0;
  touchEndX: number = 0;
  minSwipeDistance: number = 50; // Minimum kaydırma mesafesi (piksel)
  isSwiping: boolean = false;

  constructor(
    private highlightService: HighlightService,
    private router: Router,
    public translationService: TranslationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Mobil cihaz kontrolü
    if (this.isBrowser) {
      this.isMobile = window.innerWidth <= 768;
      
      // Ekran boyutu değişikliklerini dinle
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
      });
    }
  }

  ngOnInit(): void {
    this.loadHighlights();
    
    // Örnek hikayeler
    this.stories = [
      {
        id: 1,
        username: 'Ahmet Yılmaz',
        userAvatar: 'assets/images/default-avatar.jpg',
        title: 'Yeni Teknoloji Trendleri',
        imageUrl: 'assets/images/default-post.jpg',
        createdAt: new Date()
      },
      {
        id: 2,
        username: 'Ayşe Demir',
        userAvatar: 'assets/images/default-avatar.jpg',
        title: 'Yapay Zeka ve Gelecek',
        imageUrl: 'assets/images/default-post.jpg',
        createdAt: new Date()
      }
    ];
    
    // Document visibility değişikliklerini izle (sadece tarayıcıda)
    if (this.isBrowser) {
      this.setupVisibilityListener();
    }
  }
  
  ngOnDestroy(): void {
    // Sadece tarayıcıda çalışan kodlar
    if (this.isBrowser) {
      // Zamanlayıcıyı temizle
      if (this.dialogTimer) {
        clearTimeout(this.dialogTimer);
      }
      
      // Event listener'ı temizle
      if (this.visibilityHandler) {
        document.removeEventListener('visibilitychange', this.visibilityHandler);
      }
    }
  }
  
  // Document visibility listener'ı kur
  setupVisibilityListener(): void {
    // Sadece tarayıcıda çalışır
    if (!this.isBrowser) return;
    
    this.visibilityHandler = () => {
      if (document.hidden) {
        // Sayfa görünür değilse timer'ı durdur
        this.isPageVisible = false;
        if (this.dialogTimer) {
          clearTimeout(this.dialogTimer);
        }
      } else {
        // Sayfa görünürse ve dialog açıksa timer'ı yeniden başlat
        this.isPageVisible = true;
        if (this.showDialog && this.selectedUser) {
          this.startDialogTimer();
        }
      }
    };
    
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  loadHighlights(): void {
    this.isLoading = true;
    this.error = '';

    // Tüm öne çıkan içerikleri getir
    this.highlightService.getHighlights().subscribe({
      next: (response: any[]) => {
        if (!response || response.length === 0) {
          this.highlights = [];
          this.userHighlights = [];
          this.isLoading = false;
          return;
        }
        
        this.highlights = response.map((item: any) => {
          const post = item.post || {};
          
          // Post resmi - Backend'den gelen postImageUrl'yi kullan, yoksa alternatif yöntemlere başvur
          let coverImageUrl = 'assets/images/default-post.jpg';
          
          // 1. Backend'den doğrudan gelen postImageUrl'yi kullan
          if (item.postImageUrl) {
            coverImageUrl = item.postImageUrl;
          }
          // 2. Post içinde images dizisi varsa
          else if (post.images && post.images.length > 0) {
            coverImageUrl = post.images[0];
          } 
          // 3. Post.imageUrl varsa
          else if (post.imageUrl) {
            coverImageUrl = post.imageUrl;
          }
          
          // URL'yi normalize et (eğer gerekiyorsa tam URL oluştur)
          if (coverImageUrl && !coverImageUrl.startsWith('http') && !coverImageUrl.startsWith('data:') && !coverImageUrl.startsWith('assets/')) {
            coverImageUrl = `${environment.apiUrl}${coverImageUrl.startsWith('/') ? '' : '/'}${coverImageUrl}`;
          }
          
          // Kullanıcı bilgilerini al
          const userEmail = item.userEmail || post.userEmail || '';
          const userName = item.userName || post.userName || userEmail?.split('@')[0] || 'Kullanıcı';
          let userProfileImage = item.userProfileImage || post.userProfileImage || 
                               `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;
          
          // Profil resmi URL'sini normalize et
          if (userProfileImage && !userProfileImage.startsWith('http') && !userProfileImage.startsWith('data:') && !userProfileImage.startsWith('assets/')) {
            userProfileImage = `${environment.apiUrl}${userProfileImage.startsWith('/') ? '' : '/'}${userProfileImage}`;
          }
          
          return {
            id: item.id,
            postId: item.postId,
            title: item.postTitle || post.title || 'Post',
            userEmail: userEmail,
            userName: userName,
            userProfileImage: userProfileImage,
            coverImage: coverImageUrl,
            seen: item.seen || false
          };
        });

        // Kullanıcıya göre grupla
        this.groupHighlightsByUser();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Öne çıkan içerikler yüklenirken hata oluştu:', err);
        this.error = this.translationService.getTranslation('highlights_load_error');
        this.isLoading = false;
      }
    });
  }

  // Post detaylarını al - resimleri içerir
  getPostDetails(postIds: number[], highlightData: any[]) {
    /* Bu metod artık kullanılmıyor - post.images yeterli */
  }

  // Post detaylarıyla birlikte highlight'ları işle
  processHighlightsWithPosts(highlights: any[], posts: any[]) {
    /* Bu metod artık kullanılmıyor - doğrudan API'den gelen post nesnesi kullanılıyor */
  }

  // Sadece highlight verileriyle işlem yap (post detayları yoksa)
  processHighlights(highlights: any[]) {
    /* Bu metod artık kullanılmıyor - doğrudan API'den gelen post nesnesi kullanılıyor */
  }

  // Öne çıkan içerikleri kullanıcılara göre grupla
  groupHighlightsByUser(): void {
    const userMap = new Map<string, UserHighlights>();
    
    this.highlights.forEach(highlight => {
      // Null, undefined veya geçersiz resim URL'leri için varsayılan resimler kullan
      if (!highlight.coverImage || highlight.coverImage.includes('null') || highlight.coverImage === 'undefined') {
        highlight.coverImage = 'assets/images/default-post.jpg';
      } 
      
      if (!highlight.userProfileImage || highlight.userProfileImage.includes('null') || highlight.userProfileImage === 'undefined') {
        highlight.userProfileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(highlight.userName || 'User')}`;
      }
      
      if (!userMap.has(highlight.userEmail)) {
        userMap.set(highlight.userEmail, {
          userEmail: highlight.userEmail,
          userName: highlight.userName,
          userProfileImage: highlight.userProfileImage,
          highlights: []
        });
      }
      
      userMap.get(highlight.userEmail)?.highlights.push(highlight);
    });
    
    this.userHighlights = Array.from(userMap.values());
  }

  // Kullanıcı avatarına tıklandığında
  showUserHighlights(user: UserHighlights): void {
    this.selectedUser = user;
    this.selectedHighlightIndex = 0;
    this.showDialog = true;
    
    // Otomatik geçiş için zamanlayıcı başlat (sayfa görünür ise ve tarayıcıda ise)
    if (this.isPageVisible && this.isBrowser) {
      this.startDialogTimer();
    }
  }

  // Dialog'da bir sonraki içeriğe git
  nextHighlight(): void {
    if (!this.selectedUser) return;
    
    this.resetDialogTimer();
    
    if (this.selectedHighlightIndex < this.selectedUser.highlights.length - 1) {
      // Aynı kullanıcının bir sonraki içeriğine git
      this.selectedHighlightIndex++;
    } else {
      // Son içerikten sonra bir sonraki kullanıcıya geç
      const nextUser = this.getNextUser();
      if (nextUser) {
        this.selectedUser = nextUser;
        this.selectedHighlightIndex = 0;
      } else {
        // Sonraki kullanıcı yoksa dialog'u kapat
        this.closeDialog();
      }
    }
  }

  // Dialog'da bir önceki içeriğe git
  prevHighlight(): void {
    if (!this.selectedUser || this.selectedHighlightIndex <= 0) return;
    
    this.resetDialogTimer();
    this.selectedHighlightIndex--;
  }

  // Dialog'u kapat
  closeDialog(): void {
    this.showDialog = false;
    this.selectedUser = null;
    this.selectedHighlightIndex = 0;
    
    if (this.dialogTimer) {
      clearTimeout(this.dialogTimer);
    }
  }

  // Görüntülenme zamanlayıcısını başlat
  startDialogTimer(): void {
    // Sadece tarayıcıda çalışır
    if (!this.isBrowser) return;
    
    // Sayfa görünür değilse timer başlatma
    if (!this.isPageVisible) return;
    
    // Timer'ı 5 saniye olarak ayarla (CSS'deki animasyon süresiyle aynı)
    const highlightDuration = 5000; // 5 saniye
    
    if (this.dialogTimer) {
      clearTimeout(this.dialogTimer);
    }
    
    this.dialogTimer = setTimeout(() => {
      // Süre dolduğunda sonraki highlight'a geç
      this.nextHighlight();
    }, highlightDuration);
  }

  // Zamanlayıcıyı sıfırla
  resetDialogTimer(): void {
    // Sadece tarayıcıda çalışır
    if (!this.isBrowser) return;
    
    // Sayfa görünür değilse timer başlatma
    if (!this.isPageVisible) return;
    
    // Timer'ı sıfırla ve yeniden başlat
    if (this.dialogTimer) {
      clearTimeout(this.dialogTimer);
    }
    
    // Yeni timer'ı 5 saniye olarak ayarla
    this.dialogTimer = setTimeout(() => {
      this.nextHighlight();
    }, 5000);
  }

  // İçeriğe gitmek için tıklandığında
  viewHighlight(highlight: StoryHighlight): void {
    this.closeDialog();
    
    // İlgili post detay sayfasına yönlendir
    this.router.navigate(['/post', highlight.postId]);
    
    // Arka planda görüntülenme durumunu güncelle
    if (!highlight.seen) {
      this.highlightService.markAsSeen(highlight.id).subscribe({
        next: () => {
          highlight.seen = true;
        },
        error: (err) => {
          console.error('Öne çıkarılan içerik görüntülenme durumu güncellenirken hata oluştu:', err);
        }
      });
    }
  }

  // Gösterilen kullanıcı için tüm içeriklerin görüntülenme durumunu kontrol et
  hasUnseenHighlights(user: UserHighlights): boolean {
    return user.highlights.some(highlight => !highlight.seen);
  }
  
  // Tüm içeriklerin görüntülenmiş olup olmadığını kontrol et
  areAllHighlightsSeen(user: UserHighlights): boolean {
    return user.highlights.every(highlight => highlight.seen);
  }

  // Görsel hata yönetimi için iyileştirilmiş metod
  handlePostImageError(index: number): void {
    if (this.selectedUser && this.selectedUser.highlights[index]) {
      this.selectedUser.highlights[index].coverImage = 'assets/images/default-post.jpg';
    }
  }

  loadStories() {
    this.highlightService.getHighlights().subscribe(
      (stories) => {
        this.stories = stories;
      },
      (error) => {
        console.error('Hikayeler yüklenirken hata oluştu:', error);
      }
    );
  }

  openStory(user: UserHighlights) {
    this.selectedUser = user;
    this.selectedHighlightIndex = 0;
    this.showDialog = true;
    
    // Otomatik geçiş için zamanlayıcı başlat (sayfa görünür ise ve tarayıcıda ise)
    if (this.isPageVisible && this.isBrowser) {
      this.startDialogTimer();
    }
    
    // Dokunma olaylarını ayarla - setTimeout ile bir sonraki render döngüsünde çalıştır
    setTimeout(() => {
      this.setupTouchEvents();
    }, 100);
  }

  navigateStory(direction: 'prev' | 'next') {
    if (direction === 'prev' && this.currentIndex > 0) {
      this.currentIndex--;
    } else if (direction === 'next' && this.currentIndex < this.stories.length - 1) {
      this.currentIndex++;
    }
    this.selectedStory = this.stories[this.currentIndex];
  }

  viewStory(story: Story) {
    // Hikayeyi görüntüleme işlemi
    console.log('Hikaye görüntüleniyor:', story);
  }

  // Kullanıcılar arası navigasyon için yardımcı fonksiyonlar
  getCurrentUserIndex(): number {
    if (!this.selectedUser) return -1;
    return this.userHighlights.findIndex(user => user.userEmail === this.selectedUser?.userEmail);
  }

  getPreviousUser(): UserHighlights | null {
    const currentIndex = this.getCurrentUserIndex();
    if (currentIndex <= 0) return null;
    return this.userHighlights[currentIndex - 1];
  }

  getNextUser(): UserHighlights | null {
    const currentIndex = this.getCurrentUserIndex();
    if (currentIndex === -1 || currentIndex >= this.userHighlights.length - 1) return null;
    return this.userHighlights[currentIndex + 1];
  }

  navigateToUser(direction: 'prev' | 'next'): void {
    const currentIndex = this.getCurrentUserIndex();
    if (currentIndex === -1) return;
    
    let targetIndex: number;
    if (direction === 'prev' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < this.userHighlights.length - 1) {
      targetIndex = currentIndex + 1;
    } else {
      return;
    }
    
    // Kullanıcı değişikliği yapılıyor
    console.log(`Kullanıcı değişikliği: ${currentIndex} -> ${targetIndex}`);
    
    // Önceki zamanlayıcıyı temizle
    if (this.dialogTimer) {
      clearTimeout(this.dialogTimer);
    }
    
    // Kullanıcıyı değiştir
    this.selectedUser = this.userHighlights[targetIndex];
    this.selectedHighlightIndex = 0;
    
    // Otomatik geçiş için zamanlayıcıyı sıfırla
    this.resetDialogTimer();
  }

  // Dokunma olaylarını ayarla
  setupTouchEvents(): void {
    if (!this.isBrowser) return;
    
    const dialogContent = document.querySelector('.dialog-content');
    if (!dialogContent) {
      console.log('Dialog içeriği bulunamadı');
      return;
    }
    
    console.log('Dokunma olayları ayarlanıyor');
    
    // Önceki event listener'ları temizle
    dialogContent.removeEventListener('touchstart', this.handleTouchStart);
    dialogContent.removeEventListener('touchend', this.handleTouchEnd);
    
    // Yeni event listener'ları ekle
    dialogContent.addEventListener('touchstart', this.handleTouchStart);
    dialogContent.addEventListener('touchend', this.handleTouchEnd);
  }
  
  // Touch start olayını işle
  handleTouchStart = (e: Event): void => {
    const touchEvent = e as TouchEvent;
    this.touchStartX = touchEvent.touches[0].clientX;
    console.log('Touch start:', this.touchStartX);
  }
  
  // Touch end olayını işle
  handleTouchEnd = (e: Event): void => {
    const touchEvent = e as TouchEvent;
    this.touchEndX = touchEvent.changedTouches[0].clientX;
    console.log('Touch end:', this.touchEndX);
    this.handleSwipe();
  }
  
  // Kaydırma işlemini yönet
  handleSwipe(): void {
    const swipeDistance = this.touchEndX - this.touchStartX;
    console.log('Swipe distance:', swipeDistance);
    
    if (Math.abs(swipeDistance) < this.minSwipeDistance) {
      console.log('Minimum kaydırma mesafesinden az');
      return; // Minimum kaydırma mesafesinden az ise işlem yapma
    }
    
    // Kaydırma işlemi sırasında yeni kaydırmaları engelle
    if (this.isSwiping) {
      console.log('Zaten kaydırma işlemi devam ediyor');
      return;
    }
    
    this.isSwiping = true;
    
    if (swipeDistance > 0) {
      // Sağa kaydırma - önceki kullanıcıya git
      console.log('Sağa kaydırma - önceki kullanıcıya git');
      this.navigateToUser('prev');
    } else {
      // Sola kaydırma - sonraki kullanıcıya git
      console.log('Sola kaydırma - sonraki kullanıcıya git');
      this.navigateToUser('next');
    }
    
    // Kaydırma işlemi tamamlandıktan sonra kısa bir süre bekleyip isSwiping'i false yap
    setTimeout(() => {
      this.isSwiping = false;
    }, 500); // 500ms bekle
  }
} 