const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password ,role} = req.body;

    // check user exists
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ status: false, message: "User already exists" });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hash,
      role
    });

    await user.save();

    res.json({
      status: true,
      message: "User registered successfully"
    });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ status: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ status: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      status: true,
      message: "Login successful",
      token,
      //user
    });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

module.exports = router;