import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ErrorHandlerUtil } from '../../utils/error-handler.util';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  redirectingMessage: boolean = false;

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
      this.redirectingMessage = false;
      
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
          
          // ErrorHandlerUtil ile hata mesajını al
          const errorMessage = ErrorHandlerUtil.handleError(err, 'Giriş yapılamadı');
          
          if (errorMessage.includes('doğrulanmamış') || 
              errorMessage.includes('UNVERIFIED') ||
              (err.error?.message && (
                err.error.message.includes('not verified') ||
                err.error.message.includes('UNVERIFIED')
              ))) {
            this.redirectingMessage = true;
            this.error = 'E-posta adresiniz henüz doğrulanmamış, lütfen e-postanızı kontrol edin.';
            
            // 3 saniye sonra yönlendir
            setTimeout(() => {
              this.router.navigate(['/verify-email'], { 
                queryParams: { email: this.loginForm.get('email')?.value } 
              });
            }, 3000);
          } else {
            this.error = errorMessage;
          }
          
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