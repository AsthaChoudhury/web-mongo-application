import express from "express";
import session from "express-session";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserStatus,
  getLikedCategories,
  verifyUser,
} from "../controllers/user_controller.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify/:token", verifyUser);
router.get("/verify", verifyUser);
router.post("/logout", logoutUser);
router.get("/status", getUserStatus);
router.get("/likedCategories", protect, getLikedCategories);

export default router;
