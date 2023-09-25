import express from 'express';
const router = express.Router();
import multer from 'multer';
const upload = multer({dest:'uploads/'});

router.post('/', upload.single('image'), async (req, res) => {
    try {
      const { title, description, ingredients, instructions, category } = req.body;
      const imagePath = req.file.path; 
  
      const newRecipe = new Recipe({
        title,
        description,
        ingredients,
        instructions,
        category, 
        image: imagePath, 
      });

    const savedRecipe = await newRecipe.save();

    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ error: 'Failed to add recipe' });
  }
});

router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error retrieving recipes:', error);
    res.status(500).json({ error: 'Failed to retrieve recipes' });
  }
});

export default router;
