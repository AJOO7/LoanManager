const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  aadharId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  annualIncome: { type: Number, required: true },
  creditScore: { type: Number, default: 300 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
