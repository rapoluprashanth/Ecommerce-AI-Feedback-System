import type { Request, Response, NextFunction } from "express";
import Product from "../models/Product.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import redisClient from "../config/redis.ts";
import { log } from "console";

// POST /products
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const start = Date.now();
  const products = req.body; // expecting array

  if (!Array.isArray(products)) {
    return res.status(400).json({ message: "Expected an array of products" });
  }

  const createdProducts = await Product.insertMany(products);
  const end = Date.now();
  console.log(`Products created in ${end - start}ms`);

  res.status(201).json({
    message: "Products created successfully",
    count: createdProducts.length,
    data: createdProducts
  });
});

// GET /products
export const getAllProducts = asyncHandler(async (_req: Request, res: Response) => {
  const CACHE_KEY = "products:all";

  // Check Redis cache first
  const redisStart = process.hrtime.bigint();
  const cachedData = await redisClient.get(CACHE_KEY);
  const redisEnd = process.hrtime.bigint()
  if (cachedData) {
    const redisTime = Number(redisEnd - redisStart) / 1_000_000;
    console.log(`[CACHE HIT] Redis GET took ${redisTime.toFixed(2)}ms`);
    return res.json(JSON.parse(cachedData));
  }

  console.log(`[CACHE MISS] Fetching products from MongoDB`);
  const dbStart = Date.now();
  const products = await Product.find();
  const dbDuration = Date.now() - dbStart;

  console.log(`[DB] Products fetched in ${dbDuration}ms`);

  // Store in Redis cache
  await redisClient.setEx(CACHE_KEY, parseInt(process.env.CACHE_TTL || "3600"), JSON.stringify(products));

  res.json(products);
});

// GET /products/:id
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

// DELETE /products/:id
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json({ message: "Product deleted successfully" });
});

// PUT /products/:id
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(updatedProduct);
});

// GET /products/category/:categoryId
export const getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const CACHE_KEY = `products:category:${categoryId}`;

  // Check Redis cache first
  const cachedData = await redisClient.get(CACHE_KEY);
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  const products = await Product.find({ categoryId });
  if (products.length === 0) {
    return res.status(404).json({ message: "No products found for this category" });
  }

  // Store in Redis cache
  await redisClient.setEx(CACHE_KEY, parseInt(process.env.CACHE_TTL || "3600"), JSON.stringify(products));
  
  res.json(products);
});

// DELETE /products/category/:categoryId
export const deleteProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  const result = await Product.deleteMany({ categoryId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "No products found for this category" });
  }

  res.json({
    message: "Products deleted successfully",
    deletedCount: result.deletedCount
  });
});

// GET /products/search?q=keyword
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ message: "Search query is required" });
  }

  const normalizedQuery = q.trim().toLowerCase();

  const CACHE_KEY = `products:search:${normalizedQuery}`;
  const SEARCH_CACHE_TTL = 300; // Shorter TTL for search results

  const cachedData = await redisClient.get(CACHE_KEY);

  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  const products = await Product.find(
    { $text: { $search: normalizedQuery } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });

  if (products.length === 0) {
    return res.status(404).json({ message: "No products found" });
  }

  await redisClient.setEx(CACHE_KEY, SEARCH_CACHE_TTL, JSON.stringify(products));

  res.json(products);
});
