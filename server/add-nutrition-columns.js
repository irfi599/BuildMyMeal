const Database = require("better-sqlite3");
const db = new Database("./buildmymeal.db");

try {
  const existing = new Set(
    db.prepare("PRAGMA table_info(meals)").all().map(c => c.name)
  );

  const additions = {
    protein_g: "REAL",
    carbs_g: "REAL",
    fat_g: "REAL",
    sugar_g: "REAL",
    allergens: "TEXT",
    recipe: "TEXT"
  };

  const migrate = db.transaction(() => {
    for (const [column, type] of Object.entries(additions)) {
      if (!existing.has(column)) {
        db.exec(`ALTER TABLE meals ADD COLUMN ${column} ${type}`);
        console.log(`Added column: ${column}`);
      } else {
        console.log(`Already exists: ${column}`);
      }
    }
  });

  migrate();
  console.log("Database migration completed!");
} finally {
  db.close();
}
