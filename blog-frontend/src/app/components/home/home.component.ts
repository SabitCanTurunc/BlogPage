import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { PostResponseDto } from '../../models/post-response.dto';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800&family=Poppins:wght@300;400;500;600&display=swap');

    .blog-container {
      min-height: 100vh;
      background-color: #0f0f1a;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(45, 0, 247, 0.15) 0%, transparent 30%),
        radial-gradient(circle at 90% 80%, rgba(255, 0, 136, 0.15) 0%, transparent 30%),
        url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%232d00f7' stroke-width='1.5' stroke-opacity='0.2'%3E%3C!-- Kalem simgesi 1 --%3E%3Cpath d='M50 120 l-5 15 l1 1 l15 -5 l-11 -11 Z M46 135 l0 3 l3 0 Z' stroke-width='1' fill='%232d00f7' fill-opacity='0.2'/%3E%3C!-- Kitap simgesi 1 --%3E%3Cpath d='M240 50 h16 v20 h-16 v-20 M240 50 c-3 2 -3 18 0 20 M256 50 v20 M242 55 h12 M242 60 h12 M242 65 h12' stroke-width='1' fill='none'/%3E%3C!-- Tüy simgesi 1 --%3E%3Cpath d='M370 150 c-10 15 -15 5 -5 -5 c-10 5 -5 15 5 5 c-2 10 -8 10 -10 0' stroke-width='1' fill='none'/%3E%3C!-- Kalem simgesi 2 --%3E%3Cpath d='M130 200 l-5 15 l1 1 l15 -5 l-11 -11 Z M126 215 l0 3 l3 0 Z' stroke-width='1' fill='%232d00f7' fill-opacity='0.2'/%3E%3C!-- Kitap simgesi 2 --%3E%3Cpath d='M320 260 h16 v20 h-16 v-20 M320 260 c-3 2 -3 18 0 20 M336 260 v20 M322 265 h12 M322 270 h12 M322 275 h12' stroke-width='1' fill='none'/%3E%3C!-- Tüy simgesi 2 --%3E%3Cpath d='M180 300 c-10 15 -15 5 -5 -5 c-10 5 -5 15 5 5 c-2 10 -8 10 -10 0' stroke-width='1' fill='none'/%3E%3C!-- Kalem simgesi 3 --%3E%3Cpath d='M80 280 l-5 15 l1 1 l15 -5 l-11 -11 Z M76 295 l0 3 l3 0 Z' stroke-width='1' fill='%232d00f7' fill-opacity='0.2'/%3E%3C!-- Kitap simgesi 3 --%3E%3Cpath d='M150 70 h16 v20 h-16 v-20 M150 70 c-3 2 -3 18 0 20 M166 70 v20 M152 75 h12 M152 80 h12 M152 85 h12' stroke-width='1' fill='none'/%3E%3C!-- Tüy simgesi 3 --%3E%3Cpath d='M300 110 c-10 15 -15 5 -5 -5 c-10 5 -5 15 5 5 c-2 10 -8 10 -10 0' stroke-width='1' fill='none'/%3E%3C!-- Kalem simgesi 4 --%3E%3Cpath d='M250 340 l-5 15 l1 1 l15 -5 l-11 -11 Z M246 355 l0 3 l3 0 Z' stroke-width='1' fill='%232d00f7' fill-opacity='0.2'/%3E%3C!-- Kitap simgesi 4 --%3E%3Cpath d='M90 300 h16 v20 h-16 v-20 M90 300 c-3 2 -3 18 0 20 M106 300 v20 M92 305 h12 M92 310 h12 M92 315 h12' stroke-width='1' fill='none'/%3E%3C!-- Tüy simgesi 4 --%3E%3Cpath d='M330 30 c-10 15 -15 5 -5 -5 c-10 5 -5 15 5 5 c-2 10 -8 10 -10 0' stroke-width='1' fill='none'/%3E%3C!-- Kalem simgesi 5 --%3E%3Cpath d='M80 20 l-5 15 l1 1 l15 -5 l-11 -11 Z M76 35 l0 3 l3 0 Z' stroke-width='1' fill='%232d00f7' fill-opacity='0.2'/%3E%3C!-- Kitap simgesi 5 --%3E%3Cpath d='M210 140 h16 v20 h-16 v-20 M210 140 c-3 2 -3 18 0 20 M226 140 v20 M212 145 h12 M212 150 h12 M212 155 h12' stroke-width='1' fill='none'/%3E%3C!-- Tüy simgesi 5 --%3E%3Cpath d='M370 290 c-10 15 -15 5 -5 -5 c-10 5 -5 15 5 5 c-2 10 -8 10 -10 0' stroke-width='1' fill='none'/%3E%3C!-- Kalem simgesi 6 --%3E%3Cpath d='M30 200 l-5 15 l1 1 l15 -5 l-11 -11 Z M26 215 l0 3 l3 0 Z' stroke-width='1' fill='%232d00f7' fill-opacity='0.2'/%3E%3C/g%3E%3C/svg%3E");
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, rgba(15, 15, 30, 0.7) 0%, rgba(26, 26, 46, 0.7) 100%);
      color: #fff;
      padding: 6rem 2rem;
      text-align: center;
      margin-bottom: 3rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 30px rgba(255, 0, 136, 0.3);
      border-bottom: 1px solid rgba(255, 0, 136, 0.3);
      backdrop-filter: blur(5px);
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(45, 0, 247, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(255, 0, 136, 0.2) 0%, transparent 50%);
      z-index: 1;
    }

    .hero-section::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke-opacity='0.8'%3E%3C!-- Kalem simgesi 1 --%3E%3Cpath d='M50 120 l-5 15 l1 1 l15 -5 l-11 -11 Z M46 135 l0 3 l3 0 Z' stroke='%23ff0088' stroke-width='2.5' fill='%23ff0088' fill-opacity='0.3'/%3E%3C!-- Kitap simgesi 1 --%3E%3Cpath d='M240 50 h16 v20 h-16 v-20 M240 50 c-3 2 -3 18 0 20 M256 50 v20 M242 55 h12 M242 60 h12 M242 65 h12' stroke='%232d00f7' stroke-width='2.5' fill='none'/%3E%3C!-- Tüy simgesi 1 --%3E%3Cpath d='M370 150 c-10 15 -15 5 -5 -5 c-10 5 -5 15 5 5 c-2 10 -8 10 -10 0' stroke='%23ffffff' stroke-width='2.5' fill='none'/%3E%3C!-- Kalem simgesi 2 --%3E%3Cpath d='M130 200 l-5 15 l1 1 l15 -5 l-11 -11 Z M126 215 l0 3 l3 0 Z' stroke='%23ff0088' stroke-width='2.5' fill='%23ff0088' fill-opacity='0.3'/%3E%3C!-- Kitap simgesi 2 --%3E%3Cpath d='M320 260 h16 v20 h-16 v-20 M320 260 c-3 2 -3 18 0 20 M336 260 v20 M322 265 h12 M322 270 h12 M322 275 h12' stroke='%232d00f7' stroke-width='2.5' fill='none'/%3E%3C!-- Tüy simgesi 2 --%3E%3Cpath d='M180 300 c-10 15 -15 5 -5 -5 c-10 5 -5 15 5 5 c-2 10 -8 10 -10 0' stroke='%23ffffff' stroke-width='2.5' fill='none'/%3E%3C!-- Kalem simgesi 3 --%3E%3Cpath d='M80 280 l-5 15 l1 1 l15 -5 l-11 -11 Z M76 295 l0 3 l3 0 Z' stroke='%23ff0088' stroke-width='2.5' fill='%23ff0088' fill-opacity='0.3'/%3E%3C!-- Kitap simgesi 3 --%3E%3Cpath d='M150 70 h16 v20 h-16 v-20 M150 70 c-3 2 -3 18 0 20 M166 70 v20 M152 75 h12 M152 80 h12 M152 85 h12' stroke='%232d00f7' stroke-width='2.5' fill='none'/%3E%3C!-- Tüy simgesi 3 --%3E%3Cpath d='M300 110 c-10 15 -15 5 -5 -5 c-10 5 -5 15 5 5 c-2 10 -8 10 -10 0' stroke='%23ffffff' stroke-width='2.5' fill='none'/%3E%3C/g%3E%3C/svg%3E");
      background-size: 800px 800px;
      background-repeat: repeat;
      opacity: 0.9;
      z-index: 1;
      pointer-events: none;
      animation: float 20s infinite linear;
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.6));
    }

    @keyframes float {
      0% {
        background-position: 0 0;
      }
      100% {
        background-position: 800px 800px;
      }
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 800px;
      margin: 0 auto;
    }

    .hero-logo {
      margin-bottom: 1.5rem;
    }

    .blog-logo {
      width: 180px;
      height: 180px;
      object-fit: contain;
      filter: drop-shadow(0 0 15px rgba(255, 0, 136, 0.7));
      transition: all 0.3s ease;
    }

    .blog-logo:hover {
      transform: scale(1.05);
      filter: drop-shadow(0 0 20px rgba(45, 0, 247, 0.8));
    }

    .hero-content h1 {
      font-size: 5rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      background: linear-gradient(45deg, #ff0088, #2d00f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 15px rgba(255, 0, 136, 0.5);
      font-family: 'Montserrat', sans-serif;
      letter-spacing: -1px;
    }

    .hero-subtitle {
      color: #fff;
      font-size: 1.5rem;
      opacity: 0.9;
      margin-bottom: 2.5rem;
      line-height: 1.6;
      font-family: 'Poppins', sans-serif;
      text-shadow: 0 0 10px rgba(45, 0, 247, 0.5);
    }

    .hero-buttons {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
    }

    .btn-light {
      background: linear-gradient(45deg, #ff0088, #ff5e5e);
      color: #fff;
      border: none;
      padding: 1rem 2.5rem;
      font-weight: 600;
      border-radius: 50px;
      box-shadow: 0 0 20px rgba(255, 0, 136, 0.5);
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-family: 'Poppins', sans-serif;
    }

    .btn-light:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 30px rgba(255, 0, 136, 0.8);
      background: linear-gradient(45deg, #ff0088, #ff0055);
    }

    .btn-outline-light {
      background: transparent;
      color: #fff;
      border: 2px solid #2d00f7;
      padding: 1rem 2.5rem;
      font-weight: 600;
      border-radius: 50px;
      box-shadow: 0 0 15px rgba(45, 0, 247, 0.5);
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-family: 'Poppins', sans-serif;
    }

    .btn-outline-light:hover {
      background: rgba(45, 0, 247, 0.2);
      border-color: #2d00f7;
      transform: translateY(-3px);
      box-shadow: 0 0 25px rgba(45, 0, 247, 0.7);
    }

    /* Main Content Layout */
    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
    }

    /* Sidebar Styles */
    .sidebar {
      position: sticky;
      top: 2rem;
      height: fit-content;
    }

    .sidebar-content {
      background: rgba(10, 10, 26, 0.6);
      border-radius: 16px;
      box-shadow: 0 0 20px rgba(80, 0, 255, 0.3);
      padding: 2rem;
      border: 1px solid rgba(255, 0, 230, 0.3);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .sidebar-section {
      margin-bottom: 2rem;
    }

    .sidebar-section:last-child {
      margin-bottom: 0;
    }

    .sidebar-section h3 {
      color: #ff00e6;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      position: relative;
      padding-bottom: 0.5rem;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
    }

    .sidebar-section h3::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: linear-gradient(45deg, #5000ff, #ff00e6);
      border-radius: 3px;
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-item {
      padding: 1rem 1.5rem;
      border: none;
      background: rgba(80, 0, 255, 0.1);
      text-align: left;
      border-radius: 12px;
      transition: all 0.3s;
      color: #ffffff;
      font-size: 1rem;
      font-weight: 500;
      border: 1px solid rgba(255, 0, 230, 0.2);
    }

    .category-text {
      position: relative;
      z-index: 2;
    }

    .category-item:hover {
      background: rgba(255, 0, 230, 0.2);
      transform: translateX(5px);
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.3);
    }

    .category-item.active {
      background: linear-gradient(45deg, rgba(80, 0, 255, 0.3), rgba(255, 0, 230, 0.3));
      color: #ffffff;
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
      border: 1px solid rgba(255, 0, 230, 0.5);
    }

    /* Popular Authors */
    .popular-authors {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .author-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      transition: all 0.3s;
      background: rgba(80, 0, 255, 0.1);
      border: 1px solid rgba(255, 0, 230, 0.2);
    }

    .author-item:hover {
      background: rgba(255, 0, 230, 0.2);
      transform: translateX(5px);
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.3);
    }

    .author-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #ff00e6;
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }

    .author-name {
      color: #ffffff;
      font-size: 0.9rem;
    }

    /* Recent Posts */
    .recent-posts {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .recent-post-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      background: rgba(80, 0, 255, 0.1);
      border: 1px solid rgba(255, 0, 230, 0.2);
      transition: all 0.3s;
    }

    .recent-post-item:hover {
      background: rgba(255, 0, 230, 0.2);
      transform: translateX(5px);
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.3);
    }

    .recent-post-link {
      color: #ffffff;
      text-decoration: none;
      font-size: 0.9rem;
      line-height: 1.4;
      transition: color 0.2s;
    }

    .recent-post-link:hover {
      color: #ff00e6;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
    }

    .recent-post-date {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
    }

    /* Posts Section */
    .posts-section {
      min-height: 500px;
    }

    .posts-grid {
      display: grid;
      gap: 2rem;
    }

    .post-card {
      background: rgba(10, 10, 26, 0.6);
      border-radius: 16px;
      box-shadow: 0 0 20px rgba(80, 0, 255, 0.3);
      transition: all 0.3s;
      border: 1px solid rgba(255, 0, 230, 0.3);
      overflow: hidden;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .post-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 0 30px rgba(255, 0, 230, 0.5);
    }

    .card-body {
      padding: 2rem;
      background: transparent;
    }

    .card {
      background-color: transparent;
      border: none;
    }

    .post-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      color: #ffffff;
    }

    .post-date {
      color: #ff00e6;
      font-weight: 500;
      text-shadow: 0 0 5px rgba(255, 0, 230, 0.8);
    }

    .post-category {
      background: rgba(80, 0, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      color: #ffffff;
      font-weight: 500;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
    }

    .post-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 1.5rem;
      line-height: 1.4;
      border-bottom: 2px solid #ff00e6;
      padding-bottom: 0.5rem;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 10px rgba(255, 0, 230, 0.5);
    }

    .post-excerpt {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.8;
      margin-bottom: 2rem;
      font-size: 1.1rem;
      background: rgba(80, 0, 255, 0.1);
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 0, 230, 0.2);
    }

    .post-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 2px solid #ff00e6;
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 1rem;
      background: rgba(80, 0, 255, 0.2);
      border-radius: 50px;
      transition: all 0.3s;
      border: 1px solid rgba(255, 0, 230, 0.3);
    }

    .post-author:hover {
      background: rgba(255, 0, 230, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
    }

    .read-more {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
      padding: 0.75rem 1.5rem;
      background: rgba(255, 0, 230, 0.2);
      border-radius: 50px;
      border: 1px solid rgba(255, 0, 230, 0.5);
      box-shadow: 0 0 10px rgba(255, 0, 230, 0.3);
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
    }

    .read-more:hover {
      background: rgba(80, 0, 255, 0.3);
      transform: translateX(5px);
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
    }

    .read-more svg {
      transition: transform 0.3s;
    }

    .read-more:hover svg {
      transform: translateX(4px);
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      position: relative;
    }

    .spinner-inner {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 4px solid transparent;
      border-top-color: #ff00e6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      box-shadow: 0 0 20px rgba(255, 0, 230, 0.8);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-spinner span {
      color: #ff00e6;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 10px rgba(255, 0, 230, 0.8);
    }

    /* No Posts */
    .no-posts {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .no-posts-content {
      text-align: center;
      background: rgba(10, 10, 26, 0.6);
      border-radius: 16px;
      padding: 3rem;
      border: 1px solid rgba(255, 0, 230, 0.3);
      box-shadow: 0 0 20px rgba(80, 0, 255, 0.3);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      max-width: 500px;
    }

    .no-posts-content svg {
      color: #ff00e6;
      margin-bottom: 1.5rem;
      filter: drop-shadow(0 0 10px rgba(255, 0, 230, 0.8));
    }

    .no-posts-content h3 {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #ff00e6;
      text-shadow: 0 0 10px rgba(255, 0, 230, 0.5);
    }

    .no-posts-content p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0;
    }

    /* Alert */
    .alert-danger {
      background: rgba(255, 0, 0, 0.1);
      border: 1px solid rgba(255, 0, 0, 0.3);
      color: #ffffff;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      text-align: center;
      margin: 2rem 0;
    }

    /* Admin Button Styles */
    .admin-button-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
    }

    .btn-admin-small {
      background: rgba(80, 0, 255, 0.2);
      color: #ffffff;
      border: 1px solid rgba(255, 0, 230, 0.5);
      padding: 0.5rem 1rem;
      font-weight: 600;
      border-radius: 50px;
      box-shadow: 0 0 15px rgba(255, 0, 230, 0.5);
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Orbitron', sans-serif;
    }

    .btn-admin-small:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 20px rgba(255, 0, 230, 0.8);
      background: rgba(255, 0, 230, 0.3);
    }

    .btn-admin-small svg {
      transition: transform 0.3s;
      filter: drop-shadow(0 0 5px rgba(255, 0, 230, 0.8));
    }

    .btn-admin-small:hover svg {
      transform: rotate(360deg);
    }

    /* Responsive Design */
    @media (max-width: 992px) {
      .main-content {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: relative;
        top: 0;
      }

      .hero-buttons {
        flex-direction: column;
      }
    }

    @media (max-width: 768px) {
      .hero-section {
        padding: 3rem 1rem;
      }

      .hero-content h1 {
        font-size: 2.5rem;
      }

      .main-content {
        padding: 0 1rem;
      }

      .admin-button-container {
        top: 0.5rem;
        right: 0.5rem;
      }

      .btn-admin-small {
        padding: 0.4rem 0.8rem;
        font-size: 0.7rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  posts: PostResponseDto[] = [];
  filteredPosts: PostResponseDto[] = [];
  categories: string[] = [];
  selectedCategory: string | null = null;
  error: string = '';
  loading: boolean = true;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  popularAuthors: string[] = [];
  recentPosts: PostResponseDto[] = [];
  authorStats: { [key: string]: number } = {};

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    this.error = '';

    this.postService.getAllPosts().subscribe({
      next: (posts: PostResponseDto[]) => {
        this.posts = posts;
        this.filteredPosts = posts;
        this.categories = [...new Set(posts.map(post => post.categoryName))].sort();
        this.authorStats = posts.reduce((acc: { [key: string]: number }, post) => {
          acc[post.userEmail] = (acc[post.userEmail] || 0) + 1;
          return acc;
        }, {});
        this.popularAuthors = Object.entries(this.authorStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([author]) => author);
        this.recentPosts = [...posts]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        this.loading = false;
      }
    });
  }

  filterByCategory(category: string | null) {
    this.selectedCategory = category;
    this.filteredPosts = category 
      ? this.posts.filter(post => post.categoryName === category)
      : this.posts;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  navigateToCreatePost() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/create-post']);
    }
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/home']);
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }
}