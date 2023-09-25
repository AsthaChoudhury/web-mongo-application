import express from "express";
import Recipe from "../model/recipes.js";
import { addRecipe, deleteRecipe, getByUserId, updateRecipe} from "../controllers/blog-controller.js";
import { getAllRecipes } from "../controllers/blog-controller.js";
const recipeRouter = express.Router();
import { getById } from "../controllers/blog-controller.js";
recipeRouter.get("/",getAllRecipes);
recipeRouter.post("/add",addRecipe);
recipeRouter.put("/update/:id",updateRecipe);
recipeRouter.get("/:id",getById);
recipeRouter.delete("/:id",deleteRecipe);
recipeRouter.get('/user/:id',getByUserId)
export default recipeRouter;
