import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CarUploadComponent } from "./admin/car-upload/car-upload.component";
import { SnackbarService } from '../shared/snackbar/snackbar.service';
import { PersonalDataComponent } from "./user/personal-data/personal-data.component";
import { SecurityComponent } from "./user/security/security.component";
import { HistoryComponent } from "./user/history/history.component";
import { ApprovalsComponent } from "./user/approvals/approvals.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CarUploadComponent, PersonalDataComponent, SecurityComponent, HistoryComponent, ApprovalsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private router = inject(Router)
  private userService = inject(UserService)
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef)
  private activatedRoute = inject(ActivatedRoute)
  private snackbarService = inject(SnackbarService)
 
  userData = this.authService.getUserDataFromToken()
  currentPage:string = 'data';

  logOut() {
    this.router.navigate(["/logout"])
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      if(params.get("userid") != this.authService.getUserDataFromToken().id) {
        this.router.navigate(['/dashboard/' + this.authService.getUserDataFromToken().id])
      }
    })
  }
}
