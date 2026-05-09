import Product from "../models/Product.js";
import fs from "fs";
import path from "path";

// helper — удалить файл если существует
function removeFile(filename) {
  if (!filename) return;
  // filename может быть полным URL или просто именем файла
  const base = filename.split("/").pop();
  const filePath = path.resolve("uploads", base);
  fs.unlink(filePath, () => {}); // игнорируем ошибки (файл уже удалён и т.п.)
}

// helper — нормализовать тело запроса (category_id → category)
function normalizeBody(body) {
  const { category_id, ...rest } = body;
  if (category_id) rest.category = category_id;
  return rest;
}

// CREATE
export const createProduct = async (req, res) => {
  const product = await Product.create(normalizeBody(req.body));
  res.json(product);
};

// GET ALL
export const getProducts = async (req, res) => {
  const { limit, category } = req.query;
  let query = Product.find().populate("category");
  if (category) query = query.where("category").equals(category);
  if (limit) query = query.limit(Number(limit));
  const products = await query;

  // нормализуем: добавляем category_id чтобы фронт мог фильтровать
  const result = products.map((p) => {
    const obj = p.toObject({ virtuals: true });
    obj.category_id = p.category?._id?.toString() ?? null;
    return obj;
  });

  res.json(result);
};

// GET ONE
export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};

// UPDATE
export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    normalizeBody(req.body),
    { new: true },
  );

  res.json(product);
};

// DELETE
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // удаляем все картинки вариантов с диска
  (product.colors || []).forEach((color) => {
    (color.images || []).forEach(removeFile);
  });

  await product.deleteOne();
  res.json({ message: "Deleted" });
};
