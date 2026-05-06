const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.post("/addPayment", async (req, res) => {
  const { financee_id, due_amount, due_date } = req.body;

  if (!financee_id || !due_amount || !due_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const pool = await poolPromise;

    // ===============================
    // 1️⃣ Get latest loan
    // ===============================
    const loanResult = await pool.request()
      .input("financee_id", sql.VarChar, financee_id)
      .query(`
        SELECT TOP 1 *
        FROM fin.loan
        WHERE financee_id = @financee_id
        ORDER BY loan_id DESC
      `);

    if (loanResult.recordset.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const loan = loanResult.recordset[0];

    const balance = Number(loan.balance || 0);
    const interest = Number(loan.interest || 0);
    const existing_paid = Number(loan.paid_amount || 0);
    const customerType = loan.customer_type;

    let interestPaid = 0;
    let principalPaid = 0;
    let interestAmount = 0;

    // ===============================
    // 2️⃣ LOGIC BASED ON CUSTOMER TYPE
    // ===============================

    if (customerType === "monthly") {
      // ✅ MONTHLY → existing logic

      interestAmount = (balance * interest) / 100;

      if (due_amount >= interestAmount) {
        interestPaid = interestAmount;
        principalPaid = due_amount - interestAmount;
      } else {
        interestPaid = due_amount;
        principalPaid = 0;
      }

    } else {
      // 🔥 WEEKLY / DAILY → FIXED INTEREST MODEL

      // ❌ no recalculation
      interestAmount = 0;

      // ✅ full payment goes to principal
      interestPaid = 0;
      principalPaid = due_amount;
    }

    // ===============================
    // 3️⃣ CALCULATE NEW VALUES
    // ===============================
    const new_balance = balance - principalPaid;
    const new_paid = existing_paid + principalPaid;

    // ===============================
    // 4️⃣ UPDATE LOAN (CURRENT STATE)
    // ===============================
    await pool.request()
      .input("loan_id", sql.VarChar, loan.loan_id)
      .input("paid_amount", sql.Decimal(18, 2), new_paid)
      .input("balance", sql.Decimal(18, 2), new_balance)
      .query(`
        UPDATE fin.loan
        SET paid_amount = @paid_amount,
            balance = @balance
        WHERE loan_id = @loan_id
      `);

    // ===============================
    // 5️⃣ INSERT INTO DUE (HISTORY SNAPSHOT)
    // ===============================
    await pool.request()
      .input("loan_id", sql.VarChar, loan.loan_id)
      .input("due_amount", sql.Decimal(18, 2), due_amount)
      .input("due_date", sql.Date, due_date)
      .input("interest_paid", sql.Decimal(18, 2), interestPaid)
      .input("principal_paid", sql.Decimal(18, 2), principalPaid)
      .input("balance", sql.Decimal(18, 2), new_balance) // 🔥 IMPORTANT
      .execute("fin.sp_InsertDue");

    // ===============================
    // ✅ RESPONSE
    // ===============================
    return res.json({
      message: "Payment Added Successfully ✅",
      customerType,
      interestAmount,
      interestPaid,
      principalPaid,
      new_balance,
      new_paid
    });

  } catch (err) {
    console.log("ADD PAYMENT ERROR:", err);
    return res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;