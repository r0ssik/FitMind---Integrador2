import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChallengeDto, CreateChallengeRequest, UpdateChallengeProgressRequest } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private readonly api = `${environment.apiUrl}/challenge`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ChallengeDto[]> {
    return this.http.get<ChallengeDto[]>(this.api);
  }

  getById(id: string): Observable<ChallengeDto> {
    return this.http.get<ChallengeDto>(`${this.api}/${id}`);
  }

  create(body: CreateChallengeRequest): Observable<ChallengeDto> {
    return this.http.post<ChallengeDto>(this.api, body);
  }

  join(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/${id}/join`, {});
  }

  updateProgress(id: string, body: UpdateChallengeProgressRequest): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/progress`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
