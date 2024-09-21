import User from "../model/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register User
// const User = require("../models/User");

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error in registering user", error });
  }
};
// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log("Login request received with email:", email);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    console.log("Stored password:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Invalid credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }
    req.session.user = user;

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log("Error during login:", error);
    res.status(500).json({ message: "Error in login", error });
  }
};

export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.status(200).json({ message: "Logout successful" });
  });
};

// user_controller.js
export const getUserStatus = (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(200).json({ loggedIn: false });
  }
};
