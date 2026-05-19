import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserSettingsDto, UpdateSettingsDto } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  get(): Observable<UserSettingsDto> {
    return this.http.get<UserSettingsDto>(this.api);
  }

  update(body: UpdateSettingsDto): Observable<UserSettingsDto> {
    return this.http.patch<UserSettingsDto>(this.api, body);
  }
}
