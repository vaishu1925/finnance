const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.get("/dashboard/:financer_id", async (req, res) => {
  const { financer_id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("financer_id", sql.VarChar(10), financer_id)
.query(`
SELECT 
  (SELECT ISNULL(SUM(total_amount),0)
   FROM fin.loan 
   WHERE financer_id = @financer_id) AS total_financed,

  (SELECT ISNULL(SUM(balance),0)
   FROM fin.loan 
   WHERE financer_id = @financer_id) AS total_balance,

  (SELECT ISNULL(SUM(d.principal_paid),0)
   FROM fin.due d
   INNER JOIN fin.loan l ON l.loan_id = d.loan_id
   WHERE l.financer_id = @financer_id) AS total_principal,

  (SELECT ISNULL(SUM(d.interest_paid),0)
   FROM fin.due d
   INNER JOIN fin.loan l ON l.loan_id = d.loan_id
   WHERE l.financer_id = @financer_id) AS total_interest
`)

    res.json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dashboard error" });
  }
});

module.exports = router;