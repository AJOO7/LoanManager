const csv = require('csv-parser');
const fs = require('fs');

exports.importTransactions = (aadharId, userId) => {
  return new Promise((resolve, reject) => {
    const transactions = [];
    let balance = 0;

    fs.createReadStream('./transactions.csv')
      .pipe(csv())
      .on('data', (row) => {
        if (row.AADHAR_ID === aadharId) {
          transactions.push({
            user: userId,
            Date: row.Date,
            Amount: Number(row.Amount),
            Transaction_type: row.Transaction_type
          });
        }
      })
      .on('end', () => {
        resolve(transactions);
      })
      .on('error', reject);
  });
};
