import express from "express";
import {
  createOrder,
  updateOrderStatus,
  getOrders,
} from "../controllers/order.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", protect, admin, getOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;
