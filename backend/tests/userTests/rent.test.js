const request = require('supertest');
const express = require('express');
const { rent } = require('../../controllers/userController');
const { pool } = require('../../utils/dbUtils');
const { sendEmail } = require('../../utils/emailUtils');

jest.mock('../../utils/dbUtils');

jest.mock('../../utils/emailUtils');

const app = express();
app.use(express.json());
app.post('/user/rent', rent);

describe('POST /user/rent', () => {
    const carId = 1;
    const customerId = 1;
    const rentFrom = '2023-01-01';
    const rentTo = '2023-01-10';
    const email = 'test@example.com';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and success message when rent request is successful', async () => {
        pool.query.mockResolvedValueOnce([[[{ email }]]]);
        sendEmail.mockResolvedValueOnce({ accepted: [email] });

        const res = await request(app)
            .post('/user/rent')
            .send({ 
                car_id: carId, 
                customer_id: customerId, 
                rent_from: rentFrom, 
                rent_to: rentTo 
            });

        expect(pool.query).toHaveBeenCalledWith(
            'CALL CreateRentApproval(?,?,?,?)',
            [carId, customerId, rentFrom, rentTo]
        );
        expect(sendEmail).toHaveBeenCalledWith(
            email,
            'TurboRent - Bérelési kérelem',
            'rent-reassure'
        );
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: "Renting email sent" });
    });

    it('should return 400 if email sending fails', async () => {
        pool.query.mockResolvedValueOnce([[[{ email }]]]);
        sendEmail.mockResolvedValueOnce({ accepted: [] });

        const res = await request(app)
            .post('/user/rent')
            .send({ 
                car_id: carId, 
                customer_id: customerId, 
                rent_from: rentFrom, 
                rent_to: rentTo 
            });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Renting email sending failed" });
    });

    it('should return 500 if request creation fails', async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .post('/user/rent')
            .send({ 
                car_id: carId, 
                customer_id: customerId, 
                rent_from: rentFrom, 
                rent_to: rentTo 
            });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Internal server error" });
    });

    it('should return 500 if there is a database error', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const res = await request(app)
            .post('/user/rent')
            .send({ 
                car_id: carId, 
                customer_id: customerId, 
                rent_from: rentFrom, 
                rent_to: rentTo 
            });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Internal server error" });
    });
});