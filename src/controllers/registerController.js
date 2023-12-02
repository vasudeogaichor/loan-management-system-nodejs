const db = require("../database/connection");

const registerController = async (req, res, next) => {
  console.log("body - ", req.body);
  const transaction = await db.sequelize.transaction();
  try {
    const newCustomer = await db.customers.create(
      {
        id: req.body.id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        age: req.body.age,
        monthly_salary: req.body.monthly_income,
        phone_number: req.body.phone_number,
        approved_limit: 50000
      },
      { transaction }
    );
    console.log("newCustomer - ", newCustomer);
    await transaction.commit();
    res.status(201).json({ newCustomer });
  } catch (err) {
    await transaction.rollback();
    console.error("Error creating customer:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = registerController;
