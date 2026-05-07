import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer as createViteServer } from "vite";
import * as admin from 'firebase-admin';
import mongoose from 'mongoose';
import { analyzeText } from "./services/readabilityService.ts";
import { Analysis } from "./models/Analysis.ts";

// Initialize MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI && MONGODB_URI.trim() !== "") {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));
} else {
  console.warn("MONGODB_URI is not defined or empty. Database features will be unavailable.");
}

// Initialize Firebase Admin
// In AI Studio, we can use the environment's project ID.
try {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID // This is often available or inferred
  });
} catch (e) {
  console.log("Firebase Admin already initialized or failed. Continuing...");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false, // For development and iframe compatibility
  }));
  app.use(morgan("dev"));
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Readability Analysis Endpoint
  app.post("/api/analyze", async (req, res) => {
    const { text, userId, documentName } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const result = analyzeText(text);
    
    // Save to MongoDB if userId is provided
    if (userId && MONGODB_URI) {
      try {
        await Analysis.create({
          userId,
          documentName: documentName || 'Untitled Document',
          originalText: text,
          metrics: {
            fleschKincaid: result.scores.fleschKincaid,
            readingTime: Math.ceil(result.metrics.words / 200), // Calculation placeholder
            wordCount: result.metrics.words,
            sentenceCount: result.metrics.sentences,
            difficultWords: result.metrics.complexWords,
          }
        });
      } catch (err) {
        console.error("Failed to save analysis to history:", err);
      }
    }
    
    res.json(result);
  });

  // Get History Endpoint
  app.get("/api/history/:userId", async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    try {
      const history = await Analysis.find({ userId }).sort({ createdAt: -1 }).limit(50);
      res.json(history);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Delete History Item
  app.delete("/api/history/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await Analysis.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to delete history item:", err);
      res.status(500).json({ error: "Failed to delete history item" });
    }
  });

  // Stripe Webhook Skeleton
  app.post("/api/webhook/stripe", (req, res) => {
    // Process Stripe events (subscription updates, etc.)
    res.status(200).send("Webhook received");
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const frontendPath = path.resolve(process.cwd(), "frontend");
    // Check if we are inside the backend folder
    const finalFrontendPath = path.basename(process.cwd()) === 'backend' 
      ? path.join(process.cwd(), '..', 'frontend')
      : frontendPath;

    const vite = await createViteServer({
      root: finalFrontendPath,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.basename(process.cwd()) === 'backend'
      ? path.join(process.cwd(), '..', 'frontend', 'dist')
      : path.join(process.cwd(), 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
