import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PostDto, CreatePostRequest, CommentDto, CreateCommentRequest } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class SocialService {
  private readonly api = `${environment.apiUrl}/social`;

  constructor(private http: HttpClient) {}

  getFeed(page = 1, pageSize = 20, onlyFollowing = false): Observable<PostDto[]> {
    return this.http.get<PostDto[]>(`${this.api}/feed`, {
      params: { page, pageSize, onlyFollowing },
    });
  }

  createPost(body: CreatePostRequest): Observable<PostDto> {
    return this.http.post<PostDto>(`${this.api}/posts`, body);
  }

  deletePost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/posts/${postId}`);
  }

  likePost(postId: string): Observable<void> {
    return this.http.post<void>(`${this.api}/posts/${postId}/like`, {});
  }

  unlikePost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/posts/${postId}/like`);
  }

  getComments(postId: string): Observable<CommentDto[]> {
    return this.http.get<CommentDto[]>(`${this.api}/posts/${postId}/comments`);
  }

  addComment(postId: string, body: CreateCommentRequest): Observable<CommentDto> {
    return this.http.post<CommentDto>(`${this.api}/posts/${postId}/comments`, body);
  }

  follow(userId: string): Observable<void> {
    return this.http.post<void>(`${this.api}/follow/${userId}`, {});
  }

  unfollow(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/follow/${userId}`);
  }
}
