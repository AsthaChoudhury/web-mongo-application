import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { protect } from "./middleware/authMiddleware.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import session from "express-session";
import bodyParser from "body-parser";
import MongoStore from "connect-mongo";
import Recipe from "./model/recipes.js";
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
      secure: false,
      httpOnly: false,
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

app.post("/api/user/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && user.comparePassword(password)) {
    req.session.user = {
      id: user._id,
      username: user.username,
    };
    return res.status(200).json({ message: "Login successful" });
  }
  res.status(401).json({ message: "Invalid credentials" });
});

app.post("/api/recipes/:id/like", protect, async (req, res) => {
  const recipeId = req.params.id;
  console.log(
    "Received like request from user ID:",
    req.session.userId || req.user?.id
  );
  const userId = req.session.userId || req.user?.id;

  if (!recipeId) {
    return res.status(400).json({ message: "Recipe ID is required" });
  }

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.likedRecipes.includes(recipeId)) {
      return res.status(400).json({ message: "Recipe is already liked" });
    }

    user.likedRecipes.push(recipeId);
    await user.save();

    res.status(200).json({ message: "Recipe liked successfully" });
  } catch (error) {
    console.error("Error liking recipe:", error);
    res
      .status(500)
      .json({ message: "Failed to like recipe", error: error.message });
  }
});

app.post("/api/recipes/:id/save", (req, res) => {
  const recipeId = req.params.id;
  const userId = req.body.userId;

  res.json({ success: true, message: "Recipe saved successfully" });
});
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

app.post("/api/recipes/:recipeId/comment", (req, res) => {
  const { username, text } = req.body;

  const newComment = {
    username: username || "Anonymous",
    text,
  };

  res.status(200).json(newComment);
});

app.get("/api/user/likedCategories", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId).populate("likedRecipes");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.likedRecipes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch liked recipes", error });
  }
});

app.get("/api/user/liked-recipes", async (req, res) => {
  const userId = req.session.userId || req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "User not found" });
  }

  try {
    const likedRecipes = await Recipe.find({ likedBy: userId });
    res.json(likedRecipes);
  } catch (error) {
    console.error("Error fetching liked recipes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/user/saved-recipes", async (req, res) => {
  console.log("Session Data:", req.session);
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId).populate("savedRecipes");
    res.status(200).json({ savedRecipes: user.savedRecipes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching saved recipes", error });
  }
});

app.post("/likeRecipe/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const recipeId = req.params.id;

    if (user.likedRecipes.includes(recipeId)) {
      user.likedRecipes.pull(recipeId);
    } else {
      user.likedRecipes.push(recipeId);
    }

    await user.save();
    res.status(200).json({ message: "Recipe like status updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/user/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
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
      console.error("MongoDB connection failed. Retrying in 5 seconds...", err);
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
