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

  listApprovals() {
    return this.requestsService.fetch('http://localhost:3000/admin/approvals', 'Error while fetching approvals')
  }

  getApprovalById(id:number) {
    return this.requestsService.fetch(
      "http://localhost:3000/admin/approvals/" + id,
      "Error fetching expense"
    )
  }

  approveRequest(body:Object) {
    return this.requestsService.post(
      "http://localhost:3000/admin/approvals/approve",
      body,
      "Error while approving request"
    )
  }

  denyRequest(body:Object) {
    return this.requestsService.post(
      "http://localhost:3000/admin/approvals/deny",
      body,
      "Error while denying request"
    )
  }
}
