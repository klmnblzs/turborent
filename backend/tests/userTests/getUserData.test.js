const request = require('supertest');
const express = require('express');
const { getUserData } = require('../../controllers/userController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.get('/user/data/:id', getUserData);

describe('GET /user/data/:id', () => {
    const userId = "1";
    const mockUserData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return user data when user exists', async () => {
        pool.execute.mockResolvedValueOnce([[[mockUserData]]]);

        const response = await request(app)
            .get(`/user/data/${userId}`) 
            .set('Authorization', 'Bearer faketoken') 
            .expect(200);

        expect(response.body).toEqual(mockUserData);
        expect(pool.execute).toHaveBeenCalledWith('CALL GetCustomerById(?)', [userId]);
    });

    it('should return 500 status code when database query fails', async () => {
        pool.execute.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .get(`/user/data/${userId}`)
            .set('Authorization', 'Bearer faketoken')
            .expect(500);

        expect(response.body).toEqual({ message: 'Internal server error' });
    });
});
