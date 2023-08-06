const User = require('../models/User');
const Loan = require('../models/Loan');

exports.applyLoan = async (req, res) => {
  const { unique_user_id, loan_type, loan_amount, interest_rate, term_period, disbursement_date } = req.body;

  try {
    const loanTypes = ['Car', 'Home', 'Education', 'Personal'];
    if (!loanTypes.includes(loan_type)) {
      return res.status(400).json({ error: 'Invalid loan type.' });
    }

    const maxAmounts = { 'Car': 750000, 'Home': 8500000, 'Education': 5000000, 'Personal': 1000000 };
    if (loan_amount > maxAmounts[loan_type]) {
      return res.status(400).json({ error: 'Loan amount exceeds the maximum limit for this type of loan.' });
    }

    const user = await User.findById(unique_user_id);
    if (!user) {
      return res.status(400).json({ error: 'User does not exist.' });
    }

    if (user.creditScore < 450) {
      return res.status(400).json({ error: 'User credit score is less than 450.' });
    }

    if (user.annualIncome < 150000) {
      return res.status(400).json({ error: 'User annual income is less than Rs. 1,50,000.' });
    }

    if (interest_rate < 14) {
      return res.status(400).json({ error: 'Interest rate must be >= 14%.' });
    }

    const emis = calculateEMIs(loan_amount, interest_rate, term_period, disbursement_date);

    const totalInterestEarned = emis.reduce((sum, emi) => sum + emi.interest, 0);
    if (totalInterestEarned <= 10000) {
      return res.status(400).json({ error: 'Total interest earned must be > 10000.' });
    }

    const monthlyIncome = user.annualIncome / 12;
    if (emis[0].amount_due > 0.6 * monthlyIncome) {
      return res.status(400).json({ error: 'EMI amount must be at-most 60% of the monthly income of the user.' });
    }

    const loan = new Loan({
      user: unique_user_id,
      loan_type,
      loan_amount,
      interest_rate,
      term_period,
      disbursement_date,
      status: 'Pending',
      emis
    });

    await loan.save();

    return res.status(200).json({ Loan_id: loan.id, Due_dates: emis });

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.makePayment = async (req, res) => {
  const { Loan_id, Amount } = req.body;

  try {
    const loan = await Loan.findById(Loan_id);
    if (!loan) {
      return res.status(400).json({ error: 'Loan does not exist.' });
    }

    const nextDueEMI = loan.emis.find(emi => !emi.paid);
    if (!nextDueEMI) {
      return res.status(400).json({ error: 'No EMIs are due.' });
    }

    if (nextDueEMI.paid) {
      return res.status(400).json({ error: 'This EMI is already paid.' });
    }

    const previousEMIsDue = loan.emis.some((emi, index, array) => {
      return !emi.paid && emi.Date < nextDueEMI.Date;
    });
    if (previousEMIsDue) {
      return res.status(400).json({ error: 'Previous EMIs are due.' });
    }

    if (Amount !== nextDueEMI.Amount_due) {
      recalculateEMIs(loan, nextDueEMI, Amount);
    } else {
      nextDueEMI.paid = true;
    }

    await loan.save();

    return res.status(200).json({});

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

function calculateEMIs(loan_amount, interest_rate, term_period, disbursement_date) {
  const emis = [];
  const principalPerMonth = loan_amount / term_period;
  const monthlyInterestRate = interest_rate / (12 * 100);

  for (let i = 0; i < term_period; i++) {
    const interestForTheMonth = (loan_amount - (i * principalPerMonth)) * monthlyInterestRate;
    const amountDue = principalPerMonth + interestForTheMonth;

    const dueDate = new Date(disbursement_date);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    dueDate.setDate(1);

    emis.push({ Date: dueDate, Amount_due: amountDue, Principal: principalPerMonth, Interest: interestForTheMonth, paid: false });
  }

  return emis;
}

function recalculateEMIs(loan, emi, amountPaid) {
  emi.paid = true;
  const remainingBalance = emi.Amount_due - amountPaid;
  const remainingEMIs = loan.emis.filter(e => e.Date > emi.Date && !e.paid);
  const extraPerEMI = remainingBalance / remainingEMIs.length;
  remainingEMIs.forEach(e => { e.Amount_due += extraPerEMI; });
}
