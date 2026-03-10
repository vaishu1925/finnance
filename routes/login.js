const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.post("/login", async (req, res) => {
console.log("Login request received:", req.body);

const { phone, password } = req.body;

try {

const pool = await poolPromise;

const result = await pool.request()
.input("phonenumber", sql.VarChar, phone)
.input("password", sql.VarChar, password)
.execute("fin.sp_LoginFinancer");


if(!result.recordset || result.recordset.length === 0){
return res.json({
success:false,
message:"Phone or password mismatch"
});
}

const user = result.recordset[0];

res.json({
success:true,
sign_id:user.financer_id
});

}

catch(err){
console.log("LOGIN ERROR:", err);
res.status(500).json({error: err.message});
}

});


module.exports = router;