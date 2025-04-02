const request = require('supertest');
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const { register } = require('../../controllers/authController');
const { pool } = require('../../utils/dbUtils');
const { sendEmail } = require('../../utils/emailUtils');

jest.mock('../../utils/dbUtils');
jest.mock('bcrypt');
jest.mock('../../utils/emailUtils');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.fields([
  { name: 'licensePictureFront', maxCount: 1 },
  { name: 'licensePictureBack', maxCount: 1 }
]));
app.post('/auth/register', register);

describe('POST /auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.execute = jest.fn();
  });

  it('should return 400 if first_name is missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .field('last_name', 'Doe')
      .field('email', 'test@example.com')
      .field('password', 'securePassword');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('First name is required');
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .field('first_name', 'John')
      .field('last_name', 'Doe')
      .field('password', 'securePassword');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email is required');
  });

  it('should return 400 if phone_number is missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .field('first_name', 'John')
      .field('last_name', 'Doe')
      .field('email', 'test@example.com')
      .field('password', 'securePassword');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Phone number is required');
  });
  
  it('should return 200 if registration is successful', async () => {
    bcrypt.hash.mockResolvedValue('hashedPassword');
    
    pool.execute.mockResolvedValueOnce([[
        [{ insertId: 123 }], 
        { affectedRows: 1 }
    ]]);
    
    pool.execute.mockResolvedValueOnce([{ insertId: 123, affectedRows: 1 }]);
    
    pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    sendEmail.mockResolvedValue({ accepted: ['test@example.com'] });

    const res = await request(app)
        .post('/auth/register')
        .field('first_name', 'John')
        .field('last_name', 'Doe')
        .field('email', 'test@example.com')
        .field('phone_number', '123456789')
        .field('date_of_birth', '1990-01-01')
        .field('post_code', '1234')
        .field('city', 'TestCity')
        .field('street', 'TestStreet')
        .field('house_number', '1')
        .field('password', 'securePassword')
        .attach('licensePictureFront', Buffer.from('frontImage'), 'front.jpg')
        .attach('licensePictureBack', Buffer.from('backImage'), 'back.jpg');
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Register email sent');
});

  it('should return 500 if database insertion fails', async () => {
    bcrypt.hash.mockResolvedValue('hashedPassword');
    pool.execute.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/auth/register')
      .field('first_name', 'John')
      .field('last_name', 'Doe')
      .field('email', 'test@example.com')
      .field('phone_number', '123456789')
      .field('date_of_birth', '1990-01-01')
      .field('post_code', '1234')
      .field('city', 'TestCity')
      .field('street', 'TestStreet')
      .field('house_number', '1')
      .field('password', 'securePassword')
      .attach('licensePictureFront', Buffer.from('frontImage'), 'front.jpg')
      .attach('licensePictureBack', Buffer.from('backImage'), 'back.jpg');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error (első catch)');
  });
});