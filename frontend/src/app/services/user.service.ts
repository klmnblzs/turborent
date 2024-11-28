import { inject, Injectable } from '@angular/core';
import { RequestsService } from './requests.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private requestsService = inject(RequestsService)
  private httpClient = inject(HttpClient)

  getUserData(userid:string) {
    return this.requestsService.fetch( "http://localhost:3000/user/data/" + userid, "Error while fetching user data")
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

  getRentHistory(userid:string) {
    return this.requestsService.fetch("http://localhost:3000/user/rent-history/" + userid, "Error while fetching rental history")
  } 

  // JELSZÓ VISSZAÁLLÍTÁS

  validateToken(token:string) {
    return this.httpClient.get("http://localhost:3000/user/validate-reset-token?token=" + token)
  }

  requestResetPassword(body:Object) {
    return this.httpClient.post("http://localhost:3000/user/request-reset-password", body)
  }
  
  resetPassword(body:Object) {
    return this.httpClient.post("http://localhost:3000/user/reset-password", body)
  }

  // KAPCSOLAT

  sendContactEmail(body:Object) {
    return this.httpClient.post("http://localhost:3000/contact", body)
  }
}
