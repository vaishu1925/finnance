const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const pool = await poolPromise;

    // 1. get user
    const result = await pool.request()
      .input("phonenumber", sql.VarChar, phone)
      .query("SELECT * FROM fin.financer WHERE phonenumber=@phonenumber");

    if (result.recordset.length === 0) {
      return res.json({
        success: false,
        type: "not_registered"
      });
    }

    const user = result.recordset[0];

    // 2. compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        type: "wrong_password"
      });
    }

    // 3. success
    res.json({
      success: true,
      sign_id: user.financer_id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;