const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async(req,res)=>{
 const {name,email,password} = req.body;

 const hashed = await bcrypt.hash(password,10);

 const user = await User.create({
   name,
   email,
   password:hashed
 });

 res.json(user);
});

router.post("/login", async(req,res)=>{
 const {email,password} = req.body;

 const user = await User.findOne({email});

 if(!user) return res.status(400).json({msg:"User not found"});

 const ok = await bcrypt.compare(password,user.password);

 if(!ok) return res.status(400).json({msg:"Wrong Password"});

 const token = jwt.sign(
   {id:user._id},
   process.env.JWT_SECRET,
   {expiresIn:"1d"}
 );

 res.json({token});
});

module.exports = router;