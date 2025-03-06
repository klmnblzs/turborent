import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CarsService } from '../../../../services/cars.service';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  private destroyRef = inject(DestroyRef)
  private carsService = inject(CarsService)
  private userService = inject(UserService)
  private authService = inject(AuthService)

  rentalHistory:any;

  getRentHistory() {
    const subscription = this.userService.getRentHistory(this.authService.getUserDataFromToken().id).subscribe({
      next: (res) => {
        this.rentalHistory=res
      }
    })
    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }

  ngOnInit(): void {
    this.getRentHistory()
  }
}
