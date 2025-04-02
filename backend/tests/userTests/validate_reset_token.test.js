const request = require('supertest');
const express = require('express');
const { validate_reset_token } = require('../../controllers/userController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.get('/user/validate-reset-token', validate_reset_token);

describe('GET /user/validate-reset-token', () => {
    const validToken = 'valid-token';
    const invalidToken = 'invalid-token';
    const expiredToken = 'expired-token';
    const customerId = 1;

    const mockValidTokenResponse = [{ reset_token_id: 1, token_customer_id: customerId }];
    const mockExpiredTokenResponse = [{ reset_token_id: null, token_customer_id: null }];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and token details if token is valid', async () => {
        pool.query.mockResolvedValueOnce([[mockValidTokenResponse]]);

        const res = await request(app)
            .get('/user/validate-reset-token')
            .query({ token: validToken });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ token_id: 1, customer_id: customerId });
        expect(pool.query).toHaveBeenCalledWith('CALL ValidateResetToken(?)', [validToken]);
    });

    it('should return 401 if token is invalid', async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .get('/user/validate-reset-token')
            .query({ token: invalidToken });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: 'Token invalid' });
        expect(pool.query).toHaveBeenCalledWith('CALL ValidateResetToken(?)', [invalidToken]);
    });

    it('should return 400 if token is expired', async () => {
        pool.query.mockResolvedValueOnce([[mockExpiredTokenResponse]]);

        const res = await request(app)
            .get('/user/validate-reset-token')
            .query({ token: expiredToken });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid or expired token.' });
        expect(pool.query).toHaveBeenCalledWith('CALL ValidateResetToken(?)', [expiredToken]);
    });

    it('should return 500 if there is a server error', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const res = await request(app)
            .get('/user/validate-reset-token')
            .query({ token: validToken });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: 'Internal server error' });
        expect(pool.query).toHaveBeenCalledWith('CALL ValidateResetToken(?)', [validToken]);
    });
});
