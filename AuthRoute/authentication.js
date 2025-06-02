import express from "express";
import { signup } from "../controllers/authenticationcontroller.js"
import { login } from "../controllers/authenticationcontroller.js"
import { logout } from "../controllers/authenticationcontroller.js"

const router = express.Router();

router.get("/signup", signup);

router.get("/login", login);

router.get("/logout", logout);


export default router