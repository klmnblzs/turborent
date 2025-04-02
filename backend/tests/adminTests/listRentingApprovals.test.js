const request = require('supertest');
const express = require('express');
const { listRentingApprovals } = require('../../controllers/adminController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());

app.get('/admin/renting/approvals', (req, res, next) => {
  listRentingApprovals(req, res).catch(next);
});

describe('GET /admin/renting/approvals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return json array of renting approvals with a 200 status code', async () => {
    const approvals = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }];
    pool.query.mockResolvedValueOnce([[approvals]]);

    const res = await request(app).get('/admin/renting/approvals');

    expect(pool.query).toHaveBeenCalledWith('CALL ListRentApprovals()');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(approvals);
  });
});
