const request = require('supertest');
const express = require('express');
const { isCarAvailable } = require('../../controllers/carController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.post('/cars/is-available', isCarAvailable);

describe('POST /cars/is-available', () => {
    it("should return 200 if the car is available", async () => {
        pool.query.mockResolvedValue([[]]); // No reservations found

        const res = await request(app)
            .post('/cars/is-available')
            .send({
                car_id: 1,
                start_date: "2024-03-10",
                end_date: "2024-03-15"
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("The car is available");
    });

    it("should return 400 if the car is not available", async () => {
        pool.query.mockResolvedValue([[{ reservation_id: 1 }]]); // Mock an existing reservation

        const res = await request(app)
            .post('/cars/is-available')
            .send({
                car_id: 1,
                start_date: "2024-03-10",
                end_date: "2024-03-15"
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("The car isn't available");
    });

    it("should return 500 on internal server error", async () => {
        pool.query.mockRejectedValue(new Error("Database error"));

        const res = await request(app)
            .post('/cars/is-available')
            .send({
                car_id: 1,
                start_date: "2024-03-10",
                end_date: "2024-03-15"
            });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Internal server error.");
    });
});
