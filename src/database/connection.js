const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
const basename = path.basename(__filename);

dotenv.config();

// Create connection string
const connectionUrl = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Database connection with environment variables
const sequelize = new Sequelize(connectionUrl, {
  dialect: "mysql",
  define: {
    freezeTableName: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  },
});

// Checking if the connection is done
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected to discover");
  })
  .catch((err) => {
    console.error(err);
  });

const db = {};

// Reading models
fs.readdirSync(path.join(__dirname, 'models'))
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file !== 'index.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, 'models', file))(
      sequelize,
      DataTypes
    );
    db[model.name] = model;
  });
 
// TODO - uncomment after adding associations
// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// // TODO: Debug why sequelize using id column in customers table by defualt, then remove below line
// db.customers.removeAttribute('id');

// Exporting the module
module.exports = db;
