const request = require('supertest');
const express = require('express');
const { denyRegistrationRequest } = require('../../controllers/adminController');
const { pool } = require('../../utils/dbUtils');
const { sendEmail } = require('../../utils/emailUtils');

jest.mock('../../utils/dbUtils');
jest.mock('../../utils/emailUtils');

const app = express();
app.use(express.json());
app.post('/admin/registration/approvals/deny', denyRegistrationRequest);

describe('POST /admin/registration/approvals/deny', () => {
  it('should return 200 and email sent message when email sending is successful', async () => {
    const customer = { email: 'test@example.com' };
    pool.query.mockResolvedValueOnce([[ [customer] ]]);
    sendEmail.mockResolvedValueOnce({ accepted: ['test@example.com'] });

    const res = await request(app)
      .post('/admin/registration/approvals/deny')
      .send({ customer_id: 1 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Deny request email sent");
  });

  it('should return 400 if email sending fails', async () => {
    const customer = { email: 'test@example.com' };
    pool.query.mockResolvedValueOnce([[ [customer] ]]);
    sendEmail.mockResolvedValueOnce({ accepted: [] });

    const res = await request(app)
      .post('/admin/registration/approvals/deny')
      .send({ customer_id: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Deny request email sending failed");
  });

  it('should return 500 if no deny is found (empty results)', async () => {
    pool.query.mockResolvedValueOnce([[[]]]);

    const res = await request(app)
      .post('/admin/registration/approvals/deny')
      .send({ customer_id: 1 });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal server error");
  });

  it('should return 500 if a database error occurs', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/admin/registration/approvals/deny')
      .send({ customer_id: 1 });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal server error");
  });
});