const request = require('supertest');
const express = require('express');
const { editUserPassword } = require('../../controllers/userController');
const { pool } = require('../../utils/dbUtils');
const bcrypt = require('bcrypt');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.post('/user/edit/password', editUserPassword);

describe('POST /user/edit/password', () => {
    const userId = 1;
    const oldPassword = 'oldpassword123';
    const newPassword = 'newpassword456';
    const hashedOldPassword = bcrypt.hashSync(oldPassword, 10);

    it('should update password successfully when old password is correct', async () => {
        pool.query.mockResolvedValueOnce([[{ password: hashedOldPassword }]]);
        pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .post('/user/edit/password')
            .send({ id: userId, oldpassword: oldPassword, newpassword: newPassword });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Password updated!');
        expect(pool.execute).toHaveBeenCalledWith(
            'CALL UpdateCustomerPassword(?,?,?)',
            [userId, expect.any(String), expect.any(String)]
        );
    });

    it('should return error if old password is incorrect', async () => {
        pool.query.mockResolvedValueOnce([[{ password: hashedOldPassword }]]);

        const res = await request(app)
            .post('/user/edit/password')
            .send({ id: userId, oldpassword: 'wrongpassword', newpassword: newPassword });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Password invalid');
    });

    it('should return server error on database failure', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const res = await request(app)
            .post('/user/edit/password')
            .send({ id: userId, oldpassword: oldPassword, newpassword: newPassword });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Internal server error');
    });
});
