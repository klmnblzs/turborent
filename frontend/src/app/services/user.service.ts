import { inject, Injectable } from '@angular/core';
import { RequestsService } from './requests.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private requestsService = inject(RequestsService)

  getUserData(userid:string) {
    return this.requestsService.fetch(
      "http://localhost:3000/user/data/" + userid,
      "Error while fetching user data"
    )
  }

  editUserData(body:Object) {
    return this.requestsService.post("http://localhost:3000/user/edit/", body, "Error while updating user data")
  }


  editUserPassword(body:Object) {
    return this.requestsService.post("http://localhost:3000/user/edit/password", body, "Error while updating user password")
  }

  // BÉRLÉS

  createRentRequest(body:Object) {
    return this.requestsService.post("http://localhost:3000/user/rent", body, "Error while trying to rent")
  }
}
