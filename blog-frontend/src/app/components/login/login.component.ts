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
            <div class="password-input">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password" 
                formControlName="password" 
                class="form-control"
                [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                placeholder="Şifrenizi giriniz">
              <button type="button" class="toggle-password" (click)="togglePasswordVisibility()">
                <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" *ngIf="loginForm.get('password')?.errors?.['required'] && loginForm.get('password')?.touched">
              Şifre zorunludur
            </div>
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="!isLoading">Giriş Yap</span>
            <span *ngIf="isLoading">
              <i class="fas fa-spinner fa-spin"></i> Giriş Yapılıyor...
            </span>
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
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap');
    
    .login-container {
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

    .login-box {
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

    .login-box::before {
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

    .login-box:hover {
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
      .login-container {
        padding: 1rem;
        min-height: calc(100vh - 56px);
      }

      .login-box {
        padding: 2rem;
        background: rgba(15, 15, 30, 0.9);
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

    .password-input {
      position: relative;
      width: 100%;
    }

    .toggle-password {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #ffffff;
      cursor: pointer;
      padding: 5px;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }

    .toggle-password:hover {
      opacity: 1;
    }

    .toggle-password i {
      font-size: 1.1rem;
    }

    .form-control {
      padding-right: 40px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

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
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.token) {
            this.router.navigate(['/home']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.message;
          this.loginForm.get('password')?.reset();
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}