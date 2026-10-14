
import { useEffect, useState } from "react";
import "./App.css";

const availableIngredients = [
  "Rice", "Egg", "Paneer", "Chicken", "Tomato", "Onion",
  "Oats", "Banana", "Milk", "Chickpeas", "Lemon", "Bread", "Cheese",
];

const allergenOptions = [
  "peanuts", "milk", "egg", "soy", "wheat", "fish",
  "shellfish", "tree nuts", "sesame",
];

function parseJson(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function App() {
  const [meals, setMeals] = useState([]);
  const [diet, setDiet] = useState("Any");
  const [category, setCategory] = useState("Any");
  const [budget, setBudget] = useState(150);
  const [time, setTime] = useState("Any");
  const [selected, setSelected] = useState([]);
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [servingsByMeal, setServingsByMeal] = useState({});
  const [expandedRecipes, setExpandedRecipes] = useState([]);

  const [profileAllergies, setProfileAllergies] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("buildmymeal-allergies") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [profileDiet, setProfileDiet] = useState(() =>
    localStorage.getItem("buildmymeal-diet") || "Any"
  );

  useEffect(() => {
    localStorage.setItem(
      "buildmymeal-allergies",
      JSON.stringify(profileAllergies)
    );
  }, [profileAllergies]);

  useEffect(() => {
    localStorage.setItem("buildmymeal-diet", profileDiet);
  }, [profileDiet]);

  const results = meals.filter((meal) => {
    const dietMatch = diet === "Any" || meal.diet === diet;
    const profileDietMatch =
      profileDiet === "Any" || meal.diet === profileDiet;
    const categoryMatch =
      category === "Any" || meal.category === category;
    const budgetMatch = Number(meal.price) <= budget;
    const timeMatch =
      time === "Any" || Number(meal.time) <= Number(time);

    const ingredientsMatch =
      selected.length === 0 ||
      selected.some((ingredient) =>
        (meal.ingredients || []).some(
          (item) =>
            item.toLowerCase() === ingredient.toLowerCase()
        )
      );

    const favoriteMatch =
      view !== "favorites" || favorites.includes(meal.id);

    return (
      dietMatch &&
      profileDietMatch &&
      categoryMatch &&
      budgetMatch &&
      timeMatch &&
      ingredientsMatch &&
      favoriteMatch
    );
  });

  function toggleIngredient(ingredient) {
    setSelected((previous) =>
      previous.includes(ingredient)
        ? previous.filter((item) => item !== ingredient)
        : [...previous, ingredient]
    );
  }

  function toggleFavorite(mealId) {
    setFavorites((previous) =>
      previous.includes(mealId)
        ? previous.filter((id) => id !== mealId)
        : [...previous, mealId]
    );
  }

  function toggleAllergy(allergen) {
    setProfileAllergies((previous) =>
      previous.includes(allergen)
        ? previous.filter((item) => item !== allergen)
        : [...previous, allergen]
    );
  }

  function toggleRecipe(mealId) {
    setExpandedRecipes((previous) =>
      previous.includes(mealId)
        ? previous.filter((id) => id !== mealId)
        : [...previous, mealId]
    );
  }

  function getMatchingAllergies(meal) {
    const mealAllergens = parseJson(meal.allergens, []);
    const safeAllergens = Array.isArray(mealAllergens)
      ? mealAllergens
      : [];

    return profileAllergies.filter((allergen) =>
      safeAllergens.includes(allergen)
    );
  }

  async function generateMeals() {
    setSearched(true);
    setView("all");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/meals"
      );

      if (!response.ok) {
        throw new Error("Could not load meals from the server.");
      }

      const data = await response.json();
      const fetchedMeals = Array.isArray(data)
        ? data
        : data.meals || [];

      const normalisedMeals = fetchedMeals.map((meal) => ({
        ...meal,
        ingredients: parseJson(meal.ingredients, []),
        allergens: parseJson(meal.allergens, []),
        recipe: parseJson(meal.recipe, null),
      }));

      setMeals(normalisedMeals);
      setMessage(
        `Connected successfully! ${normalisedMeals.length} meals loaded from the database.`
      );
    } catch (error) {
      setMessage(
        "Could not connect to the backend. Make sure your server is running on port 5000."
      );
      console.error("Error loading meals:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <a
          href="#home"
          className="brand"
          onClick={() => setView("all")}
        >
          <span className="brand-icon">🥗</span>
          <span>BuildMyMeal</span>
        </a>

        <button
          className={`nav-link ${view === "favorites" ? "active" : ""}`}
          onClick={() => {
            setView("favorites");
            setSearched(true);
          }}
        >
          ♡ Saved meals ({favorites.length})
        </button>
      </nav>

      <main id="home">
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">YOUR PERSONAL MEAL PLANNER</span>
            <h1>
              Good food.
              <br />
              <span>Made for you.</span>
            </h1>
            <p>
              Find meals that fit your diet, budget, ingredients,
              cooking time, and nutrition preferences.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                document.getElementById("planner")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Plan your meal <span>→</span>
            </button>
          </div>

          <div className="hero-image">
            <img
              src="/hero.png"
              alt="A delicious meal"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <div className="hero-image-fallback">🥙</div>
          </div>
        </section>

        <section className="stats-row">
          <div className="stat">
            <strong>{meals.length || 20}+</strong>
            <span>Meal ideas</span>
          </div>
          <div className="stat">
            <strong>₹40+</strong>
            <span>Budget friendly</span>
          </div>
          <div className="stat">
            <strong>30 min</strong>
            <span>Quick recipes</span>
          </div>
        </section>

        <section className="planner-section" id="planner">
          <div className="section-heading">
            <span className="eyebrow">LET'S GET COOKING</span>
            <h2>Your meal, your way.</h2>
            <p>
              Personalise your food profile and discover meals
              that match your lifestyle.
            </p>
          </div>

          <div className="planner-layout">
            <aside className="filters-panel">
              <div className="filter-heading">
                <h3>Personalise your plan</h3>
                <button
                  className="reset-button"
                  onClick={() => {
                    setDiet("Any");
                    setCategory("Any");
                    setBudget(150);
                    setTime("Any");
                    setSelected([]);
                    setView("all");
                  }}
                >
                  Reset filters
                </button>
              </div>

              <div className="profile-panel">
                <h3>🌿 My food profile</h3>
                <p>
                  Save your dietary preference and allergies.
                  Your profile stays in this browser.
                </p>

                <div className="filter-group">
                  <label htmlFor="profileDiet">Preferred diet</label>
                  <select
                    id="profileDiet"
                    value={profileDiet}
                    onChange={(event) =>
                      setProfileDiet(event.target.value)
                    }
                  >
                    <option value="Any">No preference</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Non-vegetarian">
                      Non-vegetarian
                    </option>
                  </select>
                </div>

                <strong className="allergy-label">Allergies to flag</strong>

                <div className="allergy-list">
                  {allergenOptions.map((allergen) => (
                    <label className="allergy-option" key={allergen}>
                      <input
                        type="checkbox"
                        checked={profileAllergies.includes(allergen)}
                        onChange={() => toggleAllergy(allergen)}
                      />
                      <span>
                        {allergen.charAt(0).toUpperCase() +
                          allergen.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>

                <p className="profile-note">
                  Allergy alerts only check recorded ingredients.
                  Always verify packaging and preparation details.
                </p>
              </div>

              <div className="filter-group">
                <label htmlFor="diet">Meal diet filter</label>
                <select
                  id="diet"
                  value={diet}
                  onChange={(event) => setDiet(event.target.value)}
                >
                  <option value="Any">Any diet</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Non-vegetarian">
                    Non-vegetarian
                  </option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="category">Meal category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="Any">Any category</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="time">Maximum cooking time</label>
                <select
                  id="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                >
                  <option value="Any">Any time</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
              </div>

              <div className="filter-group">
                <div className="range-heading">
                  <label htmlFor="budget">Your budget</label>
                  <strong>₹{budget}</strong>
                </div>
                <input
                  id="budget"
                  type="range"
                  min="40"
                  max="200"
                  step="10"
                  value={budget}
                  onChange={(event) =>
                    setBudget(Number(event.target.value))
                  }
                />
                <div className="range-labels">
                  <span>₹40</span>
                  <span>₹200</span>
                </div>
              </div>

              <div className="filter-group">
                <div className="ingredients-heading">
                  <label>Ingredients you have</label>
                  <small>Optional · Select any</small>
                </div>

                <div className="ingredient-list">
                  {availableIngredients.map((ingredient) => (
                    <button
                      type="button"
                      key={ingredient}
                      className={`ingredient-chip ${
                        selected.includes(ingredient) ? "selected" : ""
                      }`}
                      onClick={() => toggleIngredient(ingredient)}
                    >
                      {selected.includes(ingredient) ? "✓ " : "+ "}
                      {ingredient}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="primary-button generate-button"
                onClick={generateMeals}
                disabled={loading}
              >
                {loading ? "Finding meals..." : "Find my meals"}
                <span>→</span>
              </button>
            </aside>

            <div className="results-panel">
              <div className="results-heading">
                <div>
                  <span className="eyebrow">
                    {view === "favorites"
                      ? "YOUR COLLECTION"
                      : "MADE TO MATCH"}
                  </span>
                  <h3>
                    {view === "favorites"
                      ? "Your saved meals"
                      : "Meals you'll love"}
                  </h3>
                </div>

                <span className="result-count">
                  {results.length} {results.length === 1 ? "meal" : "meals"}
                </span>
              </div>

              {message && <p className="api-message">{message}</p>}

              {!searched && view === "all" && (
                <div className="empty-state">
                  <span className="empty-emoji">🍽️</span>
                  <h4>Your next favourite is waiting.</h4>
                  <p>
                    Choose your preferences and tap "Find my meals"
                    to discover meals from your database.
                  </p>
                </div>
              )}

              {searched && loading && (
                <div className="empty-state">
                  <span className="empty-emoji">🥗</span>
                  <h4>Finding your meals...</h4>
                  <p>Connecting to your meal database.</p>
                </div>
              )}

              {searched && !loading && results.length > 0 && (
                <div className="meal-grid">
                  {results.map((meal) => {
                    const servings = servingsByMeal[meal.id] || 1;
                    const matchingAllergies = getMatchingAllergies(meal);
                    const recipe = parseJson(meal.recipe, null);
                    const highSugar = Number(meal.sugar_g) >= 15;

                    const nutrition = [
                      ["Calories", meal.calories, "kcal"],
                      ["Protein", meal.protein_g, "g"],
                      ["Carbs", meal.carbs_g, "g"],
                      ["Fat", meal.fat_g, "g"],
                      ["Sugar", meal.sugar_g, "g"],
                    ];

                    const recipeIngredients = Array.isArray(recipe?.ingredients)
                      ? recipe.ingredients
                      : [];

                    return (
                      <article className="meal-card" key={meal.id}>
                        <div className="meal-card-top">
                          <span className="meal-emoji">
                            {meal.emoji || "🍽️"}
                          </span>

                          <button
                            className={`favorite-button ${
                              favorites.includes(meal.id) ? "favorited" : ""
                            }`}
                            onClick={() => toggleFavorite(meal.id)}
                            aria-label={
                              favorites.includes(meal.id)
                                ? "Remove from saved meals"
                                : "Save meal"
                            }
                          >
                            {favorites.includes(meal.id) ? "♥" : "♡"}
                          </button>
                        </div>

                        <div className="meal-tags">
                          <span>{meal.diet}</span>
                          <span>{meal.category}</span>
                        </div>

                        <h4>{meal.name}</h4>
                        <p className="meal-description">{meal.description}</p>

                        <div className="meal-meta">
                          <span>₹{meal.price}</span>
                          <span>◷ {meal.time} min</span>
                          <span>{meal.calories} cal</span>
                        </div>

                        {matchingAllergies.length > 0 && (
                          <div className="allergy-warning" role="alert">
                            <strong>⚠ Allergy alert</strong>
                            <p>
                              Recorded allergen match:{" "}
                              {matchingAllergies.join(", ")}.
                              Avoid this meal if you are allergic.
                            </p>
                          </div>
                        )}

                        {highSugar && (
                          <div className="sugar-warning">
                            <strong>ⓘ Higher sugar</strong>
                            <p>
                              This meal has {meal.sugar_g} g of sugar
                              per serving (estimated).
                            </p>
                          </div>
                        )}

                        <div className="meal-ingredients">
                          <strong>Ingredients</strong>
                          <p>{(meal.ingredients || []).join(", ")}</p>
                        </div>

                        <div className="nutrition-section">
                          <h5>Nutrition calculator</h5>
                          <label htmlFor={`servings-${meal.id}`}>
                            Number of servings
                          </label>
                          <select
                            id={`servings-${meal.id}`}
                            value={servings}
                            onChange={(event) =>
                              setServingsByMeal((previous) => ({
                                ...previous,
                                [meal.id]: Number(event.target.value),
                              }))
                            }
                          >
                            {[1, 2, 3, 4, 5].map((number) => (
                              <option key={number} value={number}>
                                {number} {number === 1 ? "serving" : "servings"}
                              </option>
                            ))}
                          </select>

                          <div className="nutrition-grid">
                            {nutrition.map(([label, amount, unit]) => (
                              <div className="nutrition-item" key={label}>
                                <span>{label}</span>
                                <strong>
                                  {amount == null
                                    ? "N/A"
                                    : `${Number(amount) * servings} ${unit}`}
                                </strong>
                              </div>
                            ))}
                          </div>

                          <p className="nutrition-disclaimer">
                            Estimated demo values, not verified nutrition
                            facts. Actual values vary by ingredients and portions.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="recipe-toggle"
                          onClick={() => toggleRecipe(meal.id)}
                        >
                          {expandedRecipes.includes(meal.id)
                            ? "Hide quantities ↑"
                            : "View ingredient quantities →"}
                        </button>

                        {expandedRecipes.includes(meal.id) && (
                          <div className="recipe-details">
                            <h5>Ingredients and quantities</h5>

                            {recipeIngredients.length > 0 ? (
                              <ul>
                                {recipeIngredients.map((item, index) => {
                                  const quantity = item.quantity || "As needed";
                                  const displayQuantity =
                                    servings === 1
                                      ? quantity
                                      : `${quantity} × ${servings} servings`;

                                  return (
                                    <li key={`${item.name}-${index}`}>
                                      <span>{item.name}</span>
                                      <strong>{displayQuantity}</strong>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p>
                                Ingredient quantities are currently unavailable
                                for this meal.
                              </p>
                            )}

                            <p className="nutrition-disclaimer">
                              Quantities are estimates for one serving.
                              Multiply them by the selected serving count.
                              Check ingredient packaging for allergen information.
                            </p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

              {searched &&
                !loading &&
                results.length === 0 &&
                !message.startsWith("Could not connect") && (
                  <div className="empty-state">
                    <span className="empty-emoji">🥣</span>
                    <h4>No matching meals found.</h4>
                    <p>
                      Try changing your filters or saved dietary preference.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>BuildMyMeal · Good food, made simple.</p>
      </footer>
    </div>
  );
}

export default App;
