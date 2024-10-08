import { Component, computed, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  // changeNav:boolean = false;
  imagePath = signal('turborent-nav.png')

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

// import { HostListener } from '@angular/core';

// @HostListener("window:scroll", []) onWindowScroll() {
//     // do some stuff here when the window is scrolled
//     const verticalOffset = window.pageYOffset 
//           || document.documentElement.scrollTop 
//           || document.body.scrollTop || 0;
// }
