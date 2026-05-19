import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserDto, UpdateUserDto } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.api}/me`);
  }

  updateMe(body: UpdateUserDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.api}/me`, body);
  }

  getById(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.api}/${id}`);
  }
}
