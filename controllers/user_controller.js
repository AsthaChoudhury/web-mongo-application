import User from "../model/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { sendVerificationEmail } from "../services/emailservice";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    console.log(verificationToken);
    const newUser = new User({ name, email, password, verificationToken });
    await newUser.save();

    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error in registering user", error });
  }
};

//vreify
export const verifyUser = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error in verifying account", error });
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

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first." });
    }

    console.log("Stored password:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Invalid credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userId = user._id;
    console.log(userId);

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
    req.session.user = { id: user._id, name: user.name };
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

export const getUserStatus = (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(200).json({ loggedIn: false });
  }
};

export const getLikedCategories = async (req, res) => {
  console.log("Requesting liked categories for user:", req.user);
  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId).populate("likedRecipes");

    if (!user) {
      console.error("User not found for ID:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.likedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

async function loadLikedCategories() {
  try {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      displayErrorMessage("User not logged in.");
      return;
    }

    const response = await fetch(`/api/user/likedCategories?userId=${userId}`);
    if (!response.ok) {
      throw new Error(
        "Failed to fetch liked categories: " + response.statusText
      );
    }

    const user = await response.json();
    const recipeGrid = document.getElementById("liked-recipes-grid");
    recipeGrid.innerHTML = "";

    if (user.likedRecipes.length === 0) {
      displayErrorMessage("No liked recipes found.");
      return;
    }

    user.likedRecipes.forEach((recipe) => {
      const categoryLink = document.createElement("a");
      categoryLink.href = `recipe.html?recipeId=${recipe._id}`;
      categoryLink.className = "recipe__circle";

      categoryLink.innerHTML = `
        <img src="${recipe.imageUrl}" alt="${recipe.name}" class="recipe__icon">
        <h3 class="recipe__title">${recipe.name}</h3>
      `;
      recipeGrid.appendChild(categoryLink);
    });
  } catch (error) {
    console.error("Error loading liked categories:", error);
    displayErrorMessage(
      "There was an error loading the liked categories. Please try again later."
    );
  }
}

function displayErrorMessage(message) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}
