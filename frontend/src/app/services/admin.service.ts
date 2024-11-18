import { inject, Injectable } from '@angular/core';
import { RequestsService } from './requests.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private requestsService = inject(RequestsService);

  addCar(body:FormData) {
    return this.requestsService.post('http://localhost:3000/admin/car/add', body, 'Error while adding new car')
  }

  deleteCar(body:Object) {
    return this.requestsService.post('http://localhost:3000/admin/car/delete', body, 'Errer while deleting car')
  }
}
