module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "customers",
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      age: DataTypes.INTEGER,
      phone_number: DataTypes.STRING,
      monthly_income: DataTypes.FLOAT,
      approved_limit: DataTypes.FLOAT,
    },
    {
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
};
