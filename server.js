const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');


const financerRoutes = require("./routes/financer");
const homeRoutes = require("./routes/home");
const loginRoutes = require("./routes/login");


const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use("/api", financerRoutes);
app.use("/api", homeRoutes);
app.use("/api", loginRoutes);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://192.168.29.236:${PORT}`);
});
