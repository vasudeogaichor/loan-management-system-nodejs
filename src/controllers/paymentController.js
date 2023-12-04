const db = require("../database/connection");
const { getRoundedAmount } = require("../utils");

const paymentController = async (req, res, next) => {
  const { emi_amount } = req.body;
  const { customer_id, loan_id } = req.params;
  let transaction = await db.sequelize.transaction();

  try {
    const loan = await db.loans.findOne(
      {
        where: {
          id: loan_id,
          customer_id,
        },
      },
      { transaction }
    );

    if (!loan) {
      res
        .status(400)
        .json({
          Error: `Loan id ${loan_id} against customer id ${customer_id} does not exist`,
        });
    } else {
        if (emi_amount < loan.monthly_payment) {
            res
            .status(400)
            .json({
              Error: `EMI amount should be equal to greater than ${loan.monthly_payment}`,
            }); 
            return;
        }
        // Lack of data, since only recording EMIs paid on time and not total EMIs paid.
        // We'll consider total EMIs paid till date = emis_paid_on_time
        const totalAmountPaid = loan.emis_paid_on_time * loan.monthly_payment + emi_amount;
        const remainingAmount = loan.loan_amount - totalAmountPaid;
        const revisedEMI = getRoundedAmount(remainingAmount / (loan.tenure - loan.emis_paid_on_time ))
        loan.monthly_payment = revisedEMI
        if (!loan.emis_paid_on_time) {
            loan.emis_paid_on_time = 1
        } else {
            loan.emis_paid_on_time += 1
        }
        await loan.save({transaction})
        res.status(201).json({
            remainingAmount,
            revisedEMI
        })
    }
    await transaction.commit()
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating EMI:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = paymentController;
