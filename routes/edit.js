
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

router.put("/financer/:id", upload.single("profile_photo"), async (req, res) => {
  try {
  const { total_financees, name, phonenumber } = req.body;

    const profile_photo = req.file
      ? `http://192.168.29.236:5000/uploads/${req.file.filename}`
      : null;

    const pool = await poolPromise;

await pool.request()
  .input("financer_id", sql.VarChar(10), req.params.id)
  .input("total_financees", sql.Int, total_financees)
  .input("name", sql.VarChar(20), name)
  .input("phonenumber", sql.VarChar(10), phonenumber)
  .input("profile_photo", sql.VarChar(255), profile_photo || null)
  .query(`
    UPDATE fin.financer
    SET name = ISNULL(@name, name),
        phonenumber = ISNULL(@phonenumber, phonenumber),
        total_financees = @total_financees,
        profile_photo = ISNULL(@profile_photo, profile_photo)
    WHERE financer_id = @financer_id
  `);

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});
module.exports = router;