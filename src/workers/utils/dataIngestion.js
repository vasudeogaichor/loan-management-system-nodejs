const xlsx = require("xlsx");
const db = require("../../database/connection");

// TODO - if error is triggered while data ingestion,
// use a logger library to dump the error stack
function convertExcelDateToMySQLDate(excelDateSerial) {
  const excelStartDate = new Date(1900, 0, 1);

  const milliseconds = (excelDateSerial - 1) * 24 * 60 * 60 * 1000;
  const resultDate = new Date(excelStartDate.getTime() + milliseconds);

  const formattedDate = resultDate.toISOString().split("T")[0];
  return formattedDate;
}

function getExcelData(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const header = rows[0];
  const dataRows = rows.slice(1);
  return { header, dataRows };
}

async function ingestCustomerData(filePath) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();
    const { header, dataRows } = getExcelData(filePath);
    for (const dataRow of dataRows) {
      const row = {};
      header.forEach((col, index) => {
        row[col] = dataRow[index];
      });

      await processCustomerRow(row, transaction);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.log('Error during data ingestion: ', error.stack)
  }
}

async function processCustomerRow(row, transaction) {
  // Check if customer_id exists in the database
  const existingCustomer = await db.customers.findByPk(row.customer_id, {
    transaction,
  });

  if (existingCustomer) {
    // update old customer info
    delete row["customer_id"];
    await existingCustomer.update(row, { transaction });
  } else {
    // create new customer
    await db.customers.create(
      {
        id: row.customer_id,
        first_name: row.first_name,
        last_name: row.last_name,
        age: row.age,
        phone_number: row.phone_number,
        monthly_salary: row.monthly_salary,
        approved_limit: row.approved_limit,
      },
      { transaction }
    );
  }
}

async function ingestLoanData(filePath) {
  const updatedLoanCustomerIds = new Set();
  let transaction;
  try {
    transaction = await db.sequelize.transaction();
    const { header, dataRows } = getExcelData(filePath);

    for (const dataRow of dataRows) {
      const row = {};
      header.forEach((col, index) => {
        row[col] = dataRow[index];
      });

      updatedLoanCustomerIds.add(row.customer_id)
      await processLoanRow(row, transaction);
    }

    await transaction.commit();
    if (updatedLoanCustomerIds.size) {
        // TODO - move customer debt updates to child process
        await updateCustomerDebt([...updatedLoanCustomerIds])
    }
  } catch (error) {
    await transaction.rollback();
    console.log('Error during data ingestion: ', error.stack)
  }
}

async function processLoanRow(row, transaction) {
  // Check if loan_id exists in the database
  const existingLoan = await db.loans.findByPk(row.loan_id, {
    transaction,
  });
  const loanData = {
    id: row.loan_id,
    customer_id: row.customer_id,
    loan_amount: row.loan_amount,
    tenure: row.tenure,
    interest_rate: row.interest_rate,
    monthly_payment: row.monthly_payment,
    emis_paid_on_time: row["EMIs paid on Time"],
    start_date: convertExcelDateToMySQLDate(row.start_date),
    end_date: convertExcelDateToMySQLDate(row.end_date),
  };
  if (existingLoan) {
    // update old loan info
    delete loanData["id"];
    await existingLoan.update(loanData, { transaction });
  } else {
    // create new loan
    await db.loans.create(loanData, { transaction });
  }
}

async function updateCustomerDebt(updatedLoanCustomerIds) {
    let transaction;
    try {
      transaction = await db.sequelize.transaction();
  
      for (const customerId of updatedLoanCustomerIds) {
        const totalDebt = await db.loans.sum('loan_amount', {
          where: { customer_id: customerId },
          transaction,
        });
  
        await db.customers.update(
          { current_debt: totalDebt },
          { where: { id: customerId }, transaction }
        );
      }
  
      await transaction.commit();
  
      console.log('Customer debts updated successfully.');
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
  
      console.error('Error updating customer debt:', error);
    }
  }

module.exports = { ingestCustomerData, ingestLoanData, updateCustomerDebt };


