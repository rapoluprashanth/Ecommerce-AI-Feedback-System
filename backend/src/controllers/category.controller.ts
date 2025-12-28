import type { Request, Response } from "express";
import Category from "../models/Category.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

// POST /categories
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

// GET /categories
export const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find();
  res.json(categories);
});

// GET /categories/:id
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
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

  res.json(updatedCategory);
});

// DELETE /categories/:id
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.json({ message: "Category deleted successfully" });
});

// GET /categories/search?q=keyword
export const searchCategories = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ message: "Search query is required" });
  }

  const categories = await Category.find({
    isActive: true,
    name: { $regex: q, $options: "i" },
  });

  if (categories.length === 0) {
    return res.status(404).json({ message: "No categories found" });
  }

  res.json(categories);
});
