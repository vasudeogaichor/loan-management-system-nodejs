const db = require("../database/connection");
const { getRoundedAmount } = require("../utils");

const calculateCreditScore = (customerDetails) => {
  // Extract relevant information from customer details
  const {
    pastLoansPaidOnTime,
    numberOfLoansTaken,
    loanActivityInCurrentYear,
    loanApprovedVolume,
    sumOfCurrentLoans,
    monthlySalary,
    sumOfCurrentEMIs
  } = customerDetails;

  // Calculate credit score based on the specified components
  let creditScore = 0;

  creditScore += pastLoansPaidOnTime;
  creditScore += numberOfLoansTaken * 5; // 5 points for each past loan
  creditScore += loanActivityInCurrentYear;
  creditScore += loanApprovedVolume;

  // If sum of current loans > approved limit, credit score = 0
  if (sumOfCurrentLoans > customerDetails.approvedLimit) {
    creditScore = 0;
  }

  // Determine loan eligibility based on credit score
  let loanApprovalStatus = "";
  let correctedInterestRate = 0;

  if (creditScore > 50) {
    loanApprovalStatus = "Loan Approved";
    correctedInterestRate = customerDetails.interestRate;
  } else if (creditScore > 30) {
    loanApprovalStatus = "Loan Approved with Interest Rate > 12%";
    correctedInterestRate = Math.max(12, customerDetails.interestRate);
  } else if (creditScore > 10) {
    loanApprovalStatus = "Loan Approved with Interest Rate > 16%";
    correctedInterestRate = Math.max(16, customerDetails.interestRate);
  } else {
    loanApprovalStatus = "Loan Not Approved";
  }

  // Check if sum of all current EMIs > 50% of monthly salary
  if ((sumOfCurrentEMIs * correctedInterestRate) / 100 > 0.5 * monthlySalary) {
    loanApprovalStatus = "Loan Not Approved - High EMIs";
  }

  return {
    creditScore,
    loanApprovalStatus,
    correctedInterestRate,
  };
};

const calculateCustomerDetails = (pastLoans) => {
  const customerDetails = {
    pastLoansPaidOnTime: 0,
    numberOfLoansTaken: pastLoans.length,
    loanActivityInCurrentYear: 0,
    loanApprovedVolume: 0,
    sumOfCurrentLoans: 0,
    sumOfCurrentEMIs: 0
  };

  const currentDate = new Date();

  pastLoans.forEach((loan) => {
    // Add count to loanApprovedVolume
    customerDetails.loanApprovedVolume += 1;

    // Check if the loan is active (end_date is in the future)
    const loanEndDate = new Date(loan.end_date);
    if (loanEndDate > currentDate) {
      // Increment loanActivityInCurrentYear if the loan started in the current year
      const loanStartDate = new Date(loan.start_date);
      if (loanStartDate.getFullYear() === currentDate.getFullYear()) {
        customerDetails.loanActivityInCurrentYear += 1;
      }

      // Increment pastLoansPaidOnTime if emis_paid_on_time is greater than 0
      customerDetails.pastLoansPaidOnTime += loan.emis_paid_on_time;

      // Add loan_amount to sumOfCurrentLoans
      customerDetails.sumOfCurrentLoans += loan.loan_amount;

      // Add monthly emis to sumOfCurrentEMIs
      customerDetails.sumOfCurrentEMIs += loan.monthly_payment;
    }
  });

  return customerDetails;
};

const eligibilityController = async (req, res, next) => {
  const { customer_id, loan_amount, interest_rate, tenure } = req.body;
  const transaction = await db.sequelize.transaction();

  try {
    const customer = await db.customers.findByPk(customer_id, {
      attributes: ["id", "monthly_salary"],
    }, {transaction});

    const customerLoanData = await db.loans.findAll({
      where: {
        customer_id,
      },
    });

    const customerDetails = calculateCustomerDetails(customerLoanData);
    customerDetails.monthlySalary = customer.monthly_salary;
    customerDetails.interestRate = interest_rate;

    const result = calculateCreditScore(customerDetails);
    const approval = result.loanApprovalStatus.includes("Loan Not Approved")
      ? false
      : true;

    const response = {
      customer_id: customer.id,
      approval,
      interest_rate,
      corrected_interest_rate: result.correctedInterestRate,
      tenure,
      monthly_installment: getRoundedAmount(loan_amount / tenure),
    };

    res.status(200).json(response);
  } catch (error) {
    await transaction.rollback();
    console.error("Error checking eligibility:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = eligibilityController;
