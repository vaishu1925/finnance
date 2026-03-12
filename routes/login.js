const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.post("/login", async (req, res) => {

const { phone, password } = req.body;

try {

const pool = await poolPromise;

// check phone exists
const phoneCheck = await pool.request()
.input("phonenumber", sql.VarChar, phone)
.query("SELECT * FROM fin.financer WHERE phonenumber=@phonenumber");

if(phoneCheck.recordset.length === 0){
return res.json({
success:false,
type:"not_registered",
message:"Phone number not registered"
});
}

// check login
const result = await pool.request()
.input("phonenumber", sql.VarChar, phone)
.input("password", sql.VarChar, password)
.execute("fin.sp_LoginFinancer");

if(result.recordset.length === 0){
return res.json({
success:false,
type:"wrong_password",
message:"Incorrect password"
});
}

const user = result.recordset[0];

res.json({
success:true,
sign_id:user.financer_id
});

}

catch(err){
console.log(err);
res.status(500).json({error: err.message});
}

});

module.exports = router;