import { Component, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'blog-frontend';
  
  constructor(
    private router: Router,
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Tema servisini başlat - bu, önceden seçilen temayı yükleyecek
      // Bu işlem themeService'in constructor'ında otomatik yapılacak
      
      // Sayfa değişikliklerinde sayfayı en üste kaydır
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          window.scrollTo(0, 0);
        }
      });
    }
  }
}
