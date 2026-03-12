const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");

router.post("/financer", async (req, res) => {

const { phone, password, confirmPassword } = req.body;

if (password !== confirmPassword) {
    return res.json({
        success:false,
        message:"Passwords do not match"
    });
}

try {

    const pool = await poolPromise;   // ⭐ important

    const hashedPassword = await bcrypt.hash(password,10);

    const result = await pool.request()
        .input("name", sql.VarChar(20), "Financer")
        .input("phonenumber", sql.VarChar(10), phone)
        .input("password", sql.VarChar(255), hashedPassword)
        .input("total_financees", sql.Int, 0)
        .execute("fin.sp_InsertFinancer3");

    const financer_id = result.recordset[0].financer_id;

    res.json({
        success:true,
        financer_id,
        message:"Financer created successfully"
    });

} catch(err) {

    if(err.number === 2627){
        return res.json({
            success:false,
            message:"Phone number already exists"
        });
    }

    console.log(err);

    res.status(500).json({
        success:false,
        message:"Server error"
    });
}

});

module.exports = router;