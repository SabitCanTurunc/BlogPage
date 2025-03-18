import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  verifyForm: FormGroup;
  error: string = '';
  success: string = '';
  isLoading: boolean = false;
  isResending: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.verifyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    // URL'den e-posta adresini al
    const email = this.router.parseUrl(this.router.url).queryParams['email'];
    if (email) {
      this.verifyForm.patchValue({ email });
    }
  }

  onSubmit() {
    if (this.verifyForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.success = '';
      
      const email = this.verifyForm.get('email')?.value;
      const verificationCode = this.verifyForm.get('verificationCode')?.value;
      console.log(`Doğrulama denemesi: Email=${email}, Kod=${verificationCode}`);
      
      this.authService.verifyEmail({ email, verificationCode }).subscribe({
        next: (response) => {
          console.log('Doğrulama yanıtı (başarılı):', response);
          
          if (response.success) {
            this.success = response.message || 'Hesabınız başarıyla doğrulandı. Giriş sayfasına yönlendiriliyorsunuz...';
            this.error = '';
            this.isLoading = false;
            
            // 2 saniye sonra giriş sayfasına yönlendir
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.error = response.message || 'Doğrulama başarısız oldu.';
            this.success = '';
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Doğrulama hatası:', err);
          console.error('HTTP Durum Kodu:', err.status);
          console.error('Hata Detayları:', err?.error); 
          
          this.isLoading = false;
          
          // Sunucudan gelen hata mesajını göster
          if (err.error && err.error.message) {
            // Belirli hata türlerini özel olarak işle
            if (err.error.message.includes('Yanlış doğrulama kodu')) {
              this.error = 'Yanlış doğrulama kodu. Lütfen tekrar deneyin.';
              console.log('Hata tespit edildi: Yanlış doğrulama kodu');
            } else if (err.error.message.includes('süresi dolmuş')) {
              this.error = 'Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod talep edin.';
              console.log('Hata tespit edildi: Kod süresi dolmuş');
            } else if (err.error.message.includes('zaten doğrulanmış')) {
              this.success = 'Bu hesap zaten doğrulanmış. Giriş sayfasına yönlendiriliyorsunuz...';
              this.error = '';
              console.log('Hata tespit edildi: Hesap zaten doğrulanmış');
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 2000);
            } else {
              this.error = err.error.message;
              console.log('Sunucudan gelen hata mesajı:', this.error);
            }
          } else if (err.status === 0) {
            this.error = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
          } else if (err.status === 400) {
            this.error = 'Doğrulama kodunu hatalı girdiniz veya kodun süresi dolmuş olabilir.';
          } else if (err.status === 404) {
            this.error = 'E-posta adresi bulunamadı. Lütfen kayıtlı e-posta adresinizi girin.';
          } else {
            this.error = 'Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.';
          }
          
          this.success = '';
        }
      });
    } else {
      // Form geçerli değilse tüm alanları işaretle
      Object.keys(this.verifyForm.controls).forEach(key => {
        const control = this.verifyForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  resendCode() {
    const email = this.verifyForm.get('email')?.value;
    if (!email) {
      this.error = 'Lütfen e-posta adresinizi giriniz.';
      return;
    }

    this.isResending = true;
    this.error = '';
    this.success = '';

    this.authService.resendVerificationCode(email).subscribe({
      next: (response) => {
        console.log('Kod tekrar gönderildi:', response);
        this.success = response.message || 'Doğrulama kodu tekrar gönderildi. Lütfen e-posta kutunuzu kontrol ediniz.';
        this.error = '';
        this.isResending = false;
      },
      error: (err) => {
        console.error('Kod gönderme hatası:', err);
        let errorMessage: string;
        
        // Kod gönderme hatasının türüne göre daha açıklayıcı mesajlar
        if (err.error?.message) {
          // Sunucudan gelen hata mesajı
          errorMessage = err.error.message;
        } else if (err.status === 0) {
          // Ağ hatası
          errorMessage = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
        } else if (err.status === 400) {
          if (err.error?.message && err.error.message.includes('already verified')) {
            // Zaten doğrulanmış hesap
            errorMessage = 'Bu hesap zaten doğrulanmış. Giriş yapabilirsiniz.';
          } else {
            // Diğer 400 hataları
            errorMessage = 'Kod gönderilirken bir hata oluştu. Geçerli bir e-posta adresi girdiğinizden emin olun.';
          }
        } else if (err.status === 404) {
          // Kullanıcı bulunamadı
          errorMessage = 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.';
        } else {
          // Genel hata
          errorMessage = 'Doğrulama kodu gönderilirken bir hata oluştu.';
        }
        
        this.error = errorMessage;
        this.success = '';
        this.isResending = false;
      }
    });
  }
} 