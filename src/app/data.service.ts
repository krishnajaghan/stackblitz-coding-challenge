import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TramService {
  // private jsonUrl = 'app/assets/tram-data1.json';
  private jsonUrl = '/assets/tram-data1.json';

  constructor(
    private http: HttpClient
    ){}

    //service call
  getTramDepartures(): Observable<any> {
    return this.http.get<any>(this.jsonUrl);
  }
}
