import mongoose from "mongoose";
import User from "../models/users.js";


export const getsignup = (req, res) => {}
  


export const getlogin = (req, res) =>{
    res.json({
        message: "login endpoint get",
    });
}


    export const postsignup = async (req, res) =>{
        const { username, password } = req.body;
       
  try {
    const existingUser = await User.findOne({ email: username });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ email: username, password: hashedPassword });

    req.login(user, err => {
      if (err) return res.status(500).json({ message: "Login failed" });
      res.status(201).json({ message: "Registered and logged in" });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

    
    export const postlogin = (req, res) =>{
        res.json({
            message: "login endpoint post",
        });




}
export const logout = (req, res) =>{
    res.json({
        message: "logout endpoint",
    });
}
