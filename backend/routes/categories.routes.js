import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

// GET
router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// POST
router.post("/", async (req, res) => {
  const category = await Category.create(req.body);
  res.json(category);
});

// PUT
router.put("/:id", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(category);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;