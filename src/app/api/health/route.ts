import { connectDB } from "@gameverse/lib";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    console.log("DB 헬스 체크 시작...");
    
    // MongoDB 연결 시도
    await connectDB();
    
    const dbState = mongoose.connection.readyState;
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // 실제 DB 쿼리 테스트
    const dbStats = mongoose.connection.db ? await mongoose.connection.db.admin().ping() : null;
    
    return NextResponse.json({
      status: "healthy",
      mongodb: {
        connectionState: states[dbState] || 'unknown',
        stateNumber: dbState,
        ping: dbStats,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("DB 헬스 체크 실패:", error);
    
    return NextResponse.json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}