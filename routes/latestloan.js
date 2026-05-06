const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.get("/latestLoan/:financee_id", async (req, res) => {

  const { financee_id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("financee_id", sql.VarChar, financee_id)
      .query(`
        SELECT TOP 1 *
        FROM fin.loan
        WHERE financee_id = @financee_id
        ORDER BY loan_id DESC
      `);

    res.json(result.recordset[0]);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }

}); module.exports = router;