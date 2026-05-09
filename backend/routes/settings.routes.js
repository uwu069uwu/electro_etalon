import express from "express";
import Settings from "../models/Settings.js";

const router = express.Router();

// GET
router.get("/about", async (req, res) => {
  let data = await Settings.findOne();

  if (!data) {
    data = await Settings.create({});
  }

  res.json(data);
});

// PUT
router.put("/about", async (req, res) => {
  let data = await Settings.findOne();

  if (!data) {
    data = await Settings.create(req.body);
  } else {
    Object.assign(data, req.body);
    await data.save();
  }

  res.json(data);
});

export default router;