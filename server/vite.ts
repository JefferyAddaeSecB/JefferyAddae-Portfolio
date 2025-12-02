import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app: express.Application, server: any) {
  // Diagnostic logs to help debug Vite startup issues
  console.log('[vite] setupVite: starting dynamic import of vite');
  let viteModule: any;
  try {
    viteModule = await import("vite");
  } catch (impErr) {
    console.error('[vite] setupVite: failed to import vite module', impErr);
    throw impErr;
  }

  const viteCreateServer = (viteModule as any).createServer;
  if (!viteCreateServer) {
    const msg = 'Vite createServer not found in import';
    console.error('[vite] setupVite:', msg);
    throw new Error(msg);
  }

  console.log('[vite] setupVite: creating vite server (middlewareMode)');
  let viteServer: any;
  try {
    viteServer = await viteCreateServer({
      server: {
        middlewareMode: true,
        // Keep HMR enabled so client dev server features work via middleware
        hmr: true,
      },
      appType: 'spa',
      root: path.resolve(__dirname, "..", "client"),
      // Prevent Vite from writing timestamp files that trigger watch restarts
      configFile: path.resolve(__dirname, "..", "client", "vite.config.ts"),
      // Use a separate cache directory
      cacheDir: path.resolve(__dirname, "..", "client", "node_modules", ".vite"),
    });
  } catch (csErr) {
    console.error('[vite] setupVite: createServer failed', csErr);
    throw csErr;
  }

  console.log('[vite] setupVite: attaching vite middlewares to express');
  // Use vite's connect instance as middleware
  app.use(viteServer.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      // Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, "..", "client", "index.html"),
        "utf-8"
      );

      // Apply Vite HTML transforms
      template = await viteServer.transformIndexHtml(url, template);

      // Send transformed HTML
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      try {
        if (viteServer && typeof viteServer.ssrFixStacktrace === 'function') {
          viteServer.ssrFixStacktrace(e as Error);
        }
      } catch (fixErr) {
        console.error('[vite] setupVite: ssrFixStacktrace failed', fixErr);
      }
      console.error('[vite] setupVite: request handler error for', url, e);
      next(e);
    }
  });

  console.log('[vite] setupVite: completed');
}

export function serveStatic(app: express.Application) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Serve static files from the dist directory
  app.use(express.static(distPath));

  // Handle client-side routing
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
