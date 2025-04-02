const request = require('supertest');
const express = require('express');
const { request_reset_password } = require('../../controllers/userController');
const { pool } = require('../../utils/dbUtils');
const { sendEmail } = require('../../utils/emailUtils');

jest.mock('../../utils/dbUtils');

jest.mock('../../utils/emailUtils');

const app = express();
app.use(express.json());
app.post('/user/request-reset-password', request_reset_password);

describe('POST /user/request-reset-password', () => {
    const email = 'test@example.com';
    const userId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and send reset password email if user exists', async () => {
        pool.query.mockResolvedValueOnce([[{ id: userId }]]);
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        sendEmail.mockResolvedValueOnce({ accepted: [email] });

        const res = await request(app)
            .post('/user/request-reset-password')
            .send({ email });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Reset password email sent');
        expect(pool.query).toHaveBeenCalledWith('SELECT id FROM customers WHERE email = ?', [email]);
        expect(pool.query).toHaveBeenCalledWith(
            'CALL SaveResetToken(?, ?, ?)',
            expect.arrayContaining([
                userId,
                expect.any(String),
                expect.any(Date),
            ])
        );
        expect(sendEmail).toHaveBeenCalledWith(
            email,
            'TurboRent - Jelszó visszaállítása',
            'reset-password',
            expect.objectContaining({
                reset_link: expect.stringContaining('http://localhost:4200/reset-password?token='),
            })
        );
    });

    it('should return 401 if user does not exist', async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .post('/user/request-reset-password')
            .send({ email });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('User not found');
    });

    it('should return 500 if there is a server error', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const res = await request(app)
            .post('/user/request-reset-password')
            .send({ email });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Internal server error');
    });

    it('should return 400 if email sending fails', async () => {
        pool.query.mockResolvedValueOnce([[{ id: userId }]]);
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        sendEmail.mockResolvedValueOnce({ accepted: [] });

        const res = await request(app)
            .post('/user/request-reset-password')
            .send({ email });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Reset password email sending failed');
    });
});
