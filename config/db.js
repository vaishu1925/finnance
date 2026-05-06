const sql = require("mssql");

const config = {
  user: "sa",
  password: "Coderead@123",
  server: "192.168.29.236",   // NOT undefined
  database: "finnance1",
  port: 1433,
  options: {

    encrypt: false,
    trustServerCertificate: true}
};

const poolPromise = new sql.ConnectionPool(config)
.connect()
.then(pool => {
  console.log("Database connected");
  return pool;
})
.catch(err => {
  console.log("Database connection failed", err);
});




module.exports = {
  sql,
  poolPromise
   };
