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
  styles: [`
    .verify-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      background-color: #FEFAE0;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(212, 163, 115, 0.1) 0%, transparent 20%),
        radial-gradient(circle at 90% 80%, rgba(204, 213, 174, 0.1) 0%, transparent 20%);
      padding: 2rem;
      position: relative;
    }

    .verify-box {
      background: rgba(233, 237, 201, 0.9);
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 
        0 10px 40px rgba(212, 163, 115, 0.2),
        0 0 0 1px rgba(212, 163, 115, 0.1);
      width: 100%;
      max-width: 450px;
      position: relative;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transform: translateY(0);
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .verify-box::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, rgba(212, 163, 115, 0.3), rgba(204, 213, 174, 0.3), rgba(233, 237, 201, 0.3));
      border-radius: 26px;
      z-index: -1;
      opacity: 0.6;
      filter: blur(8px);
    }

    .verify-box:hover {
      transform: translateY(-5px);
      box-shadow: 
        0 15px 50px rgba(212, 163, 115, 0.3),
        0 0 0 1px rgba(212, 163, 115, 0.2);
    }

    h2 {
      color: #2C3E50;
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(45deg, #2C3E50, #D4A373);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      position: relative;
      padding-bottom: 1rem;
    }

    h2::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 3px;
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      border-radius: 3px;
    }

    .subtitle {
      color: #2C3E50;
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
      color: #2C3E50;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .form-control {
      width: 100%;
      padding: 0.9rem;
      border: 2px solid #D4A373;
      border-radius: 12px;
      font-size: 1rem;
      background: #FEFAE0;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(212, 163, 115, 0.1);
    }

    .form-control:focus {
      outline: none;
      border-color: #CCD5AE;
      box-shadow: 0 4px 12px rgba(212, 163, 115, 0.2);
      transform: translateY(-1px);
    }

    .is-invalid {
      border-color: #D4A373;
      background: #FFF5F5;
    }

    .invalid-feedback {
      color: #2C3E50;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding-left: 0.5rem;
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
    }

    .btn-primary {
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      color: #2C3E50;
      box-shadow: 0 4px 15px rgba(212, 163, 115, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(212, 163, 115, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .resend-code {
      text-align: center;
      margin-top: 1rem;
    }

    .btn-link {
      background: none;
      border: none;
      color: #D4A373;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .btn-link:hover:not(:disabled) {
      color: #CCD5AE;
      text-decoration: underline;
    }

    .btn-link:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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

    .alert-danger {
      background: #FEFAE0;
      color: #2C3E50;
      border: 2px solid #D4A373;
      box-shadow: 0 4px 12px rgba(212, 163, 115, 0.1);
    }

    .alert-success {
      background: #E9EDC9;
      color: #2C3E50;
      border: 2px solid #CCD5AE;
      box-shadow: 0 4px 12px rgba(204, 213, 174, 0.2);
    }

    .mt-3 {
      margin-top: 2rem;
      text-align: center;
      color: #2C3E50;
      font-size: 0.95rem;
    }

    a {
      color: #D4A373;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      position: relative;
    }

    a::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(45deg, #D4A373, #CCD5AE);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    a:hover {
      color: #CCD5AE;
    }

    a:hover::after {
      transform: scaleX(1);
    }

    .home-icon {
      position: fixed;
      top: 20px;
      left: 20px;
      font-size: 24px;
      color: #D4A373;
      background: rgba(233, 237, 201, 0.9);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(212, 163, 115, 0.2);
      transition: all 0.3s ease;
      z-index: 100;
    }
    
    .home-icon:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(212, 163, 115, 0.3);
      color: #CCD5AE;
    }

    @media (max-width: 768px) {
      .verify-container {
        padding: 1rem;
        min-height: calc(100vh - 56px);
      }

      .verify-box {
        padding: 2rem;
        background: rgba(233, 237, 201, 0.95);
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

      this.authService.verifyEmail(this.verifyForm.value).subscribe({
        next: (response) => {
          console.log('Doğrulama başarılı:', response);
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
          this.error = err.error?.message || 'Doğrulama sırasında bir hata oluştu.';
          this.success = '';
          this.isLoading = false;
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
        this.success = 'Doğrulama kodu tekrar gönderildi. Lütfen e-posta kutunuzu kontrol ediniz.';
        this.error = '';
        this.isResending = false;
      },
      error: (err) => {
        console.error('Kod gönderme hatası:', err);
        this.error = err.error?.message || 'Doğrulama kodu gönderilirken bir hata oluştu.';
        this.success = '';
        this.isResending = false;
      }
    });
  }
} 