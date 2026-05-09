import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  title: String,
  text: String,
  gallery: [String],
  map_iframe: String,
  phone: String,
  email: String,
  address: String,
});

export default mongoose.model("Settings", settingsSchema);