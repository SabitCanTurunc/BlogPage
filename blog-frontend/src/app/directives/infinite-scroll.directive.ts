import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[infiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective {
  @Output() scrolled = new EventEmitter<void>();
  @Input() scrollThreshold = 200;
  @Input() scrollDebounce = 200;
  
  private debounceTimer?: number;
  private isLoading = false;

  constructor(private el: ElementRef) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Zamanlayıcıyı temizle
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Yükleme sırasında çıkış
    if (this.isLoading) {
      return;
    }
    
    // Debounce işlemi
    this.debounceTimer = window.setTimeout(() => {
      this.checkForScroll();
    }, this.scrollDebounce);
  }
  
  private checkForScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.body.offsetHeight;
    const threshold = documentHeight - this.scrollThreshold;
    
    if (scrollPosition >= threshold) {
      this.isLoading = true;
      
      console.log('Directive: Infinite scroll tetiklendi. Yükleme başlıyor...');
      this.scrolled.emit();
      
      // Yükleme işaretçisini sıfırla (1 saniye sonra)
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }
} 