const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.get("/weeklyCustomers/:financer_id", async (req, res) => {

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
  l.total_amount,      -- ✅ ADD THIS
  l.paid_amount,       -- (optional but useful)
  l.balance   ,
  l.interest         
FROM fin.loan l
JOIN fin.financee f ON l.financee_id = f.financee_id
WHERE l.financer_id = @financer_id
AND l.customer_type = 'weekly'
      `);

    res.json(result.recordset);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }

});

module.exports = router;