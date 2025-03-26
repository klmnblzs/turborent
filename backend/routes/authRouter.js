const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, registerCheckDuplicate } = require('../controllers/authController');

const multer = require('multer')

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/register', upload.fields([ { name:'licensePictureFront' }, { name: 'licensePictureBack' } ]), register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/check-duplicate', registerCheckDuplicate);

module.exports = router;