import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarUploadComponent } from "./admin/car-upload/car-upload.component";
import { PersonalDataComponent } from "./user/personal-data/personal-data.component";
import { SecurityComponent } from "./user/security/security.component";
import { HistoryComponent } from "./user/history/history.component";
import { ApprovalsComponent } from "./admin/approvals/approvals.component";
import { NavbarComponent } from "./admin/navbar/navbar.component";
import { CustomerComponent } from "./admin/approvals/customer/customer.component";
import { RentalComponent } from "./admin/approvals/rental/rental.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CarUploadComponent, PersonalDataComponent, SecurityComponent, HistoryComponent, ApprovalsComponent, NavbarComponent, CustomerComponent, RentalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private router = inject(Router)
  private authService = inject(AuthService)
  private activatedRoute = inject(ActivatedRoute)
 
  userData = this.authService.getUserDataFromToken()
  currentPage:string = 'data';
  currentCustomerId:string|null = null;
  currentRentalId:string|null = null;

  logOut() {
    this.authService.logOut()
  }

  ngOnInit(): void {
    if(!localStorage.getItem("token")) {
      this.router.navigate(['/cars'])
    }
    
    this.activatedRoute.paramMap.subscribe(params => {
      if(params.get("userid") != this.authService.getUserDataFromToken().id) {
        this.router.navigate(['/dashboard/' + this.authService.getUserDataFromToken().id])
      }

      if(params.get("page")) {
        this.currentPage = params.get("page")!;

        if(this.currentPage === "approvals") {
          if(params.get("id")) {
            this.currentCustomerId = params.get("id")
          }

          if(params.get("rentalId")) {
            this.currentRentalId = params.get("rentalId")
          }
        }
      }
    })
  }
}
