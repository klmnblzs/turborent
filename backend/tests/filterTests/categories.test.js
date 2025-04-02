const request = require('supertest');
const express = require('express');
const { categories } = require('../../controllers/filterController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.get('/filter/categories', categories);

describe('GET /filter/categories', () => {
    it('should return all car categories', async () => {
        const mockCategories = [[[{ id: 1, name: 'SUV' }, { id: 2, name: 'Sedan' }]]];
    
        pool.query.mockResolvedValueOnce(mockCategories);
        
        const res = await request(app).get('/filter/categories');
        
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 1, name: 'SUV' }, { id: 2, name: 'Sedan' }]);
        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(pool.query).toHaveBeenCalledWith("CALL GetAllCarCategories");
    });
});
