const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../config/db");

router.post("/home", async (req, res) => {

    const { financer_id, name } = req.body;

    try {

        await poolConnect;

        const request = pool.request();

        request.input("financer_id", sql.VarChar(10), financer_id);
        request.input("name", sql.VarChar(20), name);

        await request.execute("fin.sp_UpdateName");

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