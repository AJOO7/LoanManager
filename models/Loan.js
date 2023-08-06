const mongoose = require('mongoose');

const EMISchema = new mongoose.Schema({
  Date: { type: Date, required: true },
  Amount_due: { type: Number, required: true },
  Principal: { type: Number, required: true },
  Interest: { type: Number, required: true },
  paid: { type: Boolean, default: false }
});

const LoanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loan_type: { type: String, required: true },
  loan_amount: { type: Number, required: true },
  interest_rate: { type: Number, required: true },
  term_period: { type: Number, required: true },
  disbursement_date: { type: Date, required: true },
  status: { type: String, required: true, enum: ['Pending', 'Approved', 'Rejected', 'Paid'], default: 'Pending' },
  emis: [EMISchema]
}, { timestamps: true });

module.exports = mongoose.model('Loan', LoanSchema);
