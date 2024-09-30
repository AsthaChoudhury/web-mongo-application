document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get("recipeId");

  if (!recipeId) {
    console.error("No recipe ID provided");
    return;
  }
  fetch(`/api/recipes/${recipeId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((recipe) => {
      document.getElementById("recipe-title").textContent = recipe.title;
      document.getElementById("prep-time").textContent = recipe.prepTime;
      document.getElementById("cook-time").textContent = recipe.cookTime;
      document.getElementById("servings").textContent = recipe.servings;
      document.getElementById("description").textContent = recipe.description;
      const ingredientsList = document.getElementById("ingredients-list");
      recipe.ingredients.forEach((ingredient) => {
        const li = document.createElement("li");
        li.textContent = ingredient;
        ingredientsList.appendChild(li);
      });
      const methodList = document.getElementById("method-list");
      recipe.method.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        methodList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error fetching recipe:", error);
    });
});
