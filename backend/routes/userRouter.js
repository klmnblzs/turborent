const express = require('express');
const router = express.Router();
const { request_reset_password, reset_password, validate_reset_token, rent, getUserData, getRentHistory, editUserData, editUserPassword } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authenticateToken');

router.post('/request-reset-password', request_reset_password);
router.post('/reset-password', reset_password);
router.get('/validate-reset-token', validate_reset_token);
router.post('/rent', authenticateToken, rent);

router.get('/data/:id', getUserData)
router.get('/rent-history/:id', getRentHistory)
router.post('/edit', authenticateToken, editUserData)
router.post('/edit/password', authenticateToken, editUserPassword)

module.exports = router;