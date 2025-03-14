import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  error: string = '';
  success: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Form başlatıldığında yapılacak işlemler
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.success = '';
      
      this.authService.signup(this.signupForm.value).subscribe({
        next: (response) => {
          console.log('Kayıt başarılı:', response);
          this.success = 'Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.';
          this.error = '';
          this.isLoading = false;
          
          // 2 saniye sonra yönlendirme yap
          setTimeout(() => {
            this.router.navigate(['/verify-email']);
          }, 2000);
        },
        error: (err) => {
          console.error('Kayıt hatası:', err);
          this.error = err.error?.customException?.message || 'Kayıt sırasında bir hata oluştu.';
          this.success = '';
          this.isLoading = false;
        }
      });
    } else {
      // Form geçerli değilse tüm alanları işaretle
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
} 