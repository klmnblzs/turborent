const request = require('supertest');
const express = require('express');
const { pool } = require('../../utils/dbUtils'); 
const { listRentingApprovalById } = require('../../controllers/adminController'); 

const app = express();
app.get('/admin/renting/approvals/:id', listRentingApprovalById);

app.use(express.json());

describe('GET /admin/renting/approvals/:id', () => {
    beforeEach(() => {
        pool.query = jest.fn();
      });

      it('should return rental approval data if found', async () => {
        const mockData = [[{ id: 1, approval_status: 'approved' }]]; 
        pool.query.mockResolvedValue(mockData);
    
        const response = await request(app).get('/admin/renting/approvals/1');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData[0][0]); 
    });

    it('should return 400 if no approval data is found', async () => {
        pool.query.mockResolvedValue([[]]);

        const response = await request(app).get('/admin/renting/approvals/1');
        
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Error while fetching approval" });
    });

    it('should return 500 on database error', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/admin/renting/approvals/1');
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });
});
