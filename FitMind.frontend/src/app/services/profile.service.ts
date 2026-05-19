import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PublicProfileDto } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<PublicProfileDto> {
    return this.http.get<PublicProfileDto>(`${this.api}/me`);
  }

  getById(userId: string): Observable<PublicProfileDto> {
    return this.http.get<PublicProfileDto>(`${this.api}/${userId}`);
  }
}
