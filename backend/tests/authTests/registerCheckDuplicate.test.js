const request = require('supertest');
const express = require('express');
const { registerCheckDuplicate } = require('../../controllers/authController'); // módosítsd a helyes elérési útvonalra!
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.post('/auth/check-duplicate', registerCheckDuplicate);

describe('POST /auth/check-duplicate', () => {
    it('should return 400 if email is missing', async () => {
        const res = await request(app).post('/auth/check-duplicate').send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Email is required');
    });

    it('should return 400 if email is already taken', async () => {
        const email = 'test@example.com';
        pool.execute.mockResolvedValueOnce([[{ id: 1, email }]]);
        
        const res = await request(app)
            .post('/auth/check-duplicate')
            .send({ email });
        
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Email is already taken');
    });

    it('should return 200 if email is available', async () => {
        const email = 'new@example.com';
        pool.execute.mockResolvedValueOnce([[]]);
        
        const res = await request(app)
            .post('/auth/check-duplicate')
            .send({ email });
        
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Email is available');
    });

    it('should return 500 if an internal error occurs', async () => {
        const email = 'error@example.com';
        pool.execute.mockRejectedValueOnce(new Error('Database error'));
        
        const res = await request(app)
            .post('/auth/check-duplicate')
            .send({ email });
        
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Internal server error');
    });
});
