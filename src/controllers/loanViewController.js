const db = require("../database/connection");

const loanViewController = async (req, res, next) => {
    const loanId = req.params.loan_id

    if (!loanId) {
        res.status(400).json("Error: Loan Id not received")
    } else {
        const loan = await db.loans.findOne({
            where: { id: loanId },
            include: [{
                model: db.customers,
                required: false
            }]
        })
        
        if (loan) {
            const customer = {
                first_name: loan.customer.first_name,
                last_name: loan.customer.last_name,
                age: loan.customer.age,
                phone_number: loan.customer.phone_number
            }

            res.status(200).json({
                loan_id: loan.id,
                loan_amount: loan.loan_amount,
                interest_rate: loan.interest_rate,
                monthly_installment: loan.monthly_payment,
                tenure: loan.tenure,
                customer
            })
        } else {
            res.status(400).json({"Error": `Loan with id ${loanId} not found`})
        }
    }
}

module.exports = loanViewController