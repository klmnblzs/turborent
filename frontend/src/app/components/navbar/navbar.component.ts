import { Component, computed, DestroyRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  imagePath = signal('turborent-nav.png')
  private router = inject(Router)
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef)

  placeholder:string = "";
  menuOpen:boolean = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  isNavbarVisible = true;
  lastScrollTop = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScrollTop > this.lastScrollTop) {
      this.isNavbarVisible = false;
    } else {
      this.isNavbarVisible = true;
    }

    // !! Nem mehet negatívba !!
    this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  }

  ngOnInit(): void {
    this.updatePlaceholder()

    const subscription = this.router.events.subscribe((e) => {
      if(e instanceof NavigationEnd) {
        this.updatePlaceholder()
      }
    })
    
    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }

  private updatePlaceholder(): void {
    const token = localStorage.getItem("token");

    if (token) {
      const userData = this.authService.getUserDataFromToken();
      this.placeholder = userData.firstname + " " + userData.lastname;
    } else {
      this.placeholder = "Bejelentkezés";
    }
  }

  onLogoClick() {
    this.router.navigate(["/cars"])
  }

  onClickDashboard() {
    if(localStorage.getItem("token")) {
      this.router.navigate(["/dashboard/" + this.authService.getUserDataFromToken().id  ])
    } else {
      this.router.navigate(["/login"])
    }
  }

  // @HostListener("window:scroll")
  // onScroll(event:any) {
  //   const vert = window.scrollY
  //   const shouldChangeNav = vert > 10;
  //   console.log(vert)
    
  //   if (shouldChangeNav !== this.changeNav) {
  //     this.changeNav = shouldChangeNav;
  //     this.imagePath.set(shouldChangeNav ? 'turborent-nav-black.png' : 'turborent-nav.png');
  //   }
  // }
}
