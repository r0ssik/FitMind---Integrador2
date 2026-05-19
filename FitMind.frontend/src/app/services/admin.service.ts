import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardStatsDto, AdminUserDto, ReportDto, UpdateReportStatusDto } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardStatsDto> {
    return this.http.get<DashboardStatsDto>(`${this.api}/dashboard`);
  }

  getUsers(search = '', status = ''): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>(`${this.api}/users`, { params: { search, status } });
  }

  suspendUser(userId: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/users/${userId}/suspend`, {});
  }

  blockUser(userId: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/users/${userId}/block`, {});
  }

  reactivateUser(userId: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/users/${userId}/reactivate`, {});
  }

  getReports(status = ''): Observable<ReportDto[]> {
    return this.http.get<ReportDto[]>(`${this.api}/reports`, { params: { status } });
  }

  updateReportStatus(reportId: string, body: UpdateReportStatusDto): Observable<void> {
    return this.http.patch<void>(`${this.api}/reports/${reportId}/status`, body);
  }
}
