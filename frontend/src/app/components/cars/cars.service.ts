// import { computed, Injectable } from '@angular/core';
// import { carData } from './car/car.model';
// import { DUMMY_CARS } from './car/dummy-cars';

// @Injectable({
//   providedIn: 'root'
// })
// export class CarsService {
//   private cars = DUMMY_CARS

//   getCarList = computed(() => this.cars)

//   getBrandList = computed(() => 
//     this.cars.map(car => car.brand)
//       //brand -- az adott elem amin épp átmegy
//       //index -- az adott elem indexe
//       //self -- egy array, ami az osszes brand-et tartalmazza (Self: ["Toyota", "Honda", "Ford", "Toyota", "Chevrolet", "Honda"])
//       .filter((brand, index, self) => self.indexOf(brand) === index) // ha a jelenlegi elem indexe megegyezik az 'index' változóval, akkor duplikált elem
//   )
  
//   getTypeList = computed(() =>
//     this.cars.map(car => car.type)
//       .filter((type, index, self) => self.indexOf(type) === index)
//   )

//   getSelectedCarData(carId:string) {
//     return this.cars.find((car) => car.id === carId);
//   }
// }
