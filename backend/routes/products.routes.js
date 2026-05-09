import express from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from "../controllers/products.controller.js";

import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

// 📦 публичные
router.get("/", getProducts);
router.get("/:id", getProduct);

// 👑 админ
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;