import express from "express";
import Banner from "../models/Banner.js";

const router = express.Router();

// ✅ CREATE
router.post("/", async (req, res) => {
  try {
    const { title, subtitle, image, link, active, order } = req.body;

    const banner = new Banner({
      title: title || "",
      subtitle: subtitle || "",
      image: image || "",
      link: link || "",
      active: active ?? true,
      order: order ?? 0,
    });

    const saved = await banner.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ message: "Ошибка создания", error: error.message });
  }
});

// ✅ GET ALL
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({ message: "Ошибка получения" });
  }
});

// ✅ GET ONE
router.get("/:id", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Не найден" });
    }

    res.json(banner);
  } catch (error) {
    console.error("GET ONE ERROR:", error);
    res.status(500).json({ message: "Ошибка" });
  }
});

// ✅ UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { title, subtitle, image, link, active, order } = req.body;

    const updated = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        title,
        subtitle,
        image,
        link,
        active,
        order,
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Не найден" });
    }

    res.json(updated);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Ошибка обновления" });
  }
});

// ✅ DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Не найден" });
    }

    res.json({ message: "Удалено" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Ошибка удаления" });
  }
});

export default router;
