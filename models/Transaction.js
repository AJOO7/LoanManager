const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Date: { type: Date, required: true },
  Amount: { type: Number, required: true },
  Transaction_type: { type: String, required: true, enum: ['CREDIT', 'DEBIT'] },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
