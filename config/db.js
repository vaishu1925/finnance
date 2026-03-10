const sql = require("mssql");

const config = {
  user: "sa",
  password: "Coderead@123",
  server: "localhost",   // NOT undefined
  database: "finnance1",
  options: {
    instanceName: "SQLEXPRESS",
    encrypt: false,
    trustServerCertificate: true}
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
    sql,
    pool,
    poolConnect
};
