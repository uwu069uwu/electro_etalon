import mongoose from "mongoose";

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
  orderNumber: { type: Number },
  customer_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  address: String,       // full address string: "Астана, Алматы, ул. Абая 12"
  city: String,
  district: String,
  is_free_delivery: { type: Boolean, default: false },
  comment: String,

  items: [orderItemSchema],

  subtotal: Number,
  discount_percent: { type: Number, default: 5 },
  discount_amount: Number,
  total: Number,

  status: {
    type: String,
    enum: ["new", "delivered", "cancelled"],
    default: "new",
  },
}, { timestamps: true });

orderSchema.virtual("created_at").get(function () { return this.createdAt; });
orderSchema.set("toJSON", { virtuals: true });

// Auto-increment orderNumber
orderSchema.pre("save", async function () {
  if (this.isNew && !this.orderNumber) {
    const last = await mongoose.model("Order").findOne({}, {}, { sort: { orderNumber: -1 } });
    this.orderNumber = (last?.orderNumber || 0) + 1;
  }
});

export default mongoose.model("Order", orderSchema);
