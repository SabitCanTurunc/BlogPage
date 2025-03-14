import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <h1>Blog Ana Sayfası</h1>
      <p>Hoş geldiniz!</p>
      <div class="actions">
        <a routerLink="/login" class="btn btn-primary">Giriş Yap</a>
        <a routerLink="/signup" class="btn btn-secondary">Kayıt Ol</a>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    h1 {
      color: #333;
      margin-bottom: 1rem;
    }

    .actions {
      margin-top: 2rem;
    }

    .btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      margin: 0 0.5rem;
      text-decoration: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
  `]
})
export class HomeComponent implements OnInit {
  constructor() { }

  ngOnInit(): void { }
} 