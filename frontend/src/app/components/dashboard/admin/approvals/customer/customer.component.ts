import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin.service';
import { AuthService } from '../../../../../services/auth.service';
import { SnackbarService } from '../../../../shared/snackbar/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent implements OnInit {
  private adminService = inject(AdminService)
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef)
  private snackbarService = inject(SnackbarService)
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router)

  currentApproval:any = null;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      if(params.get("id")) {
        this.approvalDetails(Number(params.get("id")))
      }
    })
  }
  
  routeBack() {
    this.router.navigate(["/dashboard/" + this.authService.getUserDataFromToken().id + "/approvals"])
  }

  approvalDetails(id:number) {
    if(this.authService.isAdmin()) {
      const subscription = this.adminService.getApprovalById(id).subscribe({
        next: (res:any) => {
          this.currentApproval=res[0]
        }
      })
      this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }
  }

  approveRequest() {
    if(this.authService.isAdmin()) {
      const subscription = this.adminService.approveRequest(
        {
          customer_id: this.currentApproval.customer_id,
          admin_id: this.authService.getUserDataFromToken().id
        }
      ).subscribe({
        next: (res:any) => {  
          this.snackbarService.show("Kérés elfogadva!")
          this.routeBack()
        },
        error: (err) => {
          this.snackbarService.show("Hiba az elfogadás során", "danger")
        }
      })
      this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }
  }

  denyRequest() {
    if(this.authService.isAdmin()) {
      const subscription = this.adminService.denyRequest(
        {
          customer_id: this.currentApproval.customer_id,
        }
      ).subscribe({
        next: (res:any) => {  
          this.snackbarService.show("Kérés elutasítva!")
          this.routeBack()
        },
        error: (err) => {
          this.snackbarService.show("Hiba az elutasítás során", "danger")
        }
      })
      this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }
  }
}
