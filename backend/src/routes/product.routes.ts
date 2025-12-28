import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  searchProducts,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  deleteProductsByCategory,
} from "../controllers/product.controller.ts";

const router = Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get(":id", getProductById);
router.put(":id", updateProduct);
router.delete(":id", deleteProduct);
router.delete('/category/:categoryId', deleteProductsByCategory);

export default router;
