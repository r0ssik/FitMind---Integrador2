import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AchievementDto } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly api = `${environment.apiUrl}/achievement`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AchievementDto[]> {
    return this.http.get<AchievementDto[]>(this.api);
  }

  checkAndUnlock(): Observable<AchievementDto[]> {
    return this.http.post<AchievementDto[]>(`${this.api}/check`, {});
  }
}
