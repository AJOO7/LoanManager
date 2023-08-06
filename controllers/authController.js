const User = require('../models/User');
const csv = require('csv-parser');
const fs = require('fs');
const async = require('async');

exports.registerUser = async (req, res) => {
  const { aadharId, name, email, annualIncome } = req.body;

  try {
    const existingUser = await User.findOne({ aadharId });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    const user = new User({
      aadharId,
      name,
      email,
      annualIncome
    });

    await user.save();

    calculateCreditScore(aadharId, user.id);

    return res.status(200).json({ unique_user_id: user.id });

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

function calculateCreditScore(aadharId, userId) {
  const transactions = [];
  let balance = 0;

  fs.createReadStream('./transactions.csv')
    .pipe(csv())
    .on('data', (row) => {
      if (row.AADHAR_ID === aadharId) {
        transactions.push(row);
      }
    })
    .on('end', () => {
      transactions.forEach((transaction) => {
        if (transaction.Transaction_type === 'CREDIT') {
          balance += Number(transaction.Amount);
        } else if (transaction.Transaction_type === 'DEBIT') {
          balance -= Number(transaction.Amount);
        }
      });

      let creditScore;
      if (balance >= 1000000) {
        creditScore = 900;
      } else if (balance <= 100000) {
        creditScore = 300;
      } else {
        creditScore = 300 + Math.floor((balance - 100000) / 15000) * 10;
      }

      User.findByIdAndUpdate(
        userId,
        { creditScore },
        { new: true, useFindAndModify: false },
        (err, user) => {
          if (err) {
            console.error(err);
          }
        }
      );
    });
}
