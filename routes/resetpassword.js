const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.post("/reset-password", async (req, res) => {

const { phone, password } = req.body;

try{

const pool = await poolPromise;

await pool.request()
.input("phonenumber", sql.VarChar, phone)
.input("password", sql.VarChar, password)
.execute("fin.sp_UpdatePassword");

res.json({
success:true,
message:"Password updated successfully"
});

}
catch(err){

console.log(err);
res.status(500).json({success:false,message:"Server error"});

}

});

module.exports = router;