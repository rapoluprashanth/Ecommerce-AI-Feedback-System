import type { Request, Response, NextFunction } from "express";
import Product from "../models/Product.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

// POST /products
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// GET /products
export const getAllProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find({ isActive: true });
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
  const products = await Product.find({
    categoryId,
    isActive: true,
  });

  if (products.length === 0) {
    return res.status(404).json({ message: "No products found for this category" });
  }

  res.json(products);
});

// GET /products/search?q=keyword
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ message: "Search query is required" });
  }

  const products = await Product.find({
    isActive: true,
    name: { $regex: q, $options: "i" },
  });

  if (products.length === 0) {
    return res.status(404).json({ message: "No products found" });
  }

  res.json(products);
});
