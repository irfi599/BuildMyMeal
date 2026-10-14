const Database = require("better-sqlite3");
const db = new Database("./buildmymeal.db");

const meals = [
  {id:1, p:18, c:52, f:16, s:5, a:["milk"], q:[["Paneer","100 g"],["Rice","150 g cooked"],["Tomato","1 medium"]], steps:["Cook the rice until tender.","Chop the tomato and sauté it with spices.","Add paneer and cook thoroughly.","Serve the paneer mixture over rice."]},
  {id:2, p:15, c:50, f:12, s:3, a:["egg"], q:[["Egg","2"],["Rice","150 g cooked"],["Onion","1 small"]], steps:["Cook the rice and set aside.","Chop and sauté the onion.","Add beaten egg and cook fully.","Mix in rice and season to taste."]},
  {id:3, p:10, c:38, f:7, s:8, a:[], q:[["Chickpeas","150 g cooked"],["Tomato","1"],["Lemon","1/2"]], steps:["Drain and rinse the chickpeas.","Chop the tomato.","Mix chickpeas and tomato.","Add lemon juice and serve."]},
  {id:4, p:30, c:55, f:12, s:4, a:[], q:[["Chicken","120 g"],["Rice","150 g cooked"],["Onion","1 small"]], steps:["Cook the rice.","Cook the onion with spices.","Add chicken and cook until fully cooked through.","Serve with the rice."]},
  {id:5, p:10, c:48, f:7, s:15, a:["milk"], q:[["Oats","40 g"],["Banana","1 small"],["Milk","200 ml"]], steps:["Add oats and milk to a saucepan.","Simmer until the oats soften.","Slice the banana.","Top the oats with banana and serve."]},
  {id:6, p:12, c:35, f:12, s:5, a:["wheat","milk"], q:[["Bread","2 slices"],["Tomato","1"],["Cheese","30 g"]], steps:["Place sliced tomato on the bread.","Add cheese.","Toast until the bread is crisp and cheese melts.","Serve warm."]},
  {id:7, p:10, c:32, f:15, s:7, a:["wheat","peanuts"], q:[["Bread","2 slices"],["Peanut butter","2 tbsp"]], steps:["Toast the bread.","Spread peanut butter evenly.","Serve immediately."]},
  {id:8, p:7, c:42, f:8, s:5, a:["wheat"], q:[["Rava","60 g"],["Carrot","1/2 cup"],["Peas","1/4 cup"]], steps:["Dry-roast the rava lightly.","Sauté carrot and peas until tender.","Add water and bring to a simmer.","Stir in rava and cook until thick."]},
  {id:9, p:9, c:48, f:4, s:4, a:[], q:[["Idli","3"],["Lentils","100 g sambar"],["Vegetables","1/2 cup"]], steps:["Steam the idli batter in idli moulds until cooked.","Cook lentils until soft.","Simmer lentils with vegetables and spices.","Serve idli with sambar."]},
  {id:10, p:7, c:38, f:15, s:3, a:["wheat"], q:[["Bread","2 slices"],["Avocado","1/2"],["Lemon","1/2"]], steps:["Toast the bread.","Mash the avocado with lemon juice.","Spread avocado over the toast.","Serve fresh."]},
  {id:11, p:13, c:68, f:9, s:6, a:[], q:[["Kidney beans","150 g cooked"],["Rice","150 g cooked"],["Tomato","1"]], steps:["Soak kidney beans and cook until completely soft.","Cook the tomato with spices.","Add beans and simmer into a curry.","Serve with rice."]},
  {id:12, p:7, c:58, f:10, s:6, a:[], q:[["Rice","180 g cooked"],["Carrot","1/2 cup"],["Beans","1/2 cup"]], steps:["Cook and cool the rice.","Chop the vegetables.","Stir-fry vegetables until tender.","Add rice and season to taste."]},
  {id:13, p:30, c:18, f:12, s:6, a:[], q:[["Chicken","120 g"],["Lettuce","1 cup"],["Tomato","1"]], steps:["Season and grill the chicken until fully cooked.","Wash and chop the vegetables.","Slice the chicken.","Combine and serve."]},
  {id:14, p:18, c:42, f:13, s:5, a:["milk","wheat"], q:[["Paneer","100 g"],["Roti","1"],["Onion","1/2"]], steps:["Cook chopped onion with spices.","Add paneer and heat through.","Warm the roti.","Fill the roti with paneer and roll."]},
  {id:15, p:12, c:55, f:8, s:4, a:[], q:[["Rice","60 g uncooked"],["Lentils","50 g uncooked"],["Spices","to taste"]], steps:["Rinse rice and lentils.","Add to a pot with water and spices.","Simmer until both are soft.","Adjust seasoning and serve."]},
  {id:16, p:18, c:24, f:14, s:6, a:["soy"], q:[["Tofu","150 g"],["Capsicum","1/2"],["Broccoli","1 cup"]], steps:["Drain and cube the tofu.","Chop capsicum and broccoli.","Stir-fry vegetables until tender.","Add tofu and cook until heated through."]},
  {id:17, p:28, c:50, f:12, s:3, a:["fish"], q:[["Fish","120 g"],["Rice","150 g cooked"],["Lemon","1/2"]], steps:["Season the fish with lemon.","Cook fish thoroughly using your preferred method.","Cook the rice.","Serve fish with rice."]},
  {id:18, p:14, c:52, f:18, s:5, a:["wheat","milk"], q:[["Pasta","75 g dry"],["Mushrooms","1 cup"],["Cream","50 ml"]], steps:["Cook pasta according to its packet instructions.","Sauté sliced mushrooms.","Add cream and heat gently.","Mix with pasta and serve."]},
  {id:19, p:9, c:35, f:6, s:24, a:["milk"], q:[["Yogurt","150 g"],["Apple","1/2"],["Banana","1/2"]], steps:["Wash and chop the fruit.","Place yogurt in a bowl.","Add apple and banana.","Mix and serve chilled."]},
  {id:20, p:10, c:28, f:4, s:3, a:[], q:[["Chickpeas","50 g dry"],["Spices","to taste"]], steps:["Soak chickpeas if required by the product.","Cook until tender, then drain and dry.","Roast until crisp, stirring occasionally.","Add spices and cool before serving."]}
];

const update = db.prepare(`
  UPDATE meals SET protein_g=?, carbs_g=?, fat_g=?, sugar_g=?,
    allergens=?, recipe=? WHERE id=?
`);

const transaction = db.transaction(() => {
  for (const m of meals) {
    update.run(
      m.p, m.c, m.f, m.s,
      JSON.stringify(m.a),
      JSON.stringify({
        servings: 1,
        ingredients: m.q.map(([name, quantity]) => ({name, quantity})),
        steps: m.steps,
        nutritionStatus: "Estimated demo values; verify before use"
      }),
      m.id
    );
  }
});

try {
  transaction();
  console.log("Updated meals:", db.prepare("SELECT COUNT(*) AS n FROM meals WHERE recipe IS NOT NULL").get().n);
  console.log("Total meals:", db.prepare("SELECT COUNT(*) AS n FROM meals").get().n);
  console.log("Recipe and demo nutrition data saved.");
} finally {
  db.close();
}
