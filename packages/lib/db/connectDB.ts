import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MongoDB 연결 문자열(MONGODB_URI)이 없습니다.");
}

export const connectDB = async () => {
  console.log("MONGODB_URI:", MONGODB_URI);
    console.log("mongoose.connection.readyState:", mongoose.connection.readyState);
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB 연결 성공");
  } catch (error) {
    console.error("❌ MongoDB 연결 실패:", error);
    throw error;
  }
};
