import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.ts";
import type { Request, Response, NextFunction } from "express";
import productsRouter from "./routes/product.routes.ts";

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

// Attach product routes
app.use("/api/v1/products", productsRouter);

// Error handling middleware (must be after routes)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err?.status || 500).json({ message: err?.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
