import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// куда сохраняем
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 🔥 главный роут
router.post("/", upload.single("file"), (req, res) => {
  res.json({
    url: `/api/files/${req.file.filename}`,
  });
});

export default router;