const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");

router.get("/", expenseController.getExpenses);
router.post("/", expenseController.createExpense);
router.put("/:id/approve", expenseController.approveExpense);

module.exports = router;
