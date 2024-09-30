import Recipe from "../model/recipes.js";
import fs from "fs";
import path from "path";

export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving recipes" });
  }
};

export const addRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      prepTime,
      cookTime,
      servings,
      ingredients,
      instructions,
    } = req.body;

    const image = req.file.path;

    if (!title || !description || !ingredients || !instructions || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRecipe = new Recipe({
      title,
      description,
      prepTime,
      cookTime,
      servings,
      ingredients,
      instructions,
      image,
      createdBy: req.session.user._id,
    });

    await newRecipe.save();
    res.status(201).json({ message: "Recipe uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error uploading recipe", error });
  }
};
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    const imagePath = path.join("uploads", recipe.image);
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error deleting image:", err);
    });

    await recipe.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ success: false, message: "Error deleting recipe" });
  }
};

export const addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = "user-id";

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const newComment = { user: userId, text };
    recipe.comments.push(newComment);

    await recipe.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error });
  }
};

//     let existingUser;
//     try{
//         existingUser=await User.findById(user);

//     }catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: "Error finding user" });
//       }
//     if (!existingUser)
//     {
//         return res.status(400).json({message:"Unable to find user by this id"})
//     }
//     const recipe = new Recipe({
//         title,
//         description,
//         image,
//         user,
//     });
//     const session =await mongoose.startSession();
//     session.startTransaction();
//     try{
//         await recipe.save({session});
//         existingUser.recipes.push(recipe);
//         await existingUser.save({session})
//         await session.commitTransaction();
//         session.endSession();
//     }catch (err) {
//         console.error(err);
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(500).json({ message: "Error adding recipe" });
//       }

// };

// export const updateRecipe = async (req, res, next) => {
//   const { title, description } = req.body;
//   const recipeId = req.params.id;
//   try {
//     const updatedRecipe = await Recipe.findByIdAndUpdate(
//       recipeId,
//       { title, description },
//       { new: true }
//     );
//     if (!updatedRecipe) {
//       return res.status(404).json({ message: "Recipe not found" });
//     }
//     return res.status(200).json({ recipe: updatedRecipe });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error updating recipe" });
//   }
// };

// export const getById = async (req, res, next) => {
//     const userId = req.params.id;
//     try {
//       const userRecipes = await User.findById(userId).populate("recipes");
//       if (!userRecipes) {
//         return res.status(404).json({ message: "User or recipes not found" });
//       }
//       return res.status(200).json({ recipes: userRecipes.recipes });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ message: "Error retrieving user recipes" });
//     }
//   };

// export const getTrendingRecipes = async (req, res, next) => {
//     try {
//       const trendingRecipes = await Recipe.find().sort({ likes: -1 }).limit(5);
//       return res.status(200).json({ trendingRecipes });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ message: "Error retrieving trending recipes" });
//     }
//   };

// export const getByUserId=async(req,res,next)=>
// {
//     const userId=req.params.id;
//     let userRecipes;
//     try{
//         userRecipes=await UserActivation.findById(userId).populate("recipes");
//     }
//     catch(err)
//     {
//         return console.log(err);
//     }
//     if (!userRecipes)
//     {
//         return res.status(404).json({message:"No recipe Found"})
//     }
//     return res.status(200).json({recipes:userRecipes})
// }
