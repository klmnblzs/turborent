import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  private httpClient = inject(HttpClient)
  private router = inject(Router);

  // refreshToken() {
  //   const refreshToken = localStorage.getItem("refreshToken");

  //   if (!refreshToken) {
  //     this.router.navigate(["/logout"])
  //     return throwError(() => new Error("No refresh token found"));
  //   }

  //   return this.httpClient.post<{ token: string }>('http://localhost:3000/auth/refresh', { refreshToken }).pipe(
  //     tap((res: any) => {
  //       localStorage.setItem("token", res.token);
  //       localStorage.setItem("refreshToken", res.refreshToken)
  //     })
  //   );
  // }

  refreshToken() {
    return this.httpClient.post<{ token: string }>('http://localhost:3000/auth/refresh', {}, { withCredentials: true } ).pipe(
      tap((res: any) => {
        localStorage.setItem("token", res.token);
      })
    );
  }

  post(url: string, body: Object, errorMessage: string) {
    const token = localStorage.getItem("token")?.replace(/"/g, "")

    if (!token) {
      this.router.navigate(["/logout"])
      return throwError(() => new Error("Token not found"));
    }

    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.httpClient.post(url, body, { headers: headers, withCredentials: true }).pipe(
      catchError((err) => {
        // TODO: KIJAVÍTANI A REFRESH TOKENT

        if (err.status === 403 || // Forbidden
          err.status == 401) { // Unauthorized
          return this.refreshToken().pipe(
            switchMap((res) => {
              localStorage.setItem("token", res.token);
              headers = headers.set('Authorization', `Bearer ${res.token}`);
              return this.httpClient.get(url, { headers });
            })
          );
        }
        return throwError(() => new Error(err));
      })
    );
  }

  fetch(url: string, errorMessage: string) {
    const token = localStorage.getItem("token")?.replace(/"/g, "")

    if (!token) {
      return throwError(() => new Error("Token not found"));
    }

    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.httpClient.get(url, { headers: headers, withCredentials: true }).pipe(
      catchError((err) => {
        if (err.status === 403 || // Forbidden
          err.status === 401) { // Unauthorized
          return this.refreshToken().pipe(
            switchMap((res) => {
              localStorage.setItem("token", res.token);
              headers = headers.set('Authorization', `Bearer ${res.token}`);
              return this.httpClient.get(url, { headers });
            })
          );
        }
        return throwError(() => new Error(err));
      })
    );
  }
}