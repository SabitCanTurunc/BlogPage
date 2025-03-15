import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comment`;

  constructor(private http: HttpClient) { }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/post/${postId}`).pipe(
      map(comments => comments.map(comment => ({
        ...comment,
        createdAt: comment.createdAt ? new Date(comment.createdAt) : undefined,
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
      })))
    );
  }

  createComment(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment).pipe(
      map(comment => ({
        ...comment,
        createdAt: comment.createdAt ? new Date(comment.createdAt) : undefined,
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
      }))
    );
  }

  updateComment(id: number, comment: Comment): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, comment).pipe(
      map(comment => ({
        ...comment,
        createdAt: comment.createdAt ? new Date(comment.createdAt) : undefined,
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
      }))
    );
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 