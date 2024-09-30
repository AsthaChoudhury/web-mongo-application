import express from "express";
import Recipe from "../model/recipes.js";
import multer from "multer";
import path from "path";
import fs from "fs"; // Ensure fs is imported for file operations
import { isAuthenticated } from "../middleware/auth.js";
import {
  addRecipe,
  deleteRecipe,
  getAllRecipes,
} from "../controllers/recipe_controller.js";

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and GIF files are allowed"));
    }
    cb(null, true);
  },
});

// Route to upload a new recipe
router.post(
  "/upload-recipe",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        prepTime,
        cookTime,
        servings,
        ingredients,
        instructions,
        category,
      } = req.body;

      const image = req.file ? req.file.filename : null;

      // Check for required fields
      if (
        !title ||
        !description ||
        !prepTime ||
        !cookTime ||
        !servings ||
        !ingredients ||
        !instructions ||
        !category ||
        !image // Ensure image is included
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create new recipe
      const newRecipe = new Recipe({
        title,
        description,
        prepTime,
        cookTime,
        servings,
        ingredients,
        instructions,
        category,
        image,
        createdBy: req.session.user._id, // Use the user ID from the session
      });

      // Save the recipe to the database
      const savedRecipe = await newRecipe.save();
      res.status(201).json({
        message: "Recipe uploaded successfully",
        recipeId: savedRecipe._id,
      });
    } catch (error) {
      console.error("Error uploading recipe:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Route to get recipes by category
router.get("/category/:category", async (req, res) => {
  const category = req.params.category;

  try {
    const recipes = await Recipe.find({ category: category });
    if (!recipes || recipes.length === 0) {
      return res
        .status(404)
        .json({ error: "No recipes found for this category" });
    }
    res.status(200).json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// Route to get all recipes
router.get("/", getAllRecipes);

// Route to delete a recipe
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    // Optionally delete the image file from the server
    if (recipe && recipe.image) {
      fs.unlink(path.join("uploads", recipe.image), (err) => {
        if (err) console.error("Error deleting image file:", err);
      });
    }

    res.status(200).json({ message: "Recipe deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting recipe" });
  }
});

// Route to update a recipe
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      description,
      prepTime,
      cookTime,
      servings,
      ingredients,
      instructions,
      category,
    } = req.body;
    const image = req.file ? req.file.filename : null;

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        prepTime,
        cookTime,
        servings,
        ingredients,
        instructions,
        category,
        image,
      },
      { new: true }
    );

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating recipe" });
  }
});

// Routes for liking and saving recipes
router.post("/api/recipe/like", (req, res) => {
  const { recipeId } = req.body;
  const userId = req.session.userId;
  User.findById(userId)
    .then((user) => {
      if (!user.likedRecipes.includes(recipeId)) {
        user.likedRecipes.push(recipeId);
        user.save();
        res.json({ message: "Recipe liked successfully" });
      } else {
        res.status(400).json({ message: "Recipe already liked" });
      }
    })
    .catch((err) => res.status(500).json({ error: "Failed to like recipe" }));
});

router.post("/api/recipe/save", (req, res) => {
  const { recipeId } = req.body;
  const userId = req.session.userId;

  User.findById(userId)
    .then((user) => {
      if (!user.savedRecipes.includes(recipeId)) {
        user.savedRecipes.push(recipeId);
        user.save();
        res.json({ message: "Recipe saved successfully" });
      } else {
        res.status(400).json({ message: "Recipe already saved" });
      }
    })
    .catch((err) => res.status(500).json({ error: "Failed to save recipe" }));
});

// Route to fetch liked recipes
router.get("/api/user/liked-recipes", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate(
      "likedRecipes"
    );
    res.status(200).json({ likedRecipes: user.likedRecipes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch liked recipes" });
  }
});

// Route to fetch saved recipes
router.get("/api/user/saved-recipes", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate(
      "savedRecipes"
    );
    res.status(200).json({ savedRecipes: user.savedRecipes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch saved recipes" });
  }
});

export default router;
