import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';
import { DatePipe } from '@angular/common';
import { SnackbarService } from '../../../shared/snackbar/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.scss'
})
export class ApprovalsComponent implements OnInit {
  private adminService = inject(AdminService)
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef)
  private snackbarService = inject(SnackbarService)

  private router = inject(Router)
  private activatedRoute = inject(ActivatedRoute)

  approvals:any = null;
  rentApprovals:any = null;
  currentApproval:any = null;
  currentRentApproval:any = null;
  submitErr:boolean=false;

  loadApprovals() {
    if(this.authService.isAdmin()) {
      const subscription = this.adminService.listApprovals().subscribe({
        next: (res) => {
          this.approvals=res
        }
      })

      this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }
  }

  loadRentApprovals() {
    if(this.authService.isAdmin()) {

      const subscription = this.adminService.listRentApprovals().subscribe({
        next: (res) => {
          this.rentApprovals=res
        }
      })

      this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }
  }

  ngOnInit(): void {
    this.loadApprovals()
    this.loadRentApprovals()
  }

  approvalDetails(id:number) {
    this.router.navigate(["/dashboard/" + this.authService.getUserDataFromToken().id + "/approvals/customer/"+id], {
      relativeTo: this.activatedRoute
    })
  }

  rentApprovalDetails(id:number) {
    this.router.navigate(["/dashboard/" + this.authService.getUserDataFromToken().id + "/approvals/rental/"+id], {
      relativeTo: this.activatedRoute
    })
  }
}