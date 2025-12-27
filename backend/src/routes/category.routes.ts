import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  searchCategories,
} from "../controllers/category.controller.ts";

const router = Router();

router.post("/", createCategory);
router.get("/", getAllCategories);
router.get("/search", searchCategories);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
