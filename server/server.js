
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Create a local SQLite database
const db = new Database(path.join(__dirname, "buildmymeal.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    diet TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    time INTEGER NOT NULL,
    calories INTEGER NOT NULL,
    ingredients TEXT NOT NULL,
    emoji TEXT,
    description TEXT
  )
`);

// 20 sample meals
const meals = [
  [1, "Paneer Power Bowl", "Vegetarian", "Lunch", 120, 20, 420, ["Paneer", "Rice", "Tomato"], "🥗", "A filling paneer bowl with vegetables."],
  [2, "Masala Egg Rice", "Non-vegetarian", "Lunch", 90, 15, 390, ["Egg", "Rice", "Onion"], "🍳", "Quick egg rice with Indian masala."],
  [3, "Chickpea Salad", "Vegan", "Dinner", 80, 10, 280, ["Chickpeas", "Tomato", "Lemon"], "🥙", "A refreshing chickpea salad."],
  [4, "Chicken Rice Bowl", "Non-vegetarian", "Dinner", 150, 25, 480, ["Chicken", "Rice", "Onion"], "🍗", "A hearty chicken and rice meal."],
  [5, "Banana Oat Bowl", "Vegetarian", "Breakfast", 50, 5, 300, ["Oats", "Banana", "Milk"], "🥣", "Oats and banana for breakfast."],
  [6, "Tomato Cheese Toast", "Vegetarian", "Breakfast", 60, 10, 320, ["Bread", "Tomato", "Cheese"], "🍞", "Toast topped with tomato and cheese."],
  [7, "Peanut Butter Toast", "Vegan", "Breakfast", 45, 5, 290, ["Bread", "Peanut butter"], "🥜", "Toast with peanut butter."],
  [8, "Vegetable Upma", "Vegan", "Breakfast", 40, 15, 250, ["Rava", "Carrot", "Peas"], "🥣", "South Indian vegetable upma."],
  [9, "Idli and Sambar", "Vegan", "Breakfast", 50, 20, 280, ["Idli", "Lentils", "Vegetables"], "🥘", "Soft idlis served with sambar."],
  [10, "Avocado Toast", "Vegan", "Breakfast", 100, 10, 310, ["Bread", "Avocado", "Lemon"], "🥑", "Avocado on crunchy toast."],
  [11, "Rajma Rice", "Vegetarian", "Lunch", 90, 25, 430, ["Kidney beans", "Rice", "Tomato"], "🍚", "Rajma curry served with rice."],
  [12, "Veggie Fried Rice", "Vegan", "Lunch", 80, 15, 350, ["Rice", "Carrot", "Beans"], "🥕", "Colorful vegetable fried rice."],
  [13, "Grilled Chicken Salad", "Non-vegetarian", "Lunch", 140, 20, 360, ["Chicken", "Lettuce", "Tomato"], "🥗", "Grilled chicken with fresh salad."],
  [14, "Paneer Wrap", "Vegetarian", "Lunch", 100, 15, 390, ["Paneer", "Roti", "Onion"], "🌯", "Spiced paneer wrapped in roti."],
  [15, "Dal Khichdi", "Vegetarian", "Dinner", 70, 25, 340, ["Rice", "Lentils", "Spices"], "🍲", "Comforting rice and lentil khichdi."],
  [16, "Tofu Stir Fry", "Vegan", "Dinner", 110, 20, 320, ["Tofu", "Capsicum", "Broccoli"], "🥦", "Tofu with colorful vegetables."],
  [17, "Fish Rice Bowl", "Non-vegetarian", "Dinner", 160, 25, 450, ["Fish", "Rice", "Lemon"], "🐟", "Fish served with rice and lemon."],
  [18, "Mushroom Pasta", "Vegetarian", "Dinner", 130, 20, 440, ["Pasta", "Mushrooms", "Cream"], "🍝", "Creamy mushroom pasta."],
  [19, "Fruit Yogurt Bowl", "Vegetarian", "Snack", 60, 5, 220, ["Yogurt", "Apple", "Banana"], "🍓", "Yogurt topped with fresh fruit."],
  [20, "Roasted Chana Snack", "Vegan", "Snack", 30, 5, 180, ["Chickpeas", "Spices"], "🥜", "A crunchy, protein-rich snack."]
];

// Insert sample meals without duplicating existing IDs
const insertMeal = db.prepare(`
  INSERT OR IGNORE INTO meals
  (id, name, diet, category, price, time, calories, ingredients, emoji, description)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAll = db.transaction(() => {
  for (const meal of meals) {
    insertMeal.run(
      meal[0],
      meal[1],
      meal[2],
      meal[3],
      meal[4],
      meal[5],
      meal[6],
      JSON.stringify(meal[7]),
      meal[8],
      meal[9]
    );
  }
});

insertAll();

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BuildMyMeal API!",
    status: "running"
  });
});

// Get and filter meals
app.get("/api/meals", (req, res) => {
  try {
    const { diet, category, maxBudget, maxTime } = req.query;
    const conditions = [];
    const values = [];

    if (diet && diet !== "All") {
      conditions.push("diet = ?");
      values.push(diet);
    }

    if (category && category !== "All") {
      conditions.push("category = ?");
      values.push(category);
    }

    if (maxBudget !== undefined && maxBudget !== "") {
      const budget = Number(maxBudget);
      if (!Number.isFinite(budget) || budget < 0) {
        return res.status(400).json({ message: "Invalid maxBudget" });
      }
      conditions.push("price <= ?");
      values.push(budget);
    }

    if (maxTime !== undefined && maxTime !== "") {
      const time = Number(maxTime);
      if (!Number.isFinite(time) || time < 0) {
        return res.status(400).json({ message: "Invalid maxTime" });
      }
      conditions.push("time <= ?");
      values.push(time);
    }

    const where = conditions.length
      ? "WHERE " + conditions.join(" AND ")
      : "";

    const rows = db.prepare(
      `SELECT * FROM meals ${where} ORDER BY id`
    ).all(...values);

    const result = rows.map((meal) => ({
  ...meal,
  ingredients: JSON.parse(meal.ingredients),
  allergens: meal.allergens ? JSON.parse(meal.allergens) : [],
  recipe: meal.recipe ? JSON.parse(meal.recipe) : null
}));

    res.json({ count: result.length, meals: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch meals" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("SQLite connected successfully!");
  console.log(`BuildMyMeal API running on port ${PORT}`);
  console.log(
    "Meals available:",
    db.prepare("SELECT COUNT(*) AS count FROM meals").get().count
  );
});
