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
    return this.requestsService.post('http://localhost:3000/admin/car/delete', body, 'Error while deleting car')
  }

  // REGISTRATION APROVAL

  listApprovals() {
    return this.requestsService.fetch('http://localhost:3000/admin/registration/approvals', 'Error while fetching approvals')
  }

  getApprovalById(id:number) {
    return this.requestsService.fetch(
      "http://localhost:3000/admin/registration/approvals/" + id,
      "Error fetching expense"
    )
  }

  approveRequest(body:Object) {
    return this.requestsService.post(
      "http://localhost:3000/admin/registration/approvals/approve",
      body,
      "Error while approving request"
    )
  }

  denyRequest(body:Object) {
    return this.requestsService.post(
      "http://localhost:3000/admin/registration/approvals/deny",
      body,
      "Error while denying request"
    )
  }

  // RENTING APPROVAL

  listRentApprovals() {
    return this.requestsService.fetch('http://localhost:3000/admin/renting/approvals', 'Error while fetching approvals')
  }

  getRentApprovalById(id:number) {
    return this.requestsService.fetch(
      "http://localhost:3000/admin/renting/approvals/" + id,
      "Error fetching expense"
    )
  }

  approveRentRequest(body:Object) {
    return this.requestsService.post(
      "http://localhost:3000/admin/renting/approvals/approve",
      body,
      "Error while approving request"
    )
  }

  denyRentRequest(body:Object) {
    return this.requestsService.post(
      "http://localhost:3000/admin/renting/approvals/deny",
      body,
      "Error while denying request"
    )
  }
}
