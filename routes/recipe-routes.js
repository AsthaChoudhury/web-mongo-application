import express from "express";
import Recipe from "../model/recipes.js";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import path from "path";
import fs from "fs";
import { isAuthenticated } from "../middleware/auth.js";
import {
  addRecipe,
  deleteRecipe,
  getAllRecipes,
} from "../controllers/recipe_controller.js";

const router = express.Router();
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and GIF files are allowed"));
    }
    cb(null, true);
  },
});

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

      if (
        !title ||
        !description ||
        !prepTime ||
        !cookTime ||
        !servings ||
        !ingredients ||
        !instructions ||
        !category ||
        !image
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }
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
        createdBy: req.session.user._id,
      });

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

router.get("/", getAllRecipes);

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

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

router.post("/api/recipes/:id/comment", protect, async (req, res) => {
  const recipeId = req.params.id;
  const { userId, comment } = req.body;

  try {
    const recipe = await Recipe.findById(recipeId);
    const user = await User.findById(userId);

    if (!recipe || !user) {
      return res.status(404).json({ message: "Recipe or User not found" });
    }

    const newComment = {
      user: user._id,
      text: comment,
    };

    recipe.comments.push(newComment);
    await recipe.save();

    res.status(201).json({ user: user.username, text: comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
});

export default router;
