import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import portfolioRoutes from "./src/routes/portfolio.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// API
app.use("/api", portfolioRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});