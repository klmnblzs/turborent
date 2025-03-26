import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { SnackbarService } from './snackbar.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss',
  animations: [
    trigger('state', [
      transition(':enter', [
        style({
          bottom: '-100px',
          // transform: 'translate(-50%, 0%) scale(0.3)',
        }),
        animate(
          '150ms cubic-bezier(0, 0, 0.2, 1)',
          style({
            // transform: 'translate(-50%, 0%) scale(1)',
            transform: 'scale(1)',
            opacity: 1,
            bottom: '20px',
          })
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms cubic-bezier(0.4, 0.0, 1, 1)',
          style({
            // transform: 'translate(-50%, 0%) scale(0.3)',
            transform: 'scale(0.3)',
            opacity: 0,
            bottom: '-100px',
          })
        ),
      ]),
    ]),
  ],
})
export class SnackbarComponent implements OnInit {
  show = false;
  message: string = 'This is snackbar';
  type: string = 'success';
  snackbarService = inject(SnackbarService)
  destroyRef = inject(DestroyRef)

  ngOnInit(): void {
    const subscription = this.snackbarService.snackbarState.subscribe(
      (state) => {
        if (state.type) {
          this.type = state.type;
        } else {
          this.type = 'success';
        }
        this.message = state.message;
        this.show = state.show;
        setTimeout(() => {
          this.show = false;
        }, 3000);
      }
    );

    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }


}
