require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

app.get("/", (req, res) => {
    res.send("HRM Backend Running");
});

// Register REST API endpoints
app.use("/app/auth", require("./routes/auth"));
app.use("/app/employees", require("./routes/employee"));
app.use("/app/attendance", require("./routes/attendanceRoute"));
app.use("/app/leaves", require("./routes/leaveRoute"));
app.use("/app/payroll", require("./routes/payroll"));
app.use("/app/projects", require("./routes/projects"));
app.use("/app/dashboard", require("./routes/dashboard"));
app.use("/app/organization", require("./routes/organizationRoute"));
app.use("/app/expenses", require("./routes/expenses"));
app.use("/app/candidates", require("./routes/candidates"));
app.use("/app/appraisals", require("./routes/appraisals"));
app.use("/app/tasks", require("./routes/taskRoute"));
app.use("/app/sales", require("./routes/salesRoute"));
app.use("/app/training", require("./routes/trainingRoute"));
app.use("/app/performance", require("./routes/performanceRoute"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING at http://localhost:${PORT}`);
});