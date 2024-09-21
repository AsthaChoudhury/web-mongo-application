document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.querySelector(".auth-form button");
  const registerButton = document.querySelector(".register-form button");
  const commentToggle = document.querySelector(".comment-toggle");
  const commentSection = document.querySelector(".comment-section");
  const recipeForm = document.getElementById("recipeForm");

  document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginFOrm");
    const registerForm = document.getElementById("registerForm");

    // Handle login form submission with AJAX
    if (loginForm) {
      loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const response = await fetch("http://localhost:3000/api/user/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          window.location.href = "/";
        } else {
          alert("Login failed" + data.message);
        }
      });
    }

    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("registerName").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword =
          document.getElementById("confirm-password").value;

        // Password confirmation check
        if (password !== confirmPassword) {
          alert("Passwords do not match");
          return;
        }

        try {
          const response = await fetch(
            "http://localhost:3000/api/user/register",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name, email, password }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            alert(data.message); // Show success message
            window.location.href = "/"; // Redirect to homepage
          } else {
            alert(`Error: ${data.message}`); // Show error message
          }
        } catch (error) {
          console.error("Error:", error);
        }
      });
    }
  });

  let recipeCount = 0;

  // Handle recipe form submission
  async function handleRecipeFormSubmission(event) {
    event.preventDefault();
    const formData = new FormData(recipeForm);
    try {
      const response = await fetch("/api/recipe/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        window.location.href = "/"; // Redirect to /
      } else {
        console.log("Recipe upload failed: ", response.statusText);
      }
    } catch (error) {
      console.error("Error during recipe upload:", error);
    }
  }

  if (recipeForm) {
    recipeForm.addEventListener("submit", handleRecipeFormSubmission);
  }

  // Handle login button click
  if (loginButton) {
    loginButton.addEventListener("click", () => {
      fetch("login.html") // Fetch login page
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch login page");
          }
          return response.text();
        })
        .then((data) => {
          const mainContainer = document.querySelector(".main");
          mainContainer.innerHTML = data;
        })
        .catch((error) => {
          console.error("Error fetching login page:", error);
        });
    });
  }

  // Handle register button click
  if (registerButton) {
    registerButton.addEventListener("click", () => {
      fetch("register.html") // Fetch register page
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch register page");
          }
          return response.text();
        })
        .then((data) => {
          const mainContainer = document.querySelector(".main");
          mainContainer.innerHTML = data;
        })
        .catch((error) => {
          console.error("Error fetching register page:", error);
        });
    });
  }

  // Handle form submissions
  document.querySelectorAll(".signup-form, .auth-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const endpoint = form.classList.contains("signup-form")
        ? "/api/user/signup"
        : "/api/user/login";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          window.location.href = "/"; // Redirect to /
        } else {
          console.error("Request failed:", response.statusText);
        }
      } catch (error) {
        console.error("Error during form submission:", error);
      }
    });
  });

  // Handle like button clicks
  const likeButtons = document.querySelectorAll(".like-button");
  likeButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const recipeId = event.target.dataset.recipeId;

      try {
        const response = await fetch(`/api/recipe/${recipeId}/like`, {
          method: "POST",
        });
        const data = await response.json();
        const likeIcon = event.target.querySelector(".like-icon");
        recipeCount++;
        document.getElementById("recipe-count").textContent = recipeCount;
        console.log("Liked");
      } catch (error) {
        console.error("Failed to update like:", error);
      }
    });
  });

  // Handle save button clicks
  const saveButtons = document.querySelectorAll(".save-button");
  saveButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const recipeId = event.target.dataset.recipeId;

      try {
        const response = await fetch(`/api/recipe/${recipeId}/save`, {
          method: "POST",
        });
        const data = await response.json();
        console.log("Saved");
      } catch (error) {
        console.error("Save error:", error);
      }
    });
  });

  // Handle comment form submissions
  const commentForms = document.querySelectorAll(".comment-form");
  commentForms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const recipeId = event.target.dataset.recipeId;
      const commentText = form.querySelector(".comment-input").value;

      try {
        const response = await fetch(`/api/recipe/${recipeId}/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: commentText }),
        });
        const data = await response.json();
        const commentContainer = form.querySelector(".comments-container");
        const newComment = document.createElement("div");
        newComment.textContent = commentText;
        commentContainer.appendChild(newComment);
        form.reset();
      } catch (error) {
        console.error("Comment error:", error);
      }
    });
  });

  // Handle comment toggle
  if (commentToggle && commentSection) {
    commentToggle.addEventListener("click", () => {
      commentSection.style.display =
        commentSection.style.display === "none" ? "block" : "none";
    });
  }

  // Display recipes based on the current page
  const currentPage = window.location.pathname;
  if (currentPage === "/wishlist.html") {
    displayLikedRecipes();
  } else if (currentPage === "/cart.html") {
    displaySavedRecipes();
  } else if (currentPage === "/upload.html") {
    displayUploadedRecipes();
  }

  // Display liked recipes
  async function displayLikedRecipes() {
    try {
      const response = await fetch("/api/user/liked-recipes");
      if (response.ok) {
        const likedRecipes = await response.json();
        const recipeGrid = document.querySelector(".recipe-grid");
        recipeGrid.innerHTML = ""; // Clear previous recipes

        likedRecipes.forEach((recipe) => {
          const recipeCard = document.createElement("div");
          recipeCard.classList.add("recipe-card");
          recipeCard.innerHTML = `
                    <a href="/recipe/${recipe.id}">
                        <img src="${recipe.imageUrl}" alt="${recipe.title}">
                        <h3>${recipe.title}</h3>
                    </a>
                `;
          recipeGrid.appendChild(recipeCard);
        });
      } else {
        console.error("Failed to fetch liked recipes:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching liked recipes:", error);
    }
  }

  async function displaySavedRecipes() {
    try {
      const response = await fetch("/api/user/saved-recipes");
      if (response.ok) {
        const savedRecipes = await response.json();
        const recipeGrid = document.querySelector(".recipe-grid");
        recipeGrid.innerHTML = ""; // Clear previous recipes

        savedRecipes.forEach((recipe) => {
          const recipeCard = document.createElement("div");
          recipeCard.classList.add("recipe-card");
          recipeCard.innerHTML = `
                    <a href="/recipe/${recipe.id}">
                        <img src="${recipe.imageUrl}" alt="${recipe.title}">
                        <h3>${recipe.title}</h3>
                    </a>
                `;
          recipeGrid.appendChild(recipeCard);
        });
      } else {
        console.error("Failed to fetch saved recipes:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    }
  }

  // Display uploaded recipes
  async function displayUploadedRecipes() {
    try {
      const response = await fetch("/api/recipe/uploaded");
      if (response.ok) {
        const uploadedRecipes = await response.json();
        const uploadedRecipesContainer = document.querySelector(
          ".uploaded .recipe-card"
        );

        uploadedRecipesContainer.innerHTML = "";

        uploadedRecipes.forEach((recipe) => {
          const recipeCard = document.createElement("div");
          recipeCard.classList.add("recipe-card");
          recipeCard.innerHTML = `<p>${recipe.title}</p>`;
          uploadedRecipesContainer.appendChild(recipeCard);
        });
      } else {
        console.error("Failed to fetch uploaded recipes:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching uploaded recipes:", error);
    }
  }
});
