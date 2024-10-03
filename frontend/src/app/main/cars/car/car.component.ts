import { Component, inject, input } from '@angular/core';
import { carData } from './car.model';
import { CarsService } from '../cars.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-car',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './car.component.html',
  styleUrl: './car.component.scss'
})
export class CarComponent {
  carsService = inject(CarsService);
  car = input.required<carData>();
}
