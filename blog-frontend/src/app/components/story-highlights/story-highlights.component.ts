import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-story-highlights',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './story-highlights.component.html',
  styleUrls: ['./story-highlights.component.css']
})
export class StoryHighlightsComponent implements OnInit {
  highlights: StoryHighlight[] = [];
  userHighlights: UserHighlights[] = [];
  isLoading: boolean = true;
  error: string = '';
  
  // Dialog özellikleri
  showDialog: boolean = false;
  selectedUser: UserHighlights | null = null;
  selectedHighlightIndex: number = 0;
  dialogTimer: any = null;

  constructor(
    private highlightService: HighlightService,
    private router: Router,
    public translationService: TranslationService
  ) { }

  ngOnInit(): void {
    this.loadHighlights();
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
    
    // Otomatik geçiş için zamanlayıcı başlat
    this.startDialogTimer();
  }

  // Dialog'da bir sonraki içeriğe git
  nextHighlight(): void {
    if (!this.selectedUser) return;
    
    this.resetDialogTimer();
    
    if (this.selectedHighlightIndex < this.selectedUser.highlights.length - 1) {
      this.selectedHighlightIndex++;
    } else {
      // Son içerikten sonra dialog'u kapat
      this.closeDialog();
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
      this.dialogTimer = null;
    }
  }

  // Görüntülenme zamanlayıcısını başlat
  startDialogTimer(): void {
    this.resetDialogTimer();
    this.dialogTimer = setTimeout(() => {
      this.nextHighlight();
    }, 5000); // 5 saniye sonra otomatik geçiş
  }

  // Zamanlayıcıyı sıfırla
  resetDialogTimer(): void {
    if (this.dialogTimer) {
      clearTimeout(this.dialogTimer);
      this.dialogTimer = setTimeout(() => {
        this.nextHighlight();
      }, 5000);
    }
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
} 