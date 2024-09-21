import express from "express";
import session from "express-session";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserStatus,
} from "../controllers/user_controller.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/status", getUserStatus);

export default router;
