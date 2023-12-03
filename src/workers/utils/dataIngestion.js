const xlsx = require("xlsx");
const db = require("../../database/connection");

async function ingestCustomerData(filePath) {
    let transaction;
    try {
      transaction = await db.sequelize.transaction();
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
      const header = rows[0];
      const dataRows = rows.slice(1);
  
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
      throw error;
    }
  }

async function processCustomerRow(row, transaction) {
  // // Check if customer_id exists in the database
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
  console.log("filePath - ", filePath);
}

module.exports = { ingestCustomerData, ingestLoanData };
