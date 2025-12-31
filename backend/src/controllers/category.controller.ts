import type { Request, Response } from "express";
import Category from "../models/Category.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import redisClient from "../config/redis.ts";

// POST /categories
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.create(req.body);
  
  // Invalidate categories cache
  await redisClient.del("categories:all");
  
  res.status(201).json(category);
});

// GET /categories
export const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const CACHE_KEY = "categories:all";

  // Check Redis cache first
  const cachedData = await redisClient.get(CACHE_KEY);
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  const categories = await Category.find();
  await redisClient.setEx(CACHE_KEY, parseInt(process.env.CACHE_TTL || "3600"), JSON.stringify(categories));

  res.json(categories);
});

// GET /categories/:id
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const CACHE_KEY = `categories:byId:${id}`;

  // Check Redis cache first
  const cachedData = await redisClient.get(CACHE_KEY);
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Cache result
  await redisClient.setEx(CACHE_KEY, parseInt(process.env.CACHE_TTL || "3600"), JSON.stringify(category));

  res.json(category);
});

// PUT /categories/:id
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedCategory) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Invalidate caches
  await redisClient.del("categories:all");
  await redisClient.del(`categories:byId:${updatedCategory._id}`);

  res.json(updatedCategory);
});

// DELETE /categories/:id
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Invalidate caches
  await redisClient.del("categories:all");
  await redisClient.del(`categories:byId:${category._id}`);

  res.json({ message: "Category deleted successfully" });
});

// GET /categories/search?q=keyword
export const searchCategories = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ message: "Search query is required" });
  }

  const normalizedQuery = q.trim().toLowerCase();
  const CACHE_KEY = `categories:search:${normalizedQuery}`;
  const SEARCH_CACHE_TTL = 300; // Shorter TTL for search results

  // Check Redis cache first
  const cachedData = await redisClient.get(CACHE_KEY);
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  const categories = await Category.find(
    { $text: { $search: normalizedQuery } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });

  if (categories.length === 0) {
    return res.status(404).json({ message: "No categories found" });
  }

  await redisClient.setEx(CACHE_KEY, SEARCH_CACHE_TTL, JSON.stringify(categories));

  res.json(categories);
});
