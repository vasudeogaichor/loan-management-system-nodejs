const db = require("../database/connection");

const registerController = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  const approvedLimit = req.body.monthly_income * 2;

  try {
    const newCustomer = await db.customers.create(
      {
        id: req.body.id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        age: req.body.age,
        monthly_salary: req.body.monthly_income,
        phone_number: req.body.phone_number,
        approved_limit: approvedLimit
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ ...newCustomer.dataValues });
  } catch (err) {
    await transaction.rollback();
    console.error("Error creating customer:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = registerController;
