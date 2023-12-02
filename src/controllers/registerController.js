const db = require("../database/connection");

const registerController = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  const approvedLimit = Math.round(req.body.monthly_income * 2 / 100000) * 100000;

  try {
    const newCustomer = await db.customers.create(
      {
        id: req.body.id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        age: req.body.age,
        monthly_income: req.body.monthly_income,
        phone_number: req.body.phone_number,
        approved_limit: approvedLimit
      },
      { transaction }
    );

    const customer = {
      customer_id: newCustomer.id,
      name: newCustomer.first_name.concat(' ', newCustomer.last_name),
      age: newCustomer.age,
      monthly_income: newCustomer.monthly_income,
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
