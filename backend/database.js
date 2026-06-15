const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'user_data.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening user DB:", err.message);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS mistakes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL UNIQUE,
            paper_id INTEGER NOT NULL,
            error_count INTEGER DEFAULT 1,
            last_error_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS study_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paper_id INTEGER NOT NULL,
            score INTEGER,
            total INTEGER,
            study_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL UNIQUE,
            paper_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

module.exports = db;
