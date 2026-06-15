import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./dental_practice.db');

db.serialize(() => {
    // 1. Existing Chat Logs Table
    db.run(`CREATE TABLE IF NOT EXISTS chat_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT,
        prompt TEXT,
        response TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. New Patients Table
    db.run(`CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        dob DATE,
        contact_number TEXT,
        medical_history TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});
export default db;