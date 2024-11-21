import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { RequestsService } from './requests.service';

@Injectable({
  providedIn: 'root'
})
export class CarsService {
  private httpClient = inject(HttpClient)
  private requestsService = inject(RequestsService)

  private fetch(url:string, errorMessage:string) {
    return this.httpClient.get(url)
    .pipe(
      catchError((err) => throwError(() => {
        console.log(err)
        new Error(errorMessage)
      }))
    )
  }

  private fetchById(url:string, errorMessage:string, carId:string) {
    let headers = new HttpHeaders();
    headers = headers.set('id', carId);

    return this.httpClient.get(url, { headers: headers })
    .pipe(
      catchError((err) => throwError(() => {
        console.log(err)
        new Error(errorMessage)
      }))
    )
  }

  getCarList() {
    return this.fetch(
      "http://localhost:3000/cars",
      "Something went wrong while fetching the cars."
    )
  }

  getCategoryList() {
    return this.fetch(
      "http://localhost:3000/filter/categories",
      "Something went wrong while fetching the categories."
    )
  }

  getBrandList() {
    return this.fetch(
      "http://localhost:3000/filter/brands",
      "Something went wrong while fetching the categories."
    )
  }

  getCarById(id: string) {
    return this.fetchById(
      "http://localhost:3000/cars",
      "There was an error",
      id
    )
  }

  checkAvailable(body:Object) {
    return this.requestsService.post(
      "http://localhost:3000/cars/is-available",
      body,
      "Error while checking is car is available"
    )
  }
}
