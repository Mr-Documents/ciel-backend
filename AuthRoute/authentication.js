import express from "express";

import passport from "passport";
import {
  registerUser,
  loginSuccess,
  logoutUser,
  getDashboard,
} from "../controllers/authenticationcontroller.js";

const router = express.Router();

router.get("/", (req, res) => res.json({ message: "API root" }));

router.post("/register", registerUser);

router.post("/login", passport.authenticate("local"), loginSuccess);

router.get("/logout", logoutUser);

router.get("/dashboard", getDashboard);

// Google OAuth
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/auth/google/dashboard",
  passport.authenticate("google", {
    successRedirect: "http://localhost:5173/dashboard",
    failureRedirect: "http://localhost:5173/login",
  })
);

export default router;