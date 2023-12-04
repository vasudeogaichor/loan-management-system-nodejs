const db = require("../database/connection");
const { getRoundedAmount } = require("../utils");

const registerController = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  const { id, first_name, last_name, age, phone_number, monthly_income } = req.body

  const approvedLimit = getRoundedAmount((monthly_income * 36 / 100000) * 100000);

  let newId = id;
  if (!newId) {
    newId = await db.customers.max('id') + 1
  }

  try {
    const newCustomer = await db.customers.create(
      {
        id: newId,
        first_name,
        last_name,
        age,
        monthly_salary: monthly_income,
        phone_number,
        approved_limit: approvedLimit
      },
      { transaction }
    );

    const customer = {
      customer_id: newCustomer.id,
      name: newCustomer.first_name.concat(' ', newCustomer.last_name),
      age: newCustomer.age,
      monthly_income: newCustomer.monthly_salary,
      approved_limit: newCustomer.approved_limit,
      phone_number: newCustomer.phone_number
    }

    await transaction.commit();
    res.status(201).json(customer);
  } catch (err) {
    await transaction.rollback();
    console.error("Error creating customer:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = registerController;
