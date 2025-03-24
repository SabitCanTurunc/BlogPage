import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Comment } from '../models/comment.model';
import { ErrorHandlerUtil } from '../utils/error-handler.util';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comment`;

  constructor(private http: HttpClient) { }

  private handleError = (error: HttpErrorResponse) => {
    const errorMessage = ErrorHandlerUtil.handleError(error, 'Yorum işlemi sırasında bir hata oluştu');
    return throwError(() => new Error(errorMessage));
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/post/${postId}`).pipe(
      map(comments => comments.map(comment => ({
        ...comment,
        createdAt: comment.createdAt ? new Date(comment.createdAt) : undefined,
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
      }))),
      catchError(this.handleError)
    );
  }

  createComment(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment).pipe(
      map(comment => ({
        ...comment,
        createdAt: comment.createdAt ? new Date(comment.createdAt) : undefined,
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
      })),
      catchError(this.handleError)
    );
  }

  updateComment(id: number, comment: Comment): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, comment).pipe(
      map(comment => ({
        ...comment,
        createdAt: comment.createdAt ? new Date(comment.createdAt) : undefined,
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
      })),
      catchError(this.handleError)
    );
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
} 