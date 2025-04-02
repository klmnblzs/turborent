const request = require('supertest');
const express = require('express');
const { pool }= require('../../utils/dbUtils');
const { approveRentingRequest } = require('../../controllers/adminController');
const  { sendEmail } = require('../../utils/emailUtils');

jest.mock('../../utils/dbUtils');
jest.mock('../../utils/emailUtils');

const app = express();
app.use(express.json());
app.post('/admin/renting/approvals/approve', approveRentingRequest);

describe('POST /admin/renting/approvals/approve', () => {
    beforeEach(() => {
        sendEmail.mockClear();
    });

    it('should approve the request and send an email successfully', async () => {
        const mockResults = [[[{ customer_email: 'test@example.com' }]], []];
        pool.query.mockResolvedValue(mockResults);
        sendEmail.mockResolvedValue({ accepted: ['test@example.com'] });

        const response = await request(app)
            .post('/admin/renting/approvals/approve')
            .send({ rental_id: 1, admin_id: 123 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Request Approved" });
        expect(pool.query).toHaveBeenCalledWith('CALL ApproveRentRequest(?, ?)', [1, 123]);
        expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'TurboRent - Bérlési visszaigazolás', 'renting-approve');
    });

    it('should return 400 if email sending fails', async () => {
        const mockResults = [[[{ customer_email: 'test@example.com' }]], []];
        pool.query.mockResolvedValue(mockResults);
        sendEmail.mockResolvedValue({ accepted: [] });

        const response = await request(app)
            .post('/admin/renting/approvals/approve')
            .send({ rental_id: 1, admin_id: 123 });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Approve request email sending failed" });
        expect(pool.query).toHaveBeenCalled();
        expect(sendEmail).toHaveBeenCalled();
    });

    it('should return 400 if approval fails', async () => {
        pool.query.mockResolvedValue([[]]);

        const response = await request(app)
            .post('/admin/renting/approvals/approve')
            .send({ rental_id: 1, admin_id: 123 });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Approve failed" });
        expect(pool.query).toHaveBeenCalled();
        expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/admin/renting/approvals/approve')
            .send({ rental_id: 1, admin_id: 123 });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
        expect(pool.query).toHaveBeenCalled();
        expect(sendEmail).not.toHaveBeenCalled();
    });
});
