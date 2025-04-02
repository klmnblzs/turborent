const request = require('supertest');
const express = require('express');
const { deleteCar } = require('../../controllers/adminController');
const { pool } = require('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.post('/admin/car/delete', deleteCar);

describe('POST /admin/car/delete', () => {
  beforeEach(() => {
    pool.execute = jest.fn();
  });

  it('should return 400 if car ID is missing', async () => {
    const res = await request(app)
      .post('/admin/car/delete')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Car ID is required" });
  });

  it('should return 200 and success message when car is deleted successfully', async () => {
    pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/admin/car/delete')
      .send({ id: 123 });

    expect(pool.execute).toHaveBeenCalledWith("CALL DeleteCar(?)", [123]);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Car deleted!" });
  });

  it('should return 500 if there is an error deleting the car', async () => {
    pool.execute.mockResolvedValueOnce([]); 

    const res = await request(app)
      .post('/admin/car/delete')
      .send({ id: 123 });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Error while deleting car" });
});

  it('should return 500 if there is a database error', async () => {
    pool.execute.mockRejectedValueOnce(new Error('Database error'));

    const res = await request(app)
      .post('/admin/car/delete')
      .send({ id: 123 });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal server error" });
  });
});