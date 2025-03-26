import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'carFilter',
  standalone: true
})
export class CarFilterPipe implements PipeTransform {
  transform(
    cars: any[],
    brand: string,
    category: string,
    order: string
  ): any[] {
    if (!cars || cars.length === 0) return [];

    let filtered = cars;

    if (brand) {
      filtered = filtered.filter(
        (car) => car.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    if (category) {
      filtered = filtered.filter(
        (car) => car.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (order === 'asc') {
      filtered = filtered.sort((a, b) => a.price_per_day - b.price_per_day);
    } else if (order === 'desc') {
      filtered = filtered.sort((a, b) => b.price_per_day - a.price_per_day);
    }

    return filtered;
  }
}
