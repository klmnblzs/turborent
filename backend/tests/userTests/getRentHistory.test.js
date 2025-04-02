const request = require('supertest');
const express = require('express');
const { getRentHistory } = require('../../controllers/userController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.get('/user/rent-history/:id', getRentHistory);

describe('GET /user/rent-history/:id', () => {
    const userId = "1"; 

    const mockRentHistory = [
        { rent_id: 1, car_id: 101, rent_from: '2024-03-01', rent_to: '2024-03-10' },
        { rent_id: 2, car_id: 102, rent_from: '2024-02-15', rent_to: '2024-02-20' }
    ];

    it('should return rent history for a valid user ID', async () => {
        pool.execute.mockResolvedValueOnce([[mockRentHistory]]);

        const response = await request(app)
            .get(`/user/rent-history/${userId}`)
            .expect(200);

        expect(response.body).toEqual(mockRentHistory);
        expect(pool.execute).toHaveBeenCalledWith('CALL GetRentHistory(?)', [userId]);
    });

    it('should return an empty array if user has no rent history', async () => {
        pool.execute.mockResolvedValueOnce([[[]]]);

        const response = await request(app)
            .get(`/user/rent-history/${userId}`)
            .expect(200);

        expect(response.body).toEqual([]);
    });

    it('should return a server error on database failure', async () => {
        pool.execute.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .get(`/user/rent-history/${userId}`)
            .expect(500);

        expect(response.body).toEqual({ message: "Internal server error" });
    });
});
