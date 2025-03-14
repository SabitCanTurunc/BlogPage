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
      <div class="verify-box">
        <h2>E-posta Doğrulama</h2>
        <p>E-posta adresinize gönderilen doğrulama kodunu giriniz.</p>
        
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
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .verify-box {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 1rem;
    }

    p {
      text-align: center;
      color: #666;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .btn {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .alert {
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.875em;
      color: #dc3545;
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  verifyForm: FormGroup;
  error: string = '';
  success: string = '';
  isLoading: boolean = false;

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
            this.success = response.message;
            this.error = '';
            this.isLoading = false;
            
            // 2 saniye sonra giriş sayfasına yönlendir
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.error = response.message;
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
} 