const request = require('supertest');
const express = require('express');
const { editUserData } = require('../../controllers/userController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.post('/user/edit', editUserData); 

describe('POST /user/edit', () => { 
    const userData = {
        firstname: 'John',
        lastname: 'Doe',
        postcode: '1234',
        city: 'Budapest',
        street: 'Main Street',
        housenum: '10',
        id: 1
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update user data successfully', async () => {
        pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .post('/user/edit') 
            .send(userData);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Customer data updated');
        expect(pool.execute).toHaveBeenCalledWith(
            'CALL UpdateCustomerPersonalData(?,?,?,?,?,?,?)',
            [userData.firstname, userData.lastname, userData.postcode, userData.city, userData.street, userData.housenum, userData.id]
        );
    });

    it('should return 500 on database failure', async () => {
        pool.execute.mockRejectedValueOnce(new Error('Database error'));

        const res = await request(app)
            .post('/user/edit') 
            .send(userData);

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Internal server error');
    });
});