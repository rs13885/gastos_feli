const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../expenses.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    item TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    percentage REAL NOT NULL DEFAULT 0.5,
    proportional REAL NOT NULL DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    percentage REAL NOT NULL DEFAULT 0.70,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );
`);

const catCount = db.prepare('SELECT COUNT(*) as n FROM categories').get();
if (catCount.n === 0) {
  const ins = db.prepare('INSERT INTO categories (name, percentage) VALUES (?, ?)');
  db.transaction(() => {
    ins.run('Vivienda',  0.25);
    ins.run('Salud',     0.70);
    ins.run('Educación', 0.70);
    ins.run('Alimentos', 0.25);
    ins.run('Otros',     0.70);
  })();
  console.log('Default categories seeded.');
}

module.exports = db;
