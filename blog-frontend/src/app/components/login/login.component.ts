import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <a routerLink="/" class="home-icon">
        <i class="fas fa-home"></i>
      </a>
      <div class="login-box">
        <h2>Giriş Yap</h2>
        <p class="subtitle">Blog platformuna hoş geldiniz</p>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">E-posta</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control"
              [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              placeholder="E-posta adresinizi giriniz">
            <div class="invalid-feedback" *ngIf="loginForm.get('email')?.errors?.['required'] && loginForm.get('email')?.touched">
              E-posta adresi zorunludur
            </div>
            <div class="invalid-feedback" *ngIf="loginForm.get('email')?.errors?.['email'] && loginForm.get('email')?.touched">
              Geçerli bir e-posta adresi giriniz
            </div>
          </div>

          <div class="form-group">
            <label for="password">Şifre</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              class="form-control"
              [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              placeholder="Şifrenizi giriniz">
            <div class="invalid-feedback" *ngIf="loginForm.get('password')?.errors?.['required'] && loginForm.get('password')?.touched">
              Şifre zorunludur
            </div>
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="!isLoading">Giriş Yap</span>
            <span *ngIf="isLoading">Giriş Yapılıyor...</span>
          </button>
        </form>

        <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

        <div class="mt-3">
          Hesabınız yok mu? <a routerLink="/signup">Kayıt Ol</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
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

    .login-box {
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

    .login-box::before {
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

    .login-box:hover {
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
      .login-container {
        padding: 1rem;
        min-height: calc(100vh - 56px);
      }

      .login-box {
        padding: 2rem;
        background: rgba(233, 237, 201, 0.95);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
      }

      .login-box::before {
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
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      
      const { email, password } = this.loginForm.value;
      console.log('Form verileri:', { email, password });
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Login başarılı:', response);
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Login hatası:', err);
          console.error('Hata detayları:', {
            status: err.status,
            statusText: err.statusText,
            error: err.error,
            message: err.message,
            headers: err.headers
          });
          
          this.isLoading = false;
          
          if (err.error && err.error.customException && err.error.customException.message === 'UNVERIFIED_USER') {
            this.error = 'Hesabınız henüz doğrulanmamış. Doğrulama sayfasına yönlendiriliyorsunuz...';
            setTimeout(() => {
              this.router.navigate(['/verify-email'], { 
                queryParams: { email: email }
              });
            }, 2000);
          } else if (err.error && err.error.customException && err.error.customException.message) {
            this.error = err.error.customException.message;
          } else if (err.status === 401) {
            this.error = 'E-posta veya şifre hatalı';
          } else if (err.status === 0) {
            this.error = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
          } else {
            this.error = 'Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
          }
        }
      });
    }
  }
} 