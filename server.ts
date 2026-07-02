import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("Warning: GEMINI_API_KEY is not defined in the environment.");
}

// 1. API Route for Gemini Meditative Thoughts
app.post("/api/gemini/meditation", async (req, res) => {
  try {
    const { nameId, arabicName, transliteration, englishTranslation } = req.body;

    if (!transliteration || !arabicName || !englishTranslation) {
      return res.status(400).json({ error: "Missing required properties (transliteration, arabicName, englishTranslation)." });
    }

    if (!ai) {
      return res.status(500).json({ 
        error: "Gemini API Client is not configured. Please ensure your GEMINI_API_KEY is saved in Settings > Secrets." 
      });
    }

    const prompt = `You are an expert Islamic theologian, spiritual guide, and poet. 
Generate a short, beautifully crafted, contemplative daily meditative thought or inspirational quote (strictly under 60 words) reflecting on the Divine Name of Allah:

Name: ${transliteration} (${arabicName})
Translation: "${englishTranslation}"

Requirements:
1. Make it deep, spiritual, peaceful, and universally inspiring.
2. Focus on how a human being can internalize the qualities of this Divine Name in their daily life (e.g., being merciful, seeking wisdom, or finding peace).
3. Do not include introductory text, explanations, or labels like "Quote:" or "Thought:". Just return the quote itself.
4. Keep it concise, poetic, and elegant.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "Indeed, in the remembrance of Allah do hearts find rest.";
    res.json({ thought: text });
  } catch (error: any) {
    console.error("Error generating Gemini meditation:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error during AI generation." });
  }
});

// 2. Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 3. Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
