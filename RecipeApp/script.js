const API = "80c8d532f05242ebbf727d0c02a69d50";
const foodGrid = document.getElementById("food_grid");
const bookmarkBtn = document.getElementById("bookmark");
const searchInput = document.getElementById("search_input");
const autocompleteResults = document.getElementById("autocomplete_results");

async function getRecipes() {
    const query = searchInput.value;
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API}&query=${query}`);
        const data = await response.json();
        displayRecipes(data.results);
    } catch (error) {
        console.error("Error fetching recipe data:", error);
    }
}

async function displayRecipes(recipes) {
    foodGrid.innerHTML = "";
    recipes.forEach(recipe => {
        const foodItem = document.createElement("div");
        foodItem.classList.add("food_item");
        foodItem.innerHTML = `
            <div class="food_img">
                <img src="${recipe.image}" alt="${recipe.title}">
            </div>
            <div class="food_name">
                <h3>${recipe.title}</h3>
                <div class="buttons_cnt">
                    <button class="recipe_btn" onclick="showRecipe(${recipe.id})">Show Recipe</button>
                    <i class="fa ${isBookmarked(recipe.id) ? 'fa-bookmark' : 'fa-bookmark-o'} bookmark" 
                       onclick="toggleBookmark(${recipe.id}, '${recipe.title}', '${recipe.image}', this)"></i>
                </div>
            </div>
        `;
        foodGrid.appendChild(foodItem);
    });
}

async function autocomplete() {
    const query = searchInput.value;
    if (query.length < 2) {
        autocompleteResults.innerHTML = "";
        return;
    }
    
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/autocomplete?apiKey=${API}&query=${query}&number=10`);
        const suggestions = await response.json();

        autocompleteResults.innerHTML = "";
        suggestions.forEach(suggestion => {
            const item = document.createElement("div");
            item.textContent = suggestion.title;
            item.addEventListener("click", () => {
                searchInput.value = suggestion.title;
                autocompleteResults.innerHTML = "";
                getRecipes();
            });
            autocompleteResults.appendChild(item);
        });
    } catch (error) {
        console.error("Error fetching autocomplete data:", error);
    }
}

function hideAutocompleteResults(event) {
    if (!autocompleteResults.contains(event.target) && event.target !== searchInput) {
        autocompleteResults.innerHTML = "";
    }
}

function isBookmarked(recipeId) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || {};
    return recipeId in favorites;
}

async function showRecipe(recipeId) {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API}`);
        const recipe = await response.json();

        const modal = document.createElement("div");
        modal.classList.add("modal");

        const ingredientsList = recipe.extendedIngredients.map(ingredient => 
            `<li>${ingredient.original}</li>`
        ).join("");

        modal.innerHTML = `
            <div class="modal_content">
                <span class="close_btn" onclick="closeModal()">&times;</span>
                <h2>${recipe.title}</h2>
                <img src="${recipe.image}" alt="${recipe.title}">
                <p>${recipe.summary}</p>
                <br/>
                <h3>Ingredients</h3>
                <br/>
                <ul>${ingredientsList}</ul>
                <br/>
                <h3>Instructions</h3>
                <br/>
                <p>${recipe.instructions || "Instructions not available"}</p>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = "block";
    } catch (error) {
        console.error("Error fetching recipe details:", error);
    }
}

function closeModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}

function toggleBookmark(recipeId, title, image, icon) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || {};

    if (favorites[recipeId]) {
        delete favorites[recipeId];
        icon.classList.remove("fa-bookmark");
        icon.classList.add("fa-bookmark-o");
    } else {
        favorites[recipeId] = { id: recipeId, title, image };
        icon.classList.remove("fa-bookmark-o");
        icon.classList.add("fa-bookmark");
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || {};
    displayRecipes(Object.values(favorites));
}

function openFavoritesPage() {
    window.location.href = "/RecipeApp/favorites.html";
}

function goToSearchPage() {
    window.location.href = "/RecipeApp/index.html";
}

if (document.getElementById('search_btn')) {
    document.getElementById('search_btn').addEventListener("click", getRecipes);
}

window.addEventListener("load", () => {
    if (window.location.pathname.endsWith("favorites.html")) {
        loadFavorites();
    }
});

document.addEventListener("click", hideAutocompleteResults);
bookmarkBtn.addEventListener("click", openFavoritesPage);
searchInput.addEventListener("input", autocomplete);