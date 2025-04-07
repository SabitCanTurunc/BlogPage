import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerUtil } from '../../utils/error-handler.util';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  emailForm: FormGroup;
  resetForm: FormGroup;
  error: string = '';
  success: string = '';
  isLoading: boolean = false;
  isResending: boolean = false;
  currentStep: number = 1;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]]
    });

    const digitsOnlyPattern = '^[0-9]{6}$';

    this.resetForm = this.fb.group({
      verificationCode: ['', [
        Validators.required, 
        Validators.minLength(6), 
        Validators.maxLength(6),
        Validators.pattern(digitsOnlyPattern)
      ]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // URL'den e-posta adresini al
    const email = this.router.parseUrl(this.router.url).queryParams['email'];
    if (email) {
      this.emailForm.patchValue({ email });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'passwordMismatch': true };
  }

  sendResetCode() {
    if (this.emailForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.success = '';
      this.email = this.emailForm.get('email')?.value;

      this.authService.forgotPassword(this.email).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = response.message || 'Doğrulama kodu e-posta adresinize gönderildi.';
            this.error = '';
            this.currentStep = 2;
            
            // FormControl'ü sıfırla ve temizle - tarayıcı otodoldurma sorunlarını önle
            this.resetForm.patchValue({
              verificationCode: '',
              newPassword: '',
              confirmPassword: ''
            });
            this.resetForm.markAsPristine();
            this.resetForm.markAsUntouched();
          } else {
            this.error = response.message || 'İşlem başarısız oldu.';
            this.success = '';
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = ErrorHandlerUtil.handleError(err, 'Doğrulama kodu gönderilirken bir hata oluştu');
          this.success = '';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.emailForm);
    }
  }

  resetPassword() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.success = '';

      const verificationCode = this.resetForm.get('verificationCode')?.value?.trim();
      const newPassword = this.resetForm.get('newPassword')?.value;
      
      if (!verificationCode) {
        this.error = 'Lütfen geçerli bir doğrulama kodu giriniz.';
        this.isLoading = false;
        return;
      }

      // String olarak doğrulama kodunu gönderdiğimizden emin olalım
      const codeAsString = String(verificationCode);
      
      this.authService.resetPassword(this.email, codeAsString, newPassword).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = response.message || 'Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...';
            this.error = '';
            
            // 2 saniye sonra giriş sayfasına yönlendir
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.error = response.message || 'Şifre sıfırlama başarısız oldu.';
            this.success = '';
          }
          this.isLoading = false;
        },
        error: (err) => {
          // Backend'den gelen spesifik hataları daha kullanıcı dostu hale getir
          if (err.error?.customException?.message) {
            const errorMsg = err.error.customException.message;
            
            if (errorMsg.includes('Code is incorrect') || errorMsg.includes('verificaton') || errorMsg.includes('verification')) {
              this.error = 'Doğrulama kodu hatalı. Lütfen tekrar kontrol edin.';
            } else if (errorMsg.includes('expired')) {
              this.error = 'Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod talep edin.';
            } else {
              this.error = ErrorHandlerUtil.handleError(err, 'Şifre sıfırlanırken bir hata oluştu');
            }
          } else {
            this.error = ErrorHandlerUtil.handleError(err, 'Şifre sıfırlanırken bir hata oluştu');
          }
          
          this.success = '';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.resetForm);
    }
  }

  resendCode() {
    this.isResending = true;
    this.error = '';
    this.success = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        // FormControl'ü sıfırla - tarayıcı otodoldurma sorunlarını önle
        this.resetForm.get('verificationCode')?.setValue('');
        this.resetForm.get('verificationCode')?.markAsPristine();
        this.resetForm.get('verificationCode')?.markAsUntouched();
        
        this.success = response.message || 'Doğrulama kodu tekrar gönderildi. Lütfen e-posta kutunuzu kontrol ediniz.';
        this.error = '';
        this.isResending = false;
      },
      error: (err) => {
        this.error = ErrorHandlerUtil.handleError(err, 'Doğrulama kodu gönderilirken bir hata oluştu');
        this.success = '';
        this.isResending = false;
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
} 