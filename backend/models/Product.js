import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    brand: String,

    price: {
      type: Number,
      required: true,
    },

    description: String,

    stock: {
      type: Number,
      default: 0,
    },

    reserved: {
      type: Number,
      default: 0,
    },

    colors: [
      {
        name: String,
        hex: { type: String, default: "#000000" },
        stock: { type: Number, default: 0 },
        reserved: { type: Number, default: 0 },
        images: [String],
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true },
);

// 🔥 вычисляем доступное количество
productSchema.virtual("available").get(function () {
  return this.stock - this.reserved;
});

export default mongoose.model("Product", productSchema);
