const request = require('supertest');
const express = require('express');
const { reset_password } = require('../../controllers/userController'); 
const { pool } = require('../../utils/dbUtils');
const bcrypt = require('bcrypt');

jest.mock('../../utils/dbUtils');

jest.mock('bcrypt');

const app = express();
app.use(express.json());
app.post('/user/reset-password', reset_password); 

describe('POST /user/reset-password', () => {
    const token = 'valid-token';
    const customerId = 1;
    const newPassword = 'newPassword123';
    const hashedPassword = 'hashedPassword123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should reset the password and return success message', async () => {
        bcrypt.hashSync.mockReturnValue(hashedPassword);

        pool.query
            .mockResolvedValueOnce([{ affectedRows: 1 }]) 
            .mockResolvedValueOnce([{ affectedRows: 1 }]); 

        const res = await request(app)
            .post('/user/reset-password')
            .send({ token, customer_id: customerId, password: newPassword });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: "Password reset!" });

        expect(pool.query).toHaveBeenCalledWith(
            'UPDATE customers SET password = ? WHERE id = ?',
            [hashedPassword, customerId]
        );

        expect(pool.query).toHaveBeenCalledWith('CALL DeleteResetToken(?)', [token]);
    });

    it('should return an error if password update fails', async () => {
        bcrypt.hashSync.mockReturnValue(hashedPassword);

        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app)
            .post('/user/reset-password')
            .send({ token, customer_id: customerId, password: newPassword });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: "Password update failed" });

        expect(pool.query).toHaveBeenCalledWith(
            'UPDATE customers SET password = ? WHERE id = ?',
            [hashedPassword, customerId]
        );
    });

    it('should handle internal server error', async () => {
        bcrypt.hashSync.mockReturnValue(hashedPassword);

        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const res = await request(app)
            .post('/user/reset-password')
            .send({ token, customer_id: customerId, password: newPassword });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Internal server error" });
    });
});
