import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
          
          if (err.error && err.error.message) {
            this.error = err.error.message;
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