import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { PostResponseDto } from '../../models/post-response.dto';
import { UserResponseDto } from '../../models/user-response.dto';
import { CommentComponent } from '../comment/comment.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CommentComponent, TranslatePipe],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {
  post: PostResponseDto | null = null;
  author: UserResponseDto | null = null;
  error: string = '';
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadPost(params['id']);
      }
    });
  }

  loadPost(id: number) {
    this.loading = true;
    this.error = '';

    this.postService.getPostById(id).subscribe({
      next: (post: PostResponseDto) => {
        this.post = post;
        this.loadAuthorInfo(post.userEmail);
      },
      error: (error) => {
        this.error = 'post_load_error';
        this.loading = false;
      }
    });
  }

  loadAuthorInfo(email: string) {
    this.userService.getUserProfileByEmail(email).pipe(
      catchError(err => {
        return of({
          id: 0,
          email: email,
          username: email.split('@')[0],
          name: email.split('@')[0],
          role: 'USER',
          enabled: true,
          profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as UserResponseDto);
      })
    ).subscribe({
      next: (userData) => {
        this.author = userData;
        this.loading = false;
      },
      error: (err) => {
        this.author = {
          id: 0,
          email: email,
          username: email.split('@')[0],
          name: email.split('@')[0],
          role: 'USER',
          enabled: true,
          profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.loading = false;
      }
    });
  }
  
  navigateToAuthorProfile(email: string): void {
    this.router.navigate(['/user', email]);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.post?.userEmail || '')}`;
    }
  }
}