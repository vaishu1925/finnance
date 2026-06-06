const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
.connect()
.then(pool => {
  console.log("Database connected");
  return pool;
})
.catch(err => {
  console.error("Database connection failed:", err);
  throw err;
});

console.log("DB_SERVER =", process.env.DB_SERVER);
console.log("DB_USER =", process.env.DB_USER);
console.log("DB_DATABASE =", process.env.DB_DATABASE);
console.log("DB_PASSWORD =", process.env.DB_PASSWORD);




module.exports = {
  sql,
  poolPromise
   };
