const express = require('express');
const router = express.Router();
const { getCars, getCarById, isCarAvailable } = require('../controllers/carController');

router.get('/get', getCars)
router.get('/get/:id', getCarById)
router.post('/is-available', isCarAvailable)

module.exports = router