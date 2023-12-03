module.exports = (sequelize, DataTypes) => {
  const loansModel = sequelize.define(
    "loans",
    {
      customer_id: DataTypes.INTEGER,
      loan_amount: DataTypes.FLOAT,
      tenure: DataTypes.INTEGER,
      interest_rate: DataTypes.FLOAT,
      monthly_payment: DataTypes.FLOAT,
      emis_paid_on_time: DataTypes.INTEGER,
      start_date: DataTypes.DATEONLY,
      end_date: DataTypes.DATEONLY,
    },
    {
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

  loansModel.associate = (db) => {
    loansModel.belongsTo(db.customers)
  }

  return loansModel
};
