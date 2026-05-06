const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const multer = require("multer");
const path = require("path"); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");   // folder must exist
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage }); 
router.get("/financer/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("financer_id", sql.VarChar(10), req.params.id)
      .query(`
        SELECT 
          f.financer_id,
          f.name,
          f.phonenumber,
          f.profile_photo,

          COUNT(DISTINCT l.financee_id) AS total_financees

        FROM fin.financer f

        LEFT JOIN fin.loan l 
          ON f.financer_id = l.financer_id

        WHERE f.financer_id = @financer_id

        GROUP BY 
          f.financer_id,
          f.name,
          f.phonenumber,
          f.profile_photo
      `);

    res.json(result.recordset[0]);

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

module.exports = router;