import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import db from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(cors());
app.use(express.json());

// 1. Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "Online", message: "API Server is running." });
});

// 2. Chat route (Fixed structure and logging)
app.post('/api/assistant/chat', async (req, res) => {
    try {
        const { role, userPrompt } = req.body;
        
        let systemInstruction = role === 'DENTIST' 
            ? "You are an expert Clinical Dental Assistant." 
            : "You are an empathetic patient care assistant.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.4,
            }
        });

        const aiResponse = response.response.text();

        // Save to database
        const chatSql = `INSERT INTO chat_logs (role, prompt, response) VALUES (?, ?, ?)`;
        db.run(chatSql, [role, userPrompt, aiResponse], (err) => {
            if (err) console.error("Database save error:", err.message);
        });

        return res.json({ reply: aiResponse });

    } catch (error) {
        console.error("❌ [Server]: Critical error:", error);
        return res.status(500).json({ error: "Failed to compile AI response." });
    }
});

// 3. Get all patients
app.get('/api/patients', (req, res) => {
    db.all(`SELECT * FROM patients`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to retrieve patients." });
        res.json({ patients: rows });
    });
});

// 4. Save a new patient profile
app.post('/api/patients', (req, res) => {
    const { full_name, dob } = req.body;
    const sql = `INSERT INTO patients (full_name, dob) VALUES (?, ?)`;
    
    db.run(sql, [full_name, dob], function(err) {
        if (err) return res.status(500).json({ error: "Failed to save patient." });
        res.status(201).json({ id: this.lastID, message: "Patient created successfully!" });
    });
});

app.listen(PORT, () => {
  console.log(`🚀 Dental Backend System running on: http://localhost:${PORT}`);
});