const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const { login } = require('../../controllers/authController'); 
const { pool } = require('../../utils/dbUtils');
const { generateAccessToken,  } = require('../../utils/generateAccessToken');
const { generateRefreshToken } = require('../../utils/generateRefreshToken');

jest.mock('../../utils/dbUtils');
jest.mock('bcrypt');
jest.mock('../../utils/generateAccessToken');
jest.mock('../../utils/generateRefreshToken');

const app = express();
app.use(express.json());
app.post('/auth/login', login);

describe('POST /auth/login', () => {
    it('should return 400 if email is missing', async () => {
        const res = await request(app).post('/auth/login').send({ password: 'test123' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('A valid email is required');
    });

    it('should return 400 if password is missing', async () => {
        const res = await request(app).post('/auth/login').send({ email: 'test@example.com' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('A valid password is required');
    });

    it('should return 401 if the password is incorrect', async () => {
        pool.query.mockResolvedValueOnce([[{ password: 'hashedpassword' }]]);
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Wrong password');
    });

    it('should return 200 and tokens if login is successful', async () => {
        pool.query.mockResolvedValueOnce([[{ password: 'hashedpassword' }]]);
        bcrypt.compare.mockResolvedValue(true);
        pool.query.mockResolvedValueOnce([[[{ id: 1, first_name: 'John', last_name: 'Doe', email: 'test@example.com', phone_number: '123456789', date_of_birth: '1990-01-01', post_code: '1234', city: 'TestCity', street: 'TestStreet', house_number: '1', isAdmin: false, isApproved: true }]]]);
        generateAccessToken.mockReturnValue('mockAccessToken');
        generateRefreshToken.mockResolvedValue('mockRefreshToken');

        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'correctpassword' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBe('mockAccessToken');
        expect(res.body.refreshToken).toBe('mockRefreshToken');
        expect(res.body.userid).toBe(1);
    });

    it('should return 500 if an internal server error occurs', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'test123' });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Internal server error');
    });
});
