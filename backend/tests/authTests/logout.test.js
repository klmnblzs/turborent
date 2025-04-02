const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const { logout } = require('../../controllers/authController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.post('/auth/logout', logout);

describe('POST /auth/logout', () => {
    it('should return 400 if refresh token is missing', async () => {
        const res = await request(app)
            .post('/auth/logout')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Refresh Token is required');
    });

    it('should return 404 if refresh token is not found in the database', async () => {
        pool.execute.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .post('/auth/logout')
            .set('Cookie', 'refreshToken=non_existing_token');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Refresh token was not found in the database');
    });

    it('should return 200 if the token is successfully deleted', async () => {
        pool.execute.mockResolvedValueOnce([[{ token: 'existing_token' }]]);
        pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .post('/auth/logout')
            .set('Cookie', 'refreshToken=existing_token');

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Logged out!');
    });

    it('should return 500 if token deletion fails', async () => {
        pool.execute.mockResolvedValueOnce([[{ token: 'existing_token' }]]);
        pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app)
            .post('/auth/logout')
            .set('Cookie', 'refreshToken=existing_token');

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Token couldn't be deleted");
    });

    it('should return 500 if an error occurs during the process', async () => {
        pool.execute.mockRejectedValueOnce(new Error('Database error'));

        const res = await request(app)
            .post('/auth/logout')
            .set('Cookie', 'refreshToken=any_token');

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error while logging out.');
    });
});
