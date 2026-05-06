const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.get("/history/:financee_id", async (req, res) => {
  const { financee_id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("financee_id", sql.VarChar, financee_id)
      .query(`
SELECT 
  l.loan_id,
  l.total_amount,
  l.interest,

  d.due_id,
  d.due_amount,
  d.due_date,
  d.interest_paid,
  d.principal_paid,

  -- 🔥 FIXED RUNNING BALANCE (STABLE)
  l.total_amount 
    - SUM(ISNULL(d.principal_paid,0)) OVER (
        PARTITION BY l.loan_id 
        ORDER BY d.due_date ASC, d.due_id ASC
      ) AS balance,

  SUM(ISNULL(d.principal_paid,0)) OVER (
    PARTITION BY l.loan_id
    ORDER BY d.due_date ASC, d.due_id ASC
  ) AS paid_amount

FROM fin.loan l
JOIN fin.due d ON l.loan_id = d.loan_id
WHERE l.financee_id = @financee_id
ORDER BY d.due_date ASC, d.due_id ASC;
`);

console.log("DB RESULT:", result.recordset);
    res.json(result.recordset);

  } catch (err) {
   console.log("FULL ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;