const Pool = require("pg").Pool;
require("dotenv").config();

// const conn = {
//   user: process.env.PG_USER,
//   password: process.env.PG_PWD,
//   database: process.env.PG_DB,
//   host: process.env.PG_HOST,
//   port: process.env.PG_PORT,
// };

const dev = `postgresql://${process.env.PG_USER}:${process.env.PG_PWD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DB}`;
const pro = process.env.DATABASE_URL;

const pool = new Pool({
  user: "postgres",
  password: "1234",
  database: "webmap",
  host: "localhost",
  port: 5432,
});
pool
  .connect()
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("Connection Error", err.stack));

module.exports = pool;
