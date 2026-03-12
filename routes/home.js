const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.post("/home", async (req, res) => {

const { financer_id, name } = req.body;

try {

const pool = await poolPromise;

await pool.request()
.input("financer_id", sql.VarChar(10), financer_id)
.input("name", sql.VarChar(20), name)
.execute("fin.sp_UpdateName3");

res.json({
success: true,
message: "Name updated successfully"
});

} catch (err) {

console.log(err);

res.status(500).json({
success: false,
message: "Server error"
});

}

});

module.exports = router;