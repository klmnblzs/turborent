const request = require('supertest');
const express = require('express');
const { listRegistrationApprovals } = require('../../controllers/adminController');
const { pool } = require('../../utils/dbUtils');

pool.query = jest.fn();

const app = express();
app.use(express.json());
app.get('/admin/registration/approvals', listRegistrationApprovals);

describe('GET /admin/registration/approvals', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return a list of registration approvals', async () => {
        const mockResults = [[{ id: 1, name: 'John Doe', email: 'john@example.com' }]];
        pool.query.mockResolvedValueOnce([mockResults]);

        const res = await request(app).get('/admin/registration/approvals');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 1, name: 'John Doe', email: 'john@example.com' }]);
    });

});
