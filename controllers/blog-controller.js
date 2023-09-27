import Recipe from "../model/recipes.js";
import User from "../model/user.js";
import mongoose from 'mongoose';

export const getAllRecipes = async (req, res, next) => {
    try {
      const recipes = await Recipe.find();
      return res.status(200).json({ recipes });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error retrieving recipes" });
    }
  };

export const addRecipe = async(req,res,next)=>{
    const{title,description,image,user} = req.body;
    let existingUser;
    try{
        existingUser=await User.findById(user);

    }catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error finding user" });
      }
    if (!existingUser)
    {
        return res.status(400).json({message:"Unable to find user by this id"})
    }
    const recipe = new Recipe({
        title,
        description,
        image,
        user,
    });
    const session =await mongoose.startSession();
    session.startTransaction();
    try{
        await recipe.save({session});
        existingUser.recipes.push(recipe);
        await existingUser.save({session})
        await session.commitTransaction();
        session.endSession();
    }catch (err) {
        console.error(err);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: "Error adding recipe" });
      }
      
};

export const updateRecipe = async (req, res, next) => {
  const { title, description } = req.body;
  const recipeId = req.params.id;
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { title, description },
      { new: true } 
    );
    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    return res.status(200).json({ recipe: updatedRecipe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating recipe" });
  }
};


export const getById = async (req, res, next) => {
    const userId = req.params.id;
    try {
      const userRecipes = await User.findById(userId).populate("recipes");
      if (!userRecipes) {
        return res.status(404).json({ message: "User or recipes not found" });
      }
      return res.status(200).json({ recipes: userRecipes.recipes });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error retrieving user recipes" });
    }
  };

export const deleteRecipe = async(req,res,next)=>
{
    const id = req.params.id;
    let recipe;
    try {
        recipe=await Recipe.findByIdAndRemove(id)
        if (!recipe){
            return res.status(500).json({message:"Unable to delete"})
        }
        return res.status(200).json({message:"Successfully deleted"})
    
    }catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error deleting recipe" });
      }};

export const getTrendingRecipes = async (req, res, next) => {
    try {
      const trendingRecipes = await Recipe.find().sort({ likes: -1 }).limit(5);
      return res.status(200).json({ trendingRecipes });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error retrieving trending recipes" });
    }
  };

  
export const getByUserId=async(req,res,next)=>
{
    const userId=req.params.id;
    let userRecipes;
    try{
        userRecipes=await UserActivation.findById(userId).populate("recipes");
    }
    catch(err)
    {
        return console.log(err);
    }
    if (!userRecipes)
    {
        return res.status(404).json({message:"No recipe Found"})
    }
    return res.status(200).json({recipes:userRecipes})
}