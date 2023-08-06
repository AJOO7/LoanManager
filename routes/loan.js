const express = require('express');
const router = express.Router();

const loanController = require('../controllers/loanController');

router.post('/apply-loan', loanController.applyLoan);
router.post('/make-payment', loanController.makePayment);

module.exports = router;
