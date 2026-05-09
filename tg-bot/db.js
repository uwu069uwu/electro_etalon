import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// ─── Order schema (mirrors backend) ────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  product_id: String,
  name: String,
  brand: String,
  price: Number,
  qty: Number,
  color: String,
  image: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer_name: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  district: String,
  is_free_delivery: Boolean,
  comment: String,
  items: [orderItemSchema],
  subtotal: Number,
  discount_percent: Number,
  discount_amount: Number,
  total: Number,
  status: {
    type: String,
    enum: ["new", "delivered", "cancelled"],
    default: "new",
  },
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// ─── Product schema (minimal, for stock management) ─────────────────────────
const productSchema = new mongoose.Schema({
  name: String,
  stock: { type: Number, default: 0 },
  colors: [{
    name: String,
    hex: String,
    stock: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    images: [String],
  }],
}, { strict: false });

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
