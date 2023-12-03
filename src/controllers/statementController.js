const db = require("../database/connection");

const statementController = async (req, res, next) => {
  const customerId = req.params.customer_id;

  const allLoans = await db.loans.findAll({
    where: {
        customer_id: customerId
    }
  })

  const data = []

  allLoans.forEach(loan => {
    const {customer_id, interest_rate } = loan
    const amount_paid = loan.emis_paid_on_time * loan.monthly_payment
    const repayments_left = loan.tenure - loan.emis_paid_on_time
    data.push({
        loan_id: loan.id,
        customer_id,
        principal: loan.loan_amount,
        interest_rate,
        amount_paid,
        monthly_installment: loan.monthly_payment,
        repayments_left
    })
  })

  res.status(200).json({data})
};

module.exports = statementController;
