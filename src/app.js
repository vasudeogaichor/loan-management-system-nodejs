const express = require("express");
const bodyParser = require("body-parser");
const { watchForChanges } = require('./workers/worker');

const { routes } = require("./routes");
const db = require("./database/connection");

const app = express();

//synchronizing the database and forcing it to false so we dont lose data
// force: true => drops all tables and recreates them,
// useful in development only, remove in production
db.sequelize.sync(/*{ force: true }*/).then(() => {
  console.log("db has been re sync");
});

app.use(bodyParser.json());

app.use("/", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  watchForChanges();
});
