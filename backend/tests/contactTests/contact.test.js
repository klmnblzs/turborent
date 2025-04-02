const request = require('supertest');
const express = require('express');
const { contact } = require('../../controllers/contactController');
const { sendEmail } = require('../../utils/emailUtils');

jest.mock('../../utils/emailUtils');

const app = express();
app.use(express.json());
app.post('/contact', contact);

describe('POST /contact', () => {
    it('should return 200 if email is sent successfully', async () => {
        sendEmail.mockResolvedValue({ accepted: ['test@example.com'] });

        const res = await request(app)
            .post('/contact')
            .send({
                email: 'user@example.com',
                name: 'User',
                subject: 'Test Subject',
                message: 'Test Message'
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Contact email sent');
    });

    it('should return 400 if email sending fails', async () => {
        sendEmail.mockResolvedValue({ accepted: [] });

        const res = await request(app)
            .post('/contact')
            .send({
                email: 'user@example.com',
                name: 'User',
                subject: 'Test Subject',
                message: 'Test Message'
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Contact email sending failed');
    });

    it('should return 500 on internal server error', async () => {
        sendEmail.mockRejectedValue(new Error('Email service down'));

        const res = await request(app)
            .post('/contact')
            .send({
                email: 'user@example.com',
                name: 'User',
                subject: 'Test Subject',
                message: 'Test Message'
            });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Internal server error');
    });
});
