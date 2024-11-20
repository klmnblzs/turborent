import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';
import { DatePipe } from '@angular/common';

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

  approvals:any;
  currentApproval:any = null;
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

  ngOnInit(): void {
    if(this.authService.isAdmin()) {
      const subscription = this.adminService.listApprovals().subscribe({
        next: (res) => {
          this.approvals=res
          console.log(res)
        }
      })

      this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }
  }

  approvalDetails(id:number) {
    
    const subscription = this.adminService.getApprovalById(id).subscribe({
      next: (res:any) => {
        this.currentApproval=res[0]
        console.log(res[0])
      }
    })
    this.destroyRef.onDestroy(() => subscription.unsubscribe())
    
    this.openApprovalDialog()
  }
}
