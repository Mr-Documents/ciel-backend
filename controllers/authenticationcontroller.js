import mongoose from "mongoose";
import User from "../models/users.js";


import bcrypt from "bcrypt";
import User from "../models/User.js";

const saltRounds = 10;

export const registerUser = async (req, res) => {
  const { username: email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ email, password: hash });
    await newUser.save();
    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ error: "Login error" });
      return res.json({ message: "Registration successful" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginSuccess = (req, res) => {
  res.json({ message: "Login successful" });
};

export const logoutUser = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.json({ message: "Logged out" });
  });
};

export const getDashboard = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ secret: "Welcome to the Dashboard." });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

