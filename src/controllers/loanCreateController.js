const db = require("../database/connection");
const eligibilityController = require("./eligibilityController");

const loanCreateController = async (req, res, next) => {
  const {
    customer_id,
    loan_amount,
    interest_rate,
    tenure,
    start_date,
    end_date,
  } = req.body;

  const eligibilityResult = await new Promise((resolve, reject) => {
    const eligibilityRes = {
      status: (statusCode) => ({
        json: (response) => {
          if (statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error(`Request failed with status code ${statusCode}`));
          }
        },
      }),
    };

    eligibilityController(
      { body: { customer_id, loan_amount, interest_rate, tenure } },
      eligibilityRes,
      next
    );
  });

  let transaction = await db.sequelize.transaction();

  try {
    if (
      eligibilityResult.approval &&
      interest_rate === eligibilityResult.corrected_interest_rate
    ) {
      const newLoanId = (await db.loans.max("id", { transaction })) + 1;
      const newLoanData = {
        id: newLoanId,
        customer_id,
        loan_amount,
        interest_rate,
        tenure,
        monthly_payment: eligibilityResult.monthly_installment,
        start_date,
        end_date
      };

      const newLoan = await db.loans.create(newLoanData, { transaction });
      await transaction.commit();
      res.status(201).json({
        loan_id: newLoan.id,
        customer_id: newLoan.customer_id,
        loan_approved: true,
        monthly_installment: newLoan.monthly_payment,
      });

    } else if (eligibilityResult.approve) {
      res.status(201).json({
        customer_id: newLoan.customer_id,
        loan_approved: false,
        monthly_installment: newLoan.monthly_payment,
        message: `Loan can be created, but interest rate will be ${eligibilityResult.corrected_interest_rate}`,
      });

    } else {
      res.status(201).json({
        customer_id: newLoan.customer_id,
        loan_approved: false,
        monthly_installment: newLoan.monthly_payment,
        message: `Loan cannot be created based on customer's credit score`,
      });
    }
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating new loan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = loanCreateController;
