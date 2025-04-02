const request = require('supertest');
const express = require('express');
const { approveRegistrationRequest } = require('../../controllers/adminController');
const { pool } = require('../../utils/dbUtils');
const { sendEmail } = require('../../utils/emailUtils');

jest.mock('../../utils/emailUtils');
jest.mock('../../utils/dbUtils');

const app = express();
app.use(express.json());
app.post('/admin/registration/approvals/approve', approveRegistrationRequest);

describe('POST /admin/registration/approvals/approve', () => {
  it('should return 200 and success message if email is sent', async () => {
    const customer = { email: 'test@example.com' };
    pool.query.mockResolvedValueOnce([ [ [customer] ] ]);
    sendEmail.mockResolvedValueOnce({ accepted: ['test@example.com'] });

    const res = await request(app)
      .post('/admin/registration/approvals/approve')
      .send({ customer_id: 1, admin_id: 10 });

    expect(pool.query).toHaveBeenCalledWith('CALL ApproveRequest(?, ?)', [1, 10]);
    expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'TurboRent - Reigsztráció visszaigazolás', 'registration-approve');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Approve request email sent" });
  });

  it('should return 400 if email sending fails', async () => {
    const customer = { email: 'test@example.com' };
    pool.query.mockResolvedValueOnce([ [ [customer] ] ]);
    sendEmail.mockResolvedValueOnce({ accepted: [] });

    const res = await request(app)
      .post('/admin/registration/approvals/approve')
      .send({ customer_id: 1, admin_id: 10 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Approve request email sending failed" });
  });


  it('should return 500 if a database error occurs', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/admin/registration/approvals/approve')
      .send({ customer_id: 1, admin_id: 10 });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Internal server error" });
  });
});
