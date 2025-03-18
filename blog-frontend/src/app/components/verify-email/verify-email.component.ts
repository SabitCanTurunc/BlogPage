import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="verify-container">
      <a routerLink="/" class="home-icon">
        <i class="fas fa-home"></i>
      </a>
      <div class="verify-box">
        <h2>E-posta Doğrulama</h2>
        <p class="subtitle">Hesabınızı aktifleştirmek için e-posta adresinize gönderilen doğrulama kodunu giriniz.</p>
        
        <form [formGroup]="verifyForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">E-posta</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control" 
              [class.is-invalid]="verifyForm.get('email')?.invalid && verifyForm.get('email')?.touched"
              placeholder="E-posta adresinizi giriniz">
            <div class="invalid-feedback" *ngIf="verifyForm.get('email')?.errors?.['required'] && verifyForm.get('email')?.touched">
              E-posta adresi zorunludur.
            </div>
            <div class="invalid-feedback" *ngIf="verifyForm.get('email')?.errors?.['email'] && verifyForm.get('email')?.touched">
              Geçerli bir e-posta adresi giriniz.
            </div>
            <div class="invalid-feedback" *ngIf="verifyForm.get('email')?.errors?.['pattern'] && verifyForm.get('email')?.touched">
              Geçerli bir e-posta adresi giriniz.
            </div>
          </div>

          <div class="form-group">
            <label for="verificationCode">Doğrulama Kodu</label>
            <input 
              type="text" 
              id="verificationCode" 
              formControlName="verificationCode" 
              class="form-control" 
              [class.is-invalid]="verifyForm.get('verificationCode')?.invalid && verifyForm.get('verificationCode')?.touched"
              placeholder="Doğrulama kodunu giriniz">
            <div class="invalid-feedback" *ngIf="verifyForm.get('verificationCode')?.errors?.['required'] && verifyForm.get('verificationCode')?.touched">
              Doğrulama kodu zorunludur.
            </div>
            <div class="invalid-feedback" *ngIf="verifyForm.get('verificationCode')?.errors?.['minlength'] && verifyForm.get('verificationCode')?.touched">
              Doğrulama kodu en az 6 karakter olmalıdır.
            </div>
            <div class="invalid-feedback" *ngIf="verifyForm.get('verificationCode')?.errors?.['maxlength'] && verifyForm.get('verificationCode')?.touched">
              Doğrulama kodu en fazla 6 karakter olmalıdır.
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary" 
            [disabled]="!verifyForm.valid || isLoading">
            {{ isLoading ? 'Doğrulanıyor...' : 'Doğrula' }}
          </button>
          
          <div class="resend-code">
            <button type="button" class="btn-link" (click)="resendCode()" [disabled]="isResending">
              {{ isResending ? 'Kod gönderiliyor...' : 'Doğrulama kodunu tekrar gönder' }}
            </button>
          </div>
        </form>

        <div *ngIf="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>

        <div *ngIf="success" class="alert alert-success mt-3">
          {{ success }}
        </div>

        <div class="mt-3">
          <a routerLink="/login">Giriş sayfasına dön</a>
        </div>
      </div>
    </div>
  `,
  // ... existing code ...
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap');
    
    .verify-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, rgba(10, 10, 26, 0.95), rgba(20, 20, 40, 0.9));
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(80, 0, 255, 0.1) 0%, transparent 20%),
        radial-gradient(circle at 90% 80%, rgba(255, 0, 230, 0.1) 0%, transparent 20%);
      padding: 2rem;
      position: relative;
      font-family: 'Poppins', sans-serif;
    }

    .verify-box {
      background: rgba(15, 15, 30, 0.8);
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 
        0 0 30px rgba(80, 0, 255, 0.3),
        0 0 0 1px rgba(255, 0, 230, 0.3);
      width: 100%;
      max-width: 450px;
      position: relative;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transform: translateY(0);
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 0, 230, 0.3);
    }

    .verify-box::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, rgba(80, 0, 255, 0.3), rgba(255, 0, 230, 0.3));
      border-radius: 26px;
      z-index: -1;
      opacity: 0.6;
      filter: blur(8px);
    }

    .verify-box:hover {
      transform: translateY(-5px);
      box-shadow: 
        0 0 40px rgba(80, 0, 255, 0.4),
        0 0 0 1px rgba(255, 0, 230, 0.4);
    }

    h2 {
      color: #ffffff;
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(45deg, #5000ff, #ff00e6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      position: relative;
      padding-bottom: 1rem;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }

    h2::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 3px;
      background: linear-gradient(45deg, #5000ff, #ff00e6);
      border-radius: 3px;
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }

    .subtitle {
      color: #ffffff;
      text-align: center;
      font-size: 1.1rem;
      margin-bottom: 2.5rem;
      opacity: 0.8;
      line-height: 1.6;
    }

    .form-group {
      margin-bottom: 1.8rem;
      position: relative;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #ffffff;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .form-control {
      width: 100%;
      padding: 0.9rem;
      border: 1px solid rgba(255, 0, 230, 0.3);
      border-radius: 12px;
      font-size: 1rem;
      background: rgba(40, 40, 80, 0.5);
      color: #ffffff;
      transition: all 0.3s ease;
      box-shadow: 0 0 10px rgba(80, 0, 255, 0.2);
    }

    .form-control:focus {
      outline: none;
      border-color: #ff00e6;
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
      transform: translateY(-1px);
    }

    .is-invalid {
      border-color: #ff00e6;
      background: rgba(255, 0, 100, 0.1);
      box-shadow: 0 0 15px rgba(255, 0, 100, 0.3);
    }

    .invalid-feedback {
      color: #ff00e6;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding-left: 0.5rem;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
    }

    .btn {
      width: 100%;
      padding: 1.1rem;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 1rem;
      position: relative;
      overflow: hidden;
      z-index: 1;
    }
    
    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #5000ff, #ff00e6);
      opacity: 0;
      z-index: -1;
      transition: opacity 0.3s;
    }
    
    .btn:hover:not(:disabled)::before {
      opacity: 1;
    }

    .btn-primary {
      background: rgba(80, 0, 255, 0.2);
      color: #ffffff;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
      transform: translateY(-3px);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-link {
      background: transparent;
      border: none;
      color: #ff00e6;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
      margin-top: 1rem;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.5);
    }

    .btn-link:hover:not(:disabled) {
      color: #ffffff;
      text-shadow: 0 0 8px rgba(255, 0, 230, 0.8);
    }

    .btn-link:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .resend-code {
      text-align: center;
      margin-top: 0.5rem;
    }

    .alert {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .alert-success {
      background: rgba(40, 40, 80, 0.5);
      color: #00ffaa;
      border: 1px solid rgba(0, 255, 170, 0.3);
      box-shadow: 0 0 10px rgba(0, 255, 170, 0.3);
    }

    .alert-danger {
      background: rgba(40, 40, 80, 0.5);
      color: #ff00e6;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
    }

    .mt-3 {
      margin-top: 2rem;
      text-align: center;
      color: #ffffff;
      font-size: 0.95rem;
    }

    a {
      color: #ff00e6;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      position: relative;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
    }

    a::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(45deg, #5000ff, #ff00e6);
      transform: scaleX(0);
      transition: transform 0.3s ease;
      box-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
    }

    a:hover {
      color: #ffffff;
    }

    a:hover::after {
      transform: scaleX(1);
    }

    .home-icon {
      position: fixed;
      top: 20px;
      left: 20px;
      font-size: 24px;
      color: #ffffff;
      background: rgba(15, 15, 30, 0.8);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.3);
      border: 1px solid rgba(255, 0, 230, 0.3);
      transition: all 0.3s ease;
      z-index: 100;
    }
    
    .home-icon:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 20px rgba(255, 0, 230, 0.5);
      color: #ff00e6;
    }

    @media (max-width: 768px) {
      .verify-container {
        padding: 1rem;
        min-height: calc(100vh - 56px);
      }

      .verify-box {
        padding: 2rem;
        background: rgba(15, 15, 30, 0.9);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
      }

      .verify-box::before {
        filter: blur(4px);
        opacity: 0.4;
      }

      h2 {
        font-size: 2rem;
      }

      .form-control {
        padding: 0.8rem;
      }

      .btn {
        padding: 0.9rem;
      }

      .home-icon {
        top: 15px;
        left: 15px;
        width: 45px;
        height: 45px;
        font-size: 22px;
      }
    }
  `]
// ... existing code ...
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
              this.error = 'Bu hesap zaten doğrulanmış. Lütfen giriş yapın.';
              console.log('Hata tespit edildi: Hesap zaten doğrulanmış');
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