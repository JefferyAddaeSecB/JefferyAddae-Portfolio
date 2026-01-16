// Load environment variables first
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Log environment configuration
console.log('Environment Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  EMAIL_USER: process.env.EMAIL_USER,
  HAS_EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
  PORT: process.env.PORT || 3000
});

// Import other dependencies after environment is loaded
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import cors from "cors";
import http from "http";
import serverless from "serverless-http";
import schedule from "node-schedule";
import { completeExpiredAppointmentsJob } from "./jobs/completeAppointments";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any;
  
  const originalResJson = res.json;
  res.json = function(bodyJson: any) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(res, bodyJson);
  };
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(logLine);
    }
  });
  
  next();
});

// Initialize server
async function initializeServer() {
  try {
    await registerRoutes(app);
    
    // Initialize scheduled job to complete expired appointments every 30 minutes
    // Runs at :00 and :30 of every hour
    schedule.scheduleJob("*/30 * * * *", async () => {
      try {
        console.log("[Scheduled Job] Starting expired appointments completion...");
        await completeExpiredAppointmentsJob();
        console.log("[Scheduled Job] ✅ Expired appointments completion finished");
      } catch (error) {
        console.error("[Scheduled Job] ❌ Error completing expired appointments:", error);
        // Don't throw - let the job fail gracefully and retry next run
      }
    });
    console.log("[Scheduled Jobs] Appointment completion job initialized (runs every 30 min)");
    
    // Error handling middleware MUST be after routes
    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Error:", err);
      res.status(status).json({ message });
      // Don't throw here - it can cause unhandled promise rejections and crash the server
    });
    
    // Don't initialize Vite here - do it after server.listen() to avoid file watch conflicts
    if (process.env.NODE_ENV !== "development" && !process.env.VERCEL) {
      serveStatic();
    }
    
    return app;
  } catch (error) {
    console.error("Failed to initialize server:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Initialize app once for Vercel
let cachedApp: express.Application | null = null;
let wrappedApp: any = null;

// Export for Vercel
export default async function handler(req: any, res: any) {
  try {
    if (!wrappedApp) {
      if (!cachedApp) {
        cachedApp = await initializeServer();
      }
      wrappedApp = serverless(cachedApp);
    }
    return wrappedApp(req, res);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Start server only if not running on Vercel
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  (async () => {
    let serverInitialized = false;
    
    try {
      await initializeServer();
      serverInitialized = true;
    } catch (error) {
      console.error("Failed to initialize server:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
      // Continue anyway - server can still start and handle basic requests
      console.error("Warning: Server starting with limited functionality");
    }

    const port = process.env.PORT || 3000;
    
    // Check if port is already in use before trying to listen
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${port} is already in use.`);
        console.error(`Please either:`);
        console.error(`  1. Kill the process using port ${port}`);
        console.error(`  2. Set PORT environment variable to a different port (e.g., PORT=3001)`);
        console.error(`\nTo find the process: netstat -ano | findstr :${port}\n`);
        // In development, don't exit - let tsx watch handle retries
        // But log the error so user knows what to do
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
      } else {
        console.error('Server error:', err);
      }
    });

    server.listen(port, async () => {
      console.log('\n🚀 Server is running!');
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`📧 Email configured: ${!!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD}`);
      console.log(`🌐 Server URL: http://localhost:${port}`);
      console.log(`🎨 Frontend URL: http://localhost:${port}`);
      
      // Initialize Vite AFTER server is listening to prevent file watch conflicts
      // In development we always initialize the Vite middleware so the SPA is served
      if (process.env.NODE_ENV === "development") {
        try {
          console.log('Initializing Vite dev server...');
          await setupVite(app, server);
          console.log('✅ Vite dev server initialized');
        } catch (viteError) {
          console.error("Warning: Failed to setup Vite:", viteError);
          console.error("Server will continue without Vite dev server");
        }
      }
      
      if (serverInitialized) {
        console.log('\n📋 Available endpoints:');
        console.log(`   - GET  /api/test-email`);
        console.log(`   - POST /api/contact`);
      }
      console.log('\n💡 Tip: Use Ctrl+C to stop the server\n');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit in development mode to allow watch mode to work
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // Don't exit in development mode to allow watch mode to work
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
  })();
}

const serveStatic = () => {
  // On Vercel, static files are in a different location
  const possiblePaths = [
    path.resolve(__dirname, "..", "dist", "public"),
    path.resolve(__dirname, "public"),
    path.resolve(process.cwd(), "client", "dist")
  ];
  
  let distPath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      break;
    }
  }
  
  console.log("Serving static files from:", distPath);
  console.log("Static path exists:", fs.existsSync(distPath));

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application not built");
      }
    });
  } else {
    console.warn("Warning: Static files directory not found at any of:", possiblePaths);
  }
};
