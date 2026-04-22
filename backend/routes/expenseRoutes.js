const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");

router.post("/expense", auth, async (req, res) => {
  const expense = await Expense.create({
    userId: req.user.id,
    title: req.body.title,
    amount: req.body.amount,
    category: req.body.category
  });

  res.json(expense);
});

router.get("/expenses", auth, async (req, res) => {
  const expenses = await Expense.find({
    userId: req.user.id
  });

  res.json(expenses);
});

router.put("/expense/:id", auth, async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(expense);
});

router.delete("/expense/:id", auth, async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

module.exports = router;