const sql = require("mssql");

const config = {
  user: "menswearadmin",
  password: "Coderead@123",
  server: "menswear2026.database.windows.net",   // NOT undefined
  database: "Finnance",
    port: 1433,
  options: {

    encrypt: true,
    trustServerCertificate: false}
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
