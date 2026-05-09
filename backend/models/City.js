import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true },
}, { _id: true });

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isFreeDelivery: { type: Boolean, default: false }, // true = Астана (бесплатно)
  districts: [districtSchema],
}, { timestamps: true });

export default mongoose.model("City", citySchema);
