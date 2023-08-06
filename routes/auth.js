const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.post('/register-user', authController.registerUser);

module.exports = router;
