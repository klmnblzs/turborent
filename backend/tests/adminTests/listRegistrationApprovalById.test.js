const request = require('supertest');
const express = require('express');
const { listRegistrationApprovalById } = require('../../controllers/adminController');
const { pool } = require('../../utils/dbUtils');

jest.mock('../../utils/dbUtils');

const app = express();
app.get('/admin/registration/approvals/:id', listRegistrationApprovalById);

describe('GET /admin/registration/approvals/:id', () => {
  it('should return approval data with base64 encoded images', async () => {
    const approvalData = [{
      id: 1,
      name: 'John Doe',
      picture_set_id: 101
    }];
    const imageData = [{
      picture_front: Buffer.from('frontimage'),
      picture_back: Buffer.from('backimage')
    }];
    pool.query
      .mockResolvedValueOnce([ [approvalData] ])
      .mockResolvedValueOnce([ imageData ]);

    const res = await request(app).get('/admin/registration/approvals/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{
      id: 1,
      name: 'John Doe',
      picture_set_id: 101,
      picture_front: `data:image/jpeg;base64,${Buffer.from('frontimage').toString('base64')}`,
      picture_back: `data:image/jpeg;base64,${Buffer.from('backimage').toString('base64')}`
    }]);
  });

  it('should return 400 if no approval is found', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    
    const res = await request(app).get('/admin/registration/approvals/999');
    
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Error while fetching approval" });
  });

  it('should return 500 if a database error occurs', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/admin/registration/approvals/1');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Internal server error" });
  });
});
