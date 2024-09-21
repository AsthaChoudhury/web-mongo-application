import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import session from "express-session";
import bodyParser from "body-parser";
import MongoStore from "connect-mongo";
import Recipe from "./model/Recipe.js";
import User from "./model/user.js";
import userRouter from "./routes/user_routes.js";
import recipesRouter from "./routes/recipe-routes.js";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static("frontend"));
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const frontendPath = path.join(__dirname, "frontend");
app.use(express.static(frontendPath));
const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "sessions",
});
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false, // 1 day
    },
  })
);
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
app.get("/:page", (req, res) => {
  res.sendFile(path.join(frontendPath, `${req.params.page}.html`));
});
app.use("/api/user", userRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api", recipesRouter);

app.get("/api/recipes/:id", async (req, res) => {
  const recipeId = req.params.id;
  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recipe" });
  }
});

app.post("/api/user/like-recipe", async (req, res) => {
  const { userId, recipeId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.likedRecipes.includes(recipeId)) {
      user.likedRecipes.push(recipeId);
      await user.save();
    }

    res.status(200).json({ message: "Recipe liked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error liking recipe", error });
  }
});

// Save a Recipe
app.post("/user/save-recipe", async (req, res) => {
  const { userId, recipeId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.savedRecipes.includes(recipeId)) {
      user.savedRecipes.push(recipeId);
      await user.save();
      res.status(200).json({ message: "Recipe saved successfully" });
    } else {
      res.status(400).json({ message: "Recipe already saved" });
    }
  } catch (error) {
    console.error("Error saving recipe:", error);
    res.status(500).json({ message: "Error saving recipe", error });
  }
});

app.get("/api/user/liked-recipes", async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findById(userId).populate("likedRecipes");
    res.status(200).json({ likedRecipes: user.likedRecipes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching liked recipes", error });
  }
});

// Get Saved Recipes
app.get("/api/user/saved-recipes", async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findById(userId).populate("savedRecipes");
    res.status(200).json({ savedRecipes: user.savedRecipes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching saved recipes", error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
      console.error("MongoDB connection failed. Retrying in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
