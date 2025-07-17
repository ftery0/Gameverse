import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MongoDB URI가 정의되지 않았습니다.");
}

// ✅ 전역 변수로 캐시 (Next.js API 라우트 대응)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // 이미 연결되어 있다면 재사용
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log("✅ 기존 연결 재사용");
    return cached.conn;
  }

  // 연결이 끊어진 경우 캐시 초기화
  if (mongoose.connection.readyState === 0) {
    console.log("🔄 연결 초기화");
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4,
      // ✅ 추가 옵션들
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      w: 'majority',
      // ✅ 로컬 개발 환경용 추가 설정
      directConnection: true, // 로컬 MongoDB 직접 연결
    };

    console.log("🔗 MongoDB 연결 시도 중...");
    console.log("📍 연결 URI:", MONGODB_URI);

    cached.promise = mongoose
      .connect(MONGODB_URI!)
      .then((mongoose) => {
        console.log("✅ MongoDB 연결 성공!");
        console.log("📊 연결 상태:", mongoose.connection.readyState);
        console.log("🏷️ DB 이름:", mongoose.connection.name);
        console.log("🌐 호스트:", mongoose.connection.host);
        console.log("🔌 포트:", mongoose.connection.port);
        
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB 연결 실패:", error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    
    // 연결 후 상태 재확인
    if (mongoose.connection.readyState !== 1) {
      console.error("❌ 연결 상태 이상:", mongoose.connection.readyState);
      cached.conn = null;
      cached.promise = null;
      throw new Error(`MongoDB 연결 상태 이상: ${mongoose.connection.readyState}`);
    }
    
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
};