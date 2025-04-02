const request = require('supertest');
const express = require('express');
const { getCarById } = require('../../controllers/carController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.get('/cars/get/:id?', getCarById);

describe('GET /cars/get/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if car ID is missing', async () => {
        const res = await request(app).get('/cars/get');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Car ID is required' });
    });

    it('should return car data with a null image if no image found', async () => {
        const mockCarData = [[[{ car_picture_id: 1 }]]];
        const mockImageData = [[]];

        pool.query.mockResolvedValueOnce(mockCarData);
        pool.query.mockResolvedValueOnce(mockImageData);

        const res = await request(app).get('/cars/get/1');

        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { car_picture_id: 1, thumbnail: null }
        ]);
    });

    it('should return car data with a base64 encoded image if found', async () => {
        const mockCarData = [[[{ car_picture_id: 1 }]]];
        const mockImageData = [[{ thumbnail: Buffer.from('mockImageData') }]];

        pool.query.mockResolvedValueOnce(mockCarData);
        pool.query.mockResolvedValueOnce(mockImageData);

        const res = await request(app).get('/cars/get/1');

        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { car_picture_id: 1, thumbnail: 'data:image/jpeg;base64,bW9ja0ltYWdlRGF0YQ==' }
        ]);
    });
});
