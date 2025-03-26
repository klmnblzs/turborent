import { Component, DestroyRef, inject } from '@angular/core';
import { AdminService } from '../../../../../services/admin.service';
import { AuthService } from '../../../../../services/auth.service';
import { SnackbarService } from '../../../../shared/snackbar/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-rental',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './rental.component.html',
  styleUrl: './rental.component.scss'
})
export class RentalComponent {
  private adminService = inject(AdminService)
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef)
  private snackbarService = inject(SnackbarService)
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router)

  currentRentApproval:any = null;
  
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      if(params.get("rentalId")) {
        this.rentApprovalDetails(Number(params.get("rentalId")))
      }
    })
  }

  routeBack() {
    this.router.navigate(["/dashboard/" + this.authService.getUserDataFromToken().id + "/approvals"])
  }

  rentApprovalDetails(id:number) {
    if(this.authService.isAdmin()) {
      const subscription = this.adminService.getRentApprovalById(id).subscribe({
        next: (res:any) => {
          this.currentRentApproval=res
        }
      })
      this.destroyRef.onDestroy(() => subscription.unsubscribe())
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
          this.routeBack()
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
