const request = require('supertest');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');

const { addCar } = require('../../controllers/adminController');
const { pool } = require('../../utils/dbUtils');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const storage = multer.memoryStorage();
const upload = multer({ storage });


app.post('/admin/car/add', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), addCar);

describe('POST /admin/car/add', () => {
  beforeEach(() => {
    
    pool.execute = jest.fn();
  });

  it('should return 400 if a required field is missing', async () => {
    const carData = {
      model: 'Model S',
      cc: 2000,
      year: 2020,
      licensePlate: 'ABC123',
      category: 'Sedan',
      available: true,
      pricePerDay: 100,
      mileage: 10000,
      isDiesel: false,
      lastServiceDate: '2023-01-01',
      seats: 5,
      doors: 4,
      isManual: false,
      description: 'Great car',
      equipments: 'Air conditioning, GPS'
    };

    const res = await request(app)
      .post('/admin/car/add')
      .field('model', carData.model)
      .field('cc', carData.cc)
      .field('year', carData.year)
      .field('licensePlate', carData.licensePlate)
      .field('category', carData.category)
      .field('available', carData.available)
      .field('pricePerDay', carData.pricePerDay)
      .field('mileage', carData.mileage)
      .field('isDiesel', carData.isDiesel)
      .field('lastServiceDate', carData.lastServiceDate)
      .field('seats', carData.seats)
      .field('doors', carData.doors)
      .field('isManual', carData.isManual)
      .field('description', carData.description)
      .field('equipments', carData.equipments)

      .attach('thumbnail', Buffer.from('fake image content'), 'thumbnail.png');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Brand is required' });
  });

  it('should successfully add a car and return 200 with success message', async () => {
    const carData = {
      brand: 'Tesla',
      model: 'Model S',
      cc: 2000,
      year: 2020,
      licensePlate: 'ABC123',
      category: 'Sedan',
      available: true,
      pricePerDay: 100,
      mileage: 10000,
      isDiesel: false,
      lastServiceDate: '2023-01-01',
      seats: 5,
      doors: 4,
      isManual: false,
      description: 'Great car',
      equipments: 'Air conditioning, GPS'
    };

   
    pool.execute
      .mockResolvedValueOnce([{ affectedRows: 1, insertId: 123 }])
      .mockResolvedValueOnce([[[{ "LAST_INSERT_ID()": 456 }]]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/admin/car/add')
      .field('brand', carData.brand)
      .field('model', carData.model)
      .field('cc', carData.cc)
      .field('year', carData.year)
      .field('licensePlate', carData.licensePlate)
      .field('category', carData.category)
      .field('available', carData.available)
      .field('pricePerDay', carData.pricePerDay)
      .field('mileage', carData.mileage)
      .field('isDiesel', carData.isDiesel)
      .field('lastServiceDate', carData.lastServiceDate)
      .field('seats', carData.seats)
      .field('doors', carData.doors)
      .field('isManual', carData.isManual)
      .field('description', carData.description)
      .field('equipments', carData.equipments)
      .attach('thumbnail', Buffer.from('fake image content'), 'thumbnail.png');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Success!" });
  });

  it('should return 500 if car_data insertion fails', async () => {
    const carData = {
      brand: 'Tesla',
      model: 'Model S',
      cc: 2000,
      year: 2020,
      licensePlate: 'ABC123',
      category: 'Sedan',
      available: true,
      pricePerDay: 100,
      mileage: 10000,
      isDiesel: false,
      lastServiceDate: '2023-01-01',
      seats: 5,
      doors: 4,
      isManual: false,
      description: 'Great car',
      equipments: 'Air conditioning, GPS'
    };

    pool.execute
      .mockResolvedValueOnce([{ affectedRows: 1, insertId: 123 }])
      .mockResolvedValueOnce([[[{ "LAST_INSERT_ID()": 456 }]]])
      .mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app)
      .post('/admin/car/add')
      .field('brand', carData.brand)
      .field('model', carData.model)
      .field('cc', carData.cc)
      .field('year', carData.year)
      .field('licensePlate', carData.licensePlate)
      .field('category', carData.category)
      .field('available', carData.available)
      .field('pricePerDay', carData.pricePerDay)
      .field('mileage', carData.mileage)
      .field('isDiesel', carData.isDiesel)
      .field('lastServiceDate', carData.lastServiceDate)
      .field('seats', carData.seats)
      .field('doors', carData.doors)
      .field('isManual', carData.isManual)
      .field('description', carData.description)
      .field('equipments', carData.equipments)
      .attach('thumbnail', Buffer.from('fake image content'), 'thumbnail.png');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Error!" });
  });
});
