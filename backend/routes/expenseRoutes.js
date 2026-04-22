const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");

router.post("/expense", auth, async(req,res)=>{
 const expense = await Expense.create({
   userId:req.user.id,
   title:req.body.title,
   amount:req.body.amount,
   category:req.body.category
 });

 res.json(expense);
});

router.get("/expenses", auth, async(req,res)=>{
 const expenses = await Expense.find({
   userId:req.user.id
 });

 res.json(expenses);
});

module.exports = router;