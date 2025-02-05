const express = require('express');
const router = express.Router();
const { brands, categories } = require('../controllers/filterController');

router.get('/brands', brands);
router.get('/categories', categories);

module.exports = router;