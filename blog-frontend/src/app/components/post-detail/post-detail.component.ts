import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { PostResponseDto } from '../../models/post-response.dto';
import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CommentComponent],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  error: string = '';
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
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
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Blog yazısı yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        this.loading = false;
      }
    });
  }
  
  navigateToAuthorProfile(email: string): void {
    this.router.navigate(['/user', email]);
  }
}