const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post("/addCustomer", upload.single("image"), async (req, res) => {

const {
  name,
  phonenumber,
  doorno,
  streetname,
  city,
  pincode,
  amount,
  interest,
  enddate,
  financer_id,
  customerType,
  collect_amt   // ✅ NEW
} = req.body;


 const profile_photo = req.file ? `uploads/${req.file.filename}` : null;

  // ✅ Validation
  if (!name || !phonenumber || !amount || !interest || !enddate || !customerType) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {

    const safeDate = new Date(enddate);

    if (isNaN(safeDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const pool = await poolPromise;

    // ===============================
    // 1️⃣ INSERT FINANCEE
    // ===============================
    await pool.request()
const financeeInsert = await pool.request()
  .input("name", sql.VarChar(20), name)
  .input("phonenumber", sql.VarChar(10), phonenumber)
  .input("profile_photo", sql.VarChar(255), profile_photo)
  .execute("fin.sp_InsertFinancee");

const financee_id = financeeInsert.recordset[0].financee_id;

    const financeeResult = await pool.request()
      .input("phonenumber", sql.VarChar(10), phonenumber)
      .query(`
        SELECT financee_id 
        FROM fin.financee 
        WHERE phonenumber = @phonenumber
      `);

    if (financeeResult.recordset.length === 0) {
      return res.status(400).json({ error: "Financee not found" });
    }


    // ===============================
    // 2️⃣ INSERT ADDRESS
    // ===============================
    await pool.request()
      .input("financee_id", sql.VarChar(10), financee_id)
      .input("door_no", sql.VarChar(10), doorno)
      .input("street_name", sql.VarChar(100), streetname)
      .input("city", sql.VarChar(50), city)
      .input("state", sql.VarChar(50), "Tamil Nadu")
      .input("pincode", sql.Int, Number(pincode))
      .execute("fin.sp_InsertAddress");

    // ===============================
    // 3️⃣ LOAN CALCULATION 🔥
    // ===============================
    const principal_amount = parseFloat(amount);
    const interest_percent = Number(interest);

    // first interest amount
    const interest_amount = (principal_amount * interest_percent) / 100;

    const finalCollectAmt =
  customerType === "monthly" ? 0 : Number(collect_amt || 0);

    // ===============================
    // 4️⃣ INSERT LOAN
    // ===============================
    await pool.request()
      .input("financer_id", sql.VarChar(10), financer_id)
      .input("financee_id", sql.VarChar(10), financee_id)
      .input("total_amount", sql.Decimal(18,2), principal_amount)
      .input("interest", sql.Int, interest_percent)
      .input("paid_amount", sql.Decimal(18,2), 0)
      .input("balance", sql.Decimal(18,2), principal_amount)
      .input("due_end_date", sql.Date, safeDate)
      .input("customer_type", sql.VarChar(20), customerType)
      

      // 🔥 IMPORTANT NEW FIELDS
      .input("principal_amount", sql.Decimal(18,2), principal_amount)
      .input("interest_amount", sql.Decimal(18,2), interest_amount)
        .input("collect_amt", sql.Decimal(18,2), finalCollectAmt) 

      .execute("fin.sp_InsertLoan");

    // ===============================
    // ✅ SUCCESS
    // ===============================
    return res.json({ message: "Customer Added Successfully ✅" });

  } catch (err) {

    console.log("ERROR:", err);

    return res.status(500).json({ error: "Insert failed ❌" });

  }

});

module.exports = router;