import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const expressApp = express();

expressApp.use(compression());

// Security and discovery headers middleware
expressApp.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; media-src 'self' data: blob:; connect-src 'self' blob: data: ws: wss:; worker-src 'self' blob:; child-src 'self' blob:; frame-ancestors 'self'; upgrade-insecure-requests;",
  );
  res.setHeader("X-Robots-Tag", "index, follow");
  res.setHeader(
    "Link",
    '</llms.txt>; rel="help", </sitemap.xml>; rel="sitemap"',
  );
  next();
});

// only serve the static client files when running in production.
// in development, the Vite dev server handles the frontend.
if (process.env.NODE_ENV === "production") {
  // serve the actual game
  const clientDistPath = path.join(__dirname, "../../appClient/dist");

  expressApp.use(
    express.static(clientDistPath, {
      setHeaders: (res: Response, filePath: string) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
        } else if (
          filePath.includes(path.sep + "assets" + path.sep) ||
          filePath.includes("/assets/")
        ) {
          res.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable",
          );
        }
      },
    }),
  );

  // Valid client SPA routes that return 200 OK
  const validClientRoutes = new Set(["/", "/play"]);

  // Catch-all route for SPA routing with correct HTTP status codes to prevent soft 404s
  expressApp.get("/{*splat}", (req: Request, res: Response) => {
    if (validClientRoutes.has(req.path)) {
      res.status(200).sendFile(path.join(clientDistPath, "index.html"));
    } else {
      res.status(404).sendFile(path.join(clientDistPath, "index.html"));
    }
  });
} else {
  // catch anyone opening localhost:9208 in their browser in development
  expressApp.get("/", (req: Request, res: Response) => {
    // redirect to the vite dev server
    res.redirect("http://localhost:5173");
  });
}

// 500 Internal Server Error handler
expressApp.use(
  (err: Error, req: Request, res: Response, _next: NextFunction) => {
    res.status(500).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>500 - Internal Server Error</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: monospace; background: #171717; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    h1 { font-size: 3rem; margin-bottom: 0.5rem; color: #ef4444; }
    p { color: #a3a3a3; }
    a { color: white; text-decoration: underline; margin-top: 1rem; }
  </style>
</head>
<body>
  <h1>500</h1>
  <p>Internal Server Error</p>
  <a href="/">Return to Home</a>
</body>
</html>`);
  },
);
