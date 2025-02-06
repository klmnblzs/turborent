import { Component, DestroyRef, EventEmitter, inject, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private router = inject(Router)
  private authService = inject(AuthService)
  private activatedRoute = inject(ActivatedRoute)

  userData = this.authService.getUserDataFromToken()
  currentPage:string = 'data';

  logOut() {
    this.authService.logOut()
  }

  navigateMenu(whereTo:string) {
    this.router.navigate(["/dashboard/" + this.authService.getUserDataFromToken().id + "/" + whereTo], {
      relativeTo: this.activatedRoute
    })
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      if(params.get("page")) {
        this.currentPage = params.get("page")!;
      }
    })
  }
}
