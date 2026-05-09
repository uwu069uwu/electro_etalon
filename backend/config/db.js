import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "electro-etalon", // можешь поменять имя
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);

    // чтобы сервер падал если нет БД
    process.exit(1);
  }
};

export default connectDB;