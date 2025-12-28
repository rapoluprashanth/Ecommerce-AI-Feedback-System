import type { Request, Response, NextFunction } from "express";
import Product from "../models/Product.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

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
  const start = Date.now();
  const products = await Product.find();
  const end = Date.now();
  console.log(`Products fetched in ${end - start}ms`);
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
  const start= Date.now();
  const products = await Product.find({
    categoryId,
  });
  const end = Date.now();
  console.log(`Products by category fetched in ${end - start}ms`);
  if (products.length === 0) {
    return res.status(404).json({ message: "No products found for this category" });
  }

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

  const products = await Product.find({
    isActive: true,
    name: { $regex: q, $options: "i" },
  });

  if (products.length === 0) {
    return res.status(404).json({ message: "No products found" });
  }

  res.json(products);
});
