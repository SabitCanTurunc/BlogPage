import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailValidationService {
  private disposableDomains = [
    'tempmail.com', 'temp-mail.org', 'guerrillamail.com',
    'mailinator.com', '10minutemail.com', 'yopmail.com',
    'fakeinbox.com', 'sharklasers.com', 'trashmail.com',
    'getairmail.com', 'getnada.com', 'tempr.email',
    'dispostable.com', 'maildrop.cc', 'throwawaymail.com'
  ];

  async validateEmail(email: string): Promise<boolean> {
    try {
      // Basit e-posta formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return false;
      }

      // Geçici e-posta domain kontrolü
      const domain = email.split('@')[1].toLowerCase();
      if (this.disposableDomains.includes(domain)) {
        return false;
      }

      // Ücretsiz e-posta sağlayıcıları kontrolü (isteğe bağlı)
      const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      if (!freeEmailProviders.includes(domain)) {
        // Domain MX kaydı kontrolü yapılabilir
        // Şimdilik sadece geçerli kabul ediyoruz
        return true;
      }

      return true;
    } catch (error) {
      console.error('E-posta doğrulama hatası:', error);
      return false;
    }
  }
} 