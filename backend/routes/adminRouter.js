const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authenticateToken');
const { deleteCar, addCar, listRegistrationApprovals, listRegistrationApprovalById, approveRegistrationRequest, denyRegistrationRequest, listRentingApprovals, listRentingApprovalById, approveRentingRequest, denyRentingRequest } = require('../controllers/adminController');

const multer = require('multer')

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/car/delete', authenticateToken, deleteCar)
router.post('/car/add', authenticateToken, upload.fields([ { name: 'thumbnail' } ]), addCar)

router.post('/registration/approvals/approve', authenticateToken, approveRegistrationRequest)
router.post('/registration/approvals/deny', authenticateToken, denyRegistrationRequest)

router.post('/renting/approvals/approve', authenticateToken, approveRentingRequest)
router.post('/renting/approvals/deny', authenticateToken, denyRentingRequest)

router.get('/registration/approvals', authenticateToken, listRegistrationApprovals)
router.get('/registration/approvals/:id', authenticateToken, listRegistrationApprovalById)

router.get('/renting/approvals', authenticateToken, listRentingApprovals)
router.get('/renting/approvals/:id', authenticateToken, listRentingApprovalById)



module.exports = router