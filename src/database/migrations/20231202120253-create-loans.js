"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("loans", {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        type: Sequelize.INTEGER,
      },
      customer_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "customers",
          key: "id",
        },
      },
      loan_amount: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      tenure: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      interest_rate: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      monthly_payment: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      emis_paid_on_time: {
        type: Sequelize.INTEGER,
      },
      start_date: {
        type: Sequelize.DATEONLY,
      },
      end_date: {
        type: Sequelize.DATEONLY,
      },
      created_at: {
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("loans");
  },
};
