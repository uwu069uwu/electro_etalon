import express from "express";
import {
  getCities,
  createCity,
  updateCity,
  deleteCity,
  addDistrict,
  deleteDistrict,
} from "../controllers/city.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getCities);                                          // public
router.post("/", protect, admin, createCity);
router.put("/:id", protect, admin, updateCity);
router.delete("/:id", protect, admin, deleteCity);
router.post("/:id/districts", protect, admin, addDistrict);
router.delete("/:id/districts/:districtId", protect, admin, deleteDistrict);

export default router;
