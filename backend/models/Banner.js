import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    image: String,
    link: String,
    active: Boolean,
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Banner", bannerSchema);
