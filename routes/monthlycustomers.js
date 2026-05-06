const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.get("/monthlyCustomers/:financer_id", async (req, res) => {

  const { financer_id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("financer_id", sql.VarChar(10), financer_id)
      .query(`
SELECT 
  f.financee_id,
  f.name,
  f.phonenumber,
  l.customer_type,
  f.profile_photo,
  l.total_amount,
  l.paid_amount,
  l.balance,
  l.interest   -- 🔥 ADD THIS LINE
FROM fin.loan l
JOIN fin.financee f ON l.financee_id = f.financee_id
WHERE l.financer_id = @financer_id
AND l.customer_type = 'monthly'
      `);

    res.json(result.recordset);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }

});

module.exports = router;