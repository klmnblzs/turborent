const request = require('supertest');
const express = require('express');
const { pool } = require('../../utils/dbUtils');
const { denyRentingRequest } = require('../../controllers/adminController');
const { sendEmail }= require('../../utils/emailUtils');

jest.mock('../../utils/dbUtils');
jest.mock('../../utils/emailUtils');

const app = express();
app.use(express.json());
app.post('/admin/renting/approvals/deny', denyRentingRequest);

describe('POST /admin/renting/approvals/deny', () => {
    beforeEach(() => {
        sendEmail.mockClear();
    });

    it('should deny the request and send an email successfully', async () => {
        const mockResults = [[[{ customer_email: 'test@example.com' }]], []];
        pool.query.mockResolvedValue(mockResults);
        sendEmail.mockResolvedValue({ accepted: ['test@example.com'] });

        const response = await request(app)
            .post('/admin/renting/approvals/deny')
            .send({ rental_id: 1 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Request Denied" });
        expect(pool.query).toHaveBeenCalledWith('CALL DenyRentRequest(?)', [1]);
        expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'TurboRent - Bérlési visszaigazolás', 'renting-deny');
    });

    it('should return 400 if email sending fails', async () => {
        const mockResults = [[[{ customer_email: 'test@example.com' }]], []];
        pool.query.mockResolvedValue(mockResults);
        sendEmail.mockResolvedValue({ accepted: [] });

        const response = await request(app)
            .post('/admin/renting/approvals/deny')
            .send({ rental_id: 1 });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Deny request email sending failed" });
        expect(pool.query).toHaveBeenCalled();
        expect(sendEmail).toHaveBeenCalled();
    });

    it('should return 400 if deny request fails', async () => {
        pool.query.mockResolvedValue([[]]);

        const response = await request(app)
            .post('/admin/renting/approvals/deny')
            .send({ rental_id: 1 });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Deny failed" });
        expect(pool.query).toHaveBeenCalled();
        expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/admin/renting/approvals/deny')
            .send({ rental_id: 1 });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
        expect(pool.query).toHaveBeenCalled();
        expect(sendEmail).not.toHaveBeenCalled();
    });
});
