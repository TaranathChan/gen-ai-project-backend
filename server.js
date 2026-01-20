// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();

// =========================
// Config
// =========================
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY not set");
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// =========================
// Middleware
// =========================
app.use(cors()); // allow all origins (dev only)
app.use(express.json());

// =========================
// Routes
// =========================

// Health check
app.get("/", (req, res) => {
  res.json({ status: "running" });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const message = req.body.message;

  if (!message || !message.trim()) {
    return res.status(400).json({ detail: "Empty message" });
  }

  const start = Date.now();

  try {
    const payload = {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
    };

    const headers = {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(GROQ_URL, payload, { headers });

    const reply = response.data.choices[0].message.content;
    const latency = Date.now() - start;

    res.json({
      reply,
      model_used: "groq-llama3",
      latency_ms: latency,
    });
  } catch (error) {
    console.error(error);
    const status = error.response?.status || 500;
    const detail = error.response?.data || error.message;
    res.status(status).json({ detail });
  }
});

// =========================
// Start server
// =========================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
