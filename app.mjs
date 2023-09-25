import express from 'express';
import mongoose from 'mongoose';
import router from './routes/user-routes.js';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import recipesRouter from './routes/recipe-routes.js';
import {fileURLToPath} from 'url';
import {
  getAllRecipes,
  addRecipe,
  updateRecipe,
  getById,
  deleteRecipe,
  getTrendingRecipes,
  getByUserId,
} from './controllers/blog-controller.js'; 

const upload = multer({ dest: 'uploads/' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/user", router);

const frontendPath = path.join(__dirname, 'frontend');

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.use('/api/recipes', recipesRouter);
const mongoURI = 'mongodb+srv://tannishthanair4:WUN6tkGWD1vUbq7D@cluster0.z0gzrbh.mongodb.net/web?retryWrites=true&w=majority';

const connectWithRetry = () => {
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to Mongodb');
    })
    .catch((err) => {
      console.error('Error connecting to Mongodb', err);
      setTimeout(connectWithRetry, 8000);
    });
};

connectWithRetry();

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
