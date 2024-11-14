import { inject, Injectable } from '@angular/core';
import { RequestsService } from './requests.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  requestsService = inject(RequestsService)

  getUserData(userid:string) {
    return this.requestsService.fetch(
      "http://localhost:3000/user/data/" + userid,
      "Error while fetching user data"
    )
  }
}
