const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

let otpStore = {}; // temporary OTP storage

router.post("/generate-otp", async (req,res)=>{

const { phone } = req.body;

try{

const pool = await poolPromise;

const result = await pool.request()
.input("phonenumber",sql.VarChar,phone)
.query("SELECT * FROM fin.financer WHERE phonenumber=@phonenumber");

if(result.recordset.length === 0){
return res.json({
success:false,
message:"Phone not registered"
});
}

const otp = Math.floor(1000 + Math.random()*9000);

otpStore[phone] = otp;

console.log("OTP:",otp);

res.json({
success:true,
otp
});

}
catch(err){
console.log(err);
res.status(500).json({error:err.message});
}

});

router.post("/verify-otp",(req,res)=>{

const { phone, otp } = req.body;

if(otpStore[phone] == otp){

delete otpStore[phone];

res.json({
success:true
});

}else{

res.json({
success:false,
message:"Invalid OTP"
});

}

});

module.exports = router;