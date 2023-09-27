document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.querySelector('.auth-form button');
  const registerButton = document.querySelector('.register-form button');
  const commentToggle = document.querySelector(".comment-toggle");
  const commentSection = document.querySelector(".comment-section");
  const recipeForm = document.getElementById('recipeForm');

  let recipeCount=0;

async function handleRecipeFormSubmission(event){
    event.preventDefault();
    const formData=new FormData(recipeForm);
    try{
      const response = await fetch('../api/recipe/upload',{
        method:' POST',
        body: formData,
      });
      if(response.ok){
        window.location.href = 'index.html';
      }
      else{
        console.log('Recipe upload failed: ',response.statusText);
      }

    }
    catch(error){
      console.error('Error during recipe upload:',error);
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    const recipeForm = document.getElementById('recipeForm');
    if (recipeForm) {
      recipeForm.addEventListener('submit', handleRecipeFormSubmission);
    }
  });

  if(loginButton){
    loginButton.addEventListener('click', () => {
      fetch('login.html')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch login page');
          }
          return response.text();
        })
        .then(data => {
          const mainContainer = document.querySelector('.main');
          mainContainer.innerHTML = data;
        })
        .catch(error => {
          console.error('Error fetching login page:', error);
        });
    });
  }

  
  const currentPage = window.location.pathname;
  if(currentPage === '/wishlist.html'){
    displayLikedRecipes();
  }
  else if(currentPage === '/cart.html'){
    displaySavedRecipes();
  }

 if(registerButton){
  registerButton.addEventListener('click', () => {
    console.log('Register button clicked'); 
    fetch('register.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch register page');
        }
        return response.text();
      })
      .then(data => {
        const mainContainer = document.querySelector('.main');
        mainContainer.innerHTML = data;
      })
      .catch(error => {
        console.error('Error fetching register page:', error);
      });
  });

 }
  document.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const form = event.target;
  
    if (form.classList.contains('signup-form')) {
      const formData = new FormData(form);
  
      try {
        const response = await fetch('../api/user/signup', {
          method: 'POST',
          body: formData,
        });
  
        
        if (response.ok) {
          window.location.href = 'index.html';
        } else {
          console.error('Signup failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error during signup:', error);
      }
    } else if (form.classList.contains('auth-form')) {
      const formData = new FormData(form);
  
      try {
        const response = await fetch('../api/user/login', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          window.location.href = 'index.html';
        } else {
          console.error('Login failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error during login:', error);
      }
    }
  });
  

  const likeButtons = document.querySelectorAll('.like-button');
  likeButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const recipeId = event.target.dataset.recipeId;

      try {
        const response = await fetch(`/api/recipe/${recipeId}/like`, {
          method: 'POST',
        });
        const data = await response.json();
        const likeIcon = event.target.querySelector('.like-icon');
        recipeCount++;
        document.getElementById('recipe-count').textContent = recipeCount;
        console.log('Liked');
      } catch (error) {
        console.error('Failed to update like:', error);
      }
    });
  });

  const saveButtons = document.querySelectorAll('.save-button');
  saveButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const recipeId = event.target.dataset.recipeId;

      try {
        const response = await fetch(`/api/recipe/${recipeId}/save`, {
          method: 'POST',
        });
        const data = await response.json();
        const saveIcon = event.target.querySelector('.save-icon');
        console.log('Saved');
      } catch (error) {
        console.error('Save error:', error);
      }
    });
  });

  const commentForms = document.querySelectorAll('.comment-form');
  commentForms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const recipeId = event.target.dataset.recipeId;
      const commentText = form.querySelector('.comment-input').value;

      try {
        const response = await fetch(`/api/recipe/${recipeId}/comment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment: commentText }),
        });
        const data = await response.json();
        const commentContainer = form.querySelector('.comments-container');
        const newComment = document.createElement('div');
        newComment.textContent = commentText;
        commentContainer.appendChild(newComment);
        form.reset();
      } catch (error) {
        console.error('Comment error:', error);
      }
    });
  });


  if (commentToggle && commentSection) {
    commentToggle.addEventListener("click", () => {
      commentSection.style.display = commentSection.style.display === "none" ? "block" : "none";
    });
  }
    async function displayLikedRecipes() {
      try {
        const response = await fetch('../api/user/liked-recipes'); 
        if (response.ok) {
          const likedRecipes = await response.json();
          const wishlistContainer = document.querySelector('.liked-recipes .recipe-card'); 
          wishlistContainer.innerHTML = ''; 
  

          likedRecipes.forEach((recipe) => {
            const recipeCard = document.createElement('div');
            recipeCard.innerHTML = `<p>${recipe.title}</p>`;
  
            wishlistContainer.appendChild(recipeCard);
          });
        } else {
          console.error('Failed to fetch liked recipes:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching liked recipes:', error);
      }
    }


    async function displaySavedRecipes() {
      try {
        const response = await fetch('../api/user/saved-recipes'); 
        if (response.ok) {
          const savedRecipes = await response.json();
          const cartContainer = document.querySelector('.saved-recipes .recipe-card');
          cartContainer.innerHTML = ''; 
          
          savedRecipes.forEach((recipe) => {
            const recipeCard = document.createElement('div');
            recipeCard.innerHTML = `<p>${recipe.title}</p>`;
  
            cartContainer.appendChild(recipeCard);
          });
        } else {
          console.error('Failed to fetch saved recipes:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
      }
    }
  
    async function displayUploadedRecipes() {
      try {
        const response = await fetch('../api/recipe/uploaded'); 
        if (response.ok) {
          const uploadedRecipes = await response.json();
          const uploadedRecipesContainer = document.querySelector('.uploaded .recipe-card');
  
          uploadedRecipesContainer.innerHTML = '';
  
          uploadedRecipes.forEach((recipe) => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.innerHTML = `<p>${recipe.title}</p>`;
  
            uploadedRecipesContainer.appendChild(recipeCard);
          });
        } else {
          console.error('Failed to fetch uploaded recipes:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching uploaded recipes:', error);
      }
    }
  
    if (currentPage === '/wishlist.html') {
      displayLikedRecipes();
    } else if (currentPage === '/cart.html') {
      displaySavedRecipes();
    } else if (currentPage === '/upload.html') {
      displayUploadedRecipes();
    }
  });
