import express from 'express';
import { signup } from '../controllers/user-controller.js';
import { getAllUsers } from '../controllers/user-controller.js';
import { login } from '../controllers/user-controller.js';
import { getLikedRecipes, getSavedRecipes } from '../controllers/user-controller.js';
const router= express.Router();
router.get('/:userId/liked-recipes', getLikedRecipes);
router.get('/:userId/saved-recipes', getSavedRecipes);
router.get("/",getAllUsers)
router.post("/signup",signup);
router.post("/login",login);
export default router;
