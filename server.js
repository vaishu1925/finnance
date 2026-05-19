const express = require('express');
const multer = require("multer");
const path = require("path");
const cors = require('cors');
const bodyParser = require('body-parser');


const financerRoutes = require("./routes/financer");
const homeRoutes = require("./routes/home");
const loginRoutes = require("./routes/login");
const otpRoutes = require("./routes/otp");
const resetPasswordRoutes = require("./routes/resetpassword");
const addCustomerRoutes = require("./routes/addcustomer");
const monthlyCustomersRoutes = require("./routes/monthlycustomers");
const weeklyCustomersRoutes = require("./routes/weeklycustomers");
const dailyCustomersRoutes = require("./routes/dailycustomers");
const ownerRoutes = require("./routes/owner");
const editRoutes = require("./routes/edit");
const addpaymentRoutes = require("./routes/addpayment");
const historyRoutes = require("./routes/history");
const dashboardRoutes = require("./routes/dashboard");
const latestLoanRoutes = require("./routes/latestloan");





const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static("uploads"));



app.use("/api", financerRoutes);
app.use("/api", homeRoutes);
app.use("/api", loginRoutes);
app.use("/api", otpRoutes);
app.use("/api", resetPasswordRoutes);
app.use("/api", addCustomerRoutes);
app.use("/api", monthlyCustomersRoutes);
app.use("/api", weeklyCustomersRoutes);
app.use("/api", dailyCustomersRoutes);
app.use("/api",ownerRoutes);
app.use("/api",editRoutes);
app.use("/api",addpaymentRoutes);
app.use("/api",historyRoutes);
app.use("/api",dashboardRoutes);
app.use("/api",latestLoanRoutes);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at ${PORT}`);
});
