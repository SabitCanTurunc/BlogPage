import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerUtil } from '../../utils/error-handler.util';

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
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.verifyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    // URL'den e-posta adresini al (ActivatedRoute kullanarak)
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      if (email) {
        this.verifyForm.patchValue({ email });
      }
    });
  }

  onSubmit() {
    if (this.verifyForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.success = '';
      
      const email = this.verifyForm.get('email')?.value;
      const verificationCode = this.verifyForm.get('verificationCode')?.value;
      
      this.authService.verifyEmail({ email, verificationCode }).subscribe({
        next: (response) => {
          this.success = response.message || 'Hesabınız başarıyla doğrulandı. Giriş sayfasına yönlendiriliyorsunuz...';
          this.error = '';
          this.isLoading = false;
          
          // 2 saniye sonra giriş sayfasına yönlendir
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
          
          // Hata mesajını ErrorHandlerUtil kullanarak elde et
          this.error = ErrorHandlerUtil.handleError(err, 'Doğrulama sırasında bir hata oluştu');
          
          // Özel durumlar için ek kontroller
          if (err.error?.message && err.error.message.includes('zaten doğrulanmış')) {
            this.success = 'Bu hesap zaten doğrulanmış. Giriş sayfasına yönlendiriliyorsunuz...';
            this.error = '';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          }
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
        this.success = response.message || 'Doğrulama kodu tekrar gönderildi. Lütfen e-posta kutunuzu kontrol ediniz.';
        this.error = '';
        this.isResending = false;
      },
      error: (err) => {
        // Hata mesajını ErrorHandlerUtil kullanarak elde et
        this.error = ErrorHandlerUtil.handleError(err, 'Doğrulama kodu gönderilirken bir hata oluştu');
        
        // Özel durumlar için ek kontroller
        if (err.error?.message && err.error.message.includes('already verified')) {
          this.error = 'Bu hesap zaten doğrulanmış. Giriş yapabilirsiniz.';
        }
        
        this.success = '';
        this.isResending = false;
      }
    });
  }
} 