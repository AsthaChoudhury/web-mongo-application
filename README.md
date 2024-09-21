# Recipe Upload Web Application

A web application to upload and manage recipes, featuring image uploads and text editing for instructions and ingredients.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Features

- User authentication (session-based)
- Upload recipes with images
- Text editing for instructions and ingredients
- Categorization of recipes
- Responsive design

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript, Quill.js
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **File Uploads**: Multer
- **Middleware**: Express-session for session management
- **Package Manager**: npm

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/AsthaChoudhury/web-mongo-application.git
   cd web-mongo-application
2. Install dependencies for the backend:
   ```bash
    cd backend
    npm install
3. Set up MongoDB and update the connection URI in your backend code.
4. Install dependencies for the frontend (if applicable):
   ```bash
    cd frontend
    npm install

## Usage
1. Start the server:
   ```bash
    cd backend
    npm start
2. Open your web browser http://localhost:3000
3. Use the application to upload and manage recipes.

## API Endpoints
- POST **/api/user/register** - Register a new user
- POST **/api/user/login** - Log in a user
- POST **/api/upload-recipe** - Upload a new recipe (requires authentication)

## Sample Request for Recipe Upload
      ```bash
      {
        "title": "Chocolate Cake",
        "description": "A delicious chocolate cake recipe.",
        "prepTime": "30 minutes",
        "cookTime": "1 hour",
        "servings": "8",
        "ingredients": "<p>Flour, Sugar, Cocoa powder, etc.</p>",
        "instructions": "<p>Mix all ingredients...</p>",
        "category": "cakes"
      }

## License
This project is licensed under the MIT License. See the LICENSE file for details.
