module.exports = (sequelize, DataTypes) => {
  return sequelize.define("loans", {
    customer_id: DataTypes.INTEGER,
    loan_id: DataTypes.INTEGER,
    loan_amount: DataTypes.FLOAT,
    tenure: DataTypes.INTEGER,
    interest_rate: DataTypes.FLOAT,
    monthly_payment: DataTypes.FLOAT,
    emis_paid_on_time: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
  });
};
