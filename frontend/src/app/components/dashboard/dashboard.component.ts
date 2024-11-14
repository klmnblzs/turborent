import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private router = inject(Router)
  private userService = inject(UserService)
  private destroyRef = inject(DestroyRef)
  private activatedRoute = inject(ActivatedRoute)
 
  userData:any = '';
  currentPage:string = 'data';

  // FORM SZERKESZTÉS

  dataForm = new FormGroup({
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    postcode: new FormControl(0),
    city: new FormControl(''),
    street: new FormControl(''),
    housenum: new FormControl('')
  })

  securityForm = new FormGroup({
    oldpassword: new FormControl(''),
    newpassword: new FormControl('')
  })

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      if(params.get("userid") != localStorage.getItem("userid")) {
        this.router.navigate(['/dashboard/' + localStorage.getItem("userid")])
      }
    })

    const subscription = this.userService.getUserData(localStorage.getItem("userid")!).subscribe({
      next: (res: any) => {
        this.userData=res

        this.dataForm.patchValue({
          firstname: res.first_name,
          lastname: res.last_name,
          postcode: res.post_code,
          city: res.city,
          street: res.street,
          housenum: res.house_number
        })
      }
    })

    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }


  logOut() {
    this.router.navigate(["/logout"])
  }
}
