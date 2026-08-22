require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db= require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res) =>{
    res.send("HRM Backend Running");
});

app.use("/app/employees", require("./routes/employee"));

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`SERVER IS RUNNING at http://localhost:${PORT}`);
});