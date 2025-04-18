import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './signup.component.html',
 // ... existing code ...
 styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  error: string = '';
  success: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: SignupComponent.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Form değişikliklerini dinle
    this.signupForm.get('password')?.valueChanges.subscribe(() => {
      this.signupForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  static passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      g.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.success = '';
      
      const { username, email, password } = this.signupForm.value;
      
      this.authService.signup({ username, email, password }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.success = 'Hesabınız başarıyla oluşturuldu! Doğrulama sayfasına yönlendiriliyorsunuz...';
          setTimeout(() => {
            this.router.navigate(['/verify-email'], { queryParams: { email } });
          }, 3000);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.message;
        }
      });
    } else {
      this.markFormGroupTouched(this.signupForm);
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

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.signupForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Bu alan zorunludur';
    }
    if (control?.hasError('email') || control?.hasError('pattern')) {
      return 'Geçerli bir e-posta adresi giriniz';
    }
    if (control?.hasError('minlength')) {
      if (controlName === 'username') {
        return 'Kullanıcı adı en az 3 karakter olmalıdır';
      }
      return 'Şifre en az 6 karakter olmalıdır';
    }
    if (control?.hasError('pattern')) {
      return 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir';
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Şifreler eşleşmiyor';
    }
    return '';
  }
} 