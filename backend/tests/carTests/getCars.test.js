const request = require('supertest');
const express = require('express');
const { getCars } = require('../../controllers/carController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.get('/cars/get', getCars);

describe('GET /cars/get', () => {
    it('should return 200 and a list of cars when no ID is provided', async () => {
        const mockCars = [{ car_picture_id: 1 }, { car_picture_id: 2 }];
        const mockImages = [{ thumbnail: Buffer.from('mockimage') }];

        pool.query.mockResolvedValueOnce([[mockCars]]) 
                  .mockResolvedValueOnce([[{ thumbnail: Buffer.from(mockImages) }]])
                  .mockResolvedValueOnce([[{ thumbnail: Buffer.from(mockImages) }]]);

        const res = await request(app).get('/cars/get');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    thumbnail: expect.stringMatching(/^data:image\/jpeg;base64,/)
                })
            ])
        );
    });

    it('should return 200 and a specific car when ID is provided', async () => {
        const mockCars = [{ car_picture_id: 1 }];
        const mockImages = [{ thumbnail: Buffer.from('mockimage') }];

        pool.query.mockResolvedValueOnce([[mockCars]])
                  .mockResolvedValueOnce([[{ thumbnail: Buffer.from(mockImages) }]]);

        const res = await request(app).get('/cars/get').set('id', '123');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    thumbnail: expect.stringMatching(/^data:image\/jpeg;base64,/)
                })
            ])
        );
    });

    it('should return 500 on database error', async () => {
        pool.query.mockRejectedValue(new Error('cars is not iterable'));

        const res = await request(app).get('/cars/get');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'cars is not iterable' });
    });
});
