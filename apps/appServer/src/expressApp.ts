import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const expressApp = express();

// only serve the static client files when running in production.
// in development, the Vite dev server handles the frontend.
if (process.env.NODE_ENV === "production") {
  // serve the actual game
  const clientDistPath = path.join(__dirname, "../../appClient/dist");

  expressApp.use(express.static(clientDistPath));

  // Catch-all route using the standard Express wildcard for SPA routing
  expressApp.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  // catch anyone opening localhost:9208 in their browser
  expressApp.get("/", (req: Request, res: Response) => {
    // redirect to the vite dev server
    res.redirect("http://localhost:5173");
  });
}
