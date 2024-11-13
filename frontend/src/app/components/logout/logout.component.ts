import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent {
  authService = inject(AuthService)
  router = inject(Router)

  ngOnInit(): void {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.log("No refresh token");
      this.router.navigate(["/login"]);
      return;
    }

    this.authService.logoutUser({ refreshToken }).subscribe({
      next: (res) => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        
        this.router.navigate(["/cars"]);
      },
      error: (err) => {
        console.error("Error while logging out: " + err);
      }
    });
  }
}
