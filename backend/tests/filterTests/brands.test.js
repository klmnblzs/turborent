const request = require('supertest');
const express = require('express');
const { brands } = require('../../controllers/filterController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.get('/filter/brands', brands);

describe('GET /filter/brands', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all car brands', async () => {
        pool.query.mockResolvedValue([[[{ id: 1, name: 'Toyota' }, { id: 2, name: 'Ford' }]]]);

        const res = await request(app).get('/filter/brands');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 1, name: 'Toyota' }, { id: 2, name: 'Ford' }]);
        expect(pool.query).toHaveBeenCalledWith("CALL GetAllCarBrands");
    });

});
