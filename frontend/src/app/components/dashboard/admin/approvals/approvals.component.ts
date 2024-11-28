import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';
import { DatePipe } from '@angular/common';
import { SnackbarService } from '../../../shared/snackbar/snackbar.service';

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

  approvals:any = null;
  rentApprovals:any = null;
  currentApproval:any = null;
  currentRentApproval:any = null;
  submitErr:boolean=false;

  openApprovalDialog() {
    const dialog = document.getElementById("approvalDialog") as HTMLElement
    
    dialog.style.visibility = "unset"
  }

  hideApprovalDialog() {
    const dialog = document.getElementById("approvalDialog") as HTMLElement
    
    dialog.style.visibility = "hidden"
    this.submitErr=false
  }

  openRentApprovalDialog() {
    const dialog = document.getElementById("rentApprovalDialog") as HTMLElement
    
    dialog.style.visibility = "unset"
  }

  hideRentApprovalDialog() {
    const dialog = document.getElementById("rentApprovalDialog") as HTMLElement
    
    dialog.style.visibility = "hidden"
    this.submitErr=false
  }

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
    if(this.authService.isAdmin()) {
      const subscription = this.adminService.getApprovalById(id).subscribe({
        next: (res:any) => {
          this.currentApproval=res[0]
        }
      })
      this.destroyRef.onDestroy(() => subscription.unsubscribe())

      this.openApprovalDialog()
    }
  }

  rentApprovalDetails(id:number) {
    if(this.authService.isAdmin()) {
      const subscription = this.adminService.getRentApprovalById(id).subscribe({
        next: (res:any) => {
          this.currentRentApproval=res
          console.log(res)
        }
      })
      this.destroyRef.onDestroy(() => subscription.unsubscribe())

      this.openRentApprovalDialog()
    }
  }

  approveRentRequest() {
    if(this.authService.isAdmin()) {
      const subscription = this.adminService.approveRentRequest(
        {
          rental_id: this.currentRentApproval[0].approval_id,
          admin_id: this.authService.getUserDataFromToken().id
        }
      ).subscribe({
        next: (res:any) => {  
          this.snackbarService.show("Foglalás elfogadva!")
          this.hideRentApprovalDialog()
          this.loadApprovals()
          this.loadRentApprovals()
        },
        error: (err) => {
          this.snackbarService.show("Hiba az elfogadás során", "danger")
        }
      })
      this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }
  }

  denyRentRequest() {
    if(this.authService.isAdmin()) {
      const subscription = this.adminService.denyRentRequest(
        {
          rental_id: this.currentRentApproval[0].approval_id,
        }
      ).subscribe({
        next: (res:any) => {  
          this.snackbarService.show("Fogadás elutasítva!")
          this.hideRentApprovalDialog()
          this.loadApprovals()
          this.loadRentApprovals()
        },
        error: (err) => {
          this.snackbarService.show("Hiba az elutasítás során", "danger")
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
          this.hideApprovalDialog()
          this.loadApprovals()
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
          this.hideApprovalDialog()
          this.loadApprovals()
        },
        error: (err) => {
          this.snackbarService.show("Hiba az elutasítás során", "danger")
        }
      })
      this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }
  }
}
