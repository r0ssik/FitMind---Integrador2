import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FoodItemDto, FoodCalculatedDto, ImageAnalysisResultDto } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class FoodService {
  private readonly api = `${environment.apiUrl}/food`;

  constructor(private http: HttpClient) {}

  search(q: string): Observable<FoodItemDto[]> {
    return this.http.get<FoodItemDto[]>(`${this.api}/search`, { params: { q } });
  }

  calculate(foodId: string, grams: number): Observable<FoodCalculatedDto> {
    return this.http.get<FoodCalculatedDto>(`${this.api}/${foodId}/calculate`, { params: { grams } });
  }

  analyzeImage(file: File): Observable<ImageAnalysisResultDto> {
    const formData = new FormData();
    formData.append('Image', file);
    return this.http.post<ImageAnalysisResultDto>(`${this.api}/analyze-image`, formData);
  }
}
