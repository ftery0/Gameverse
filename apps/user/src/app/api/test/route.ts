import { connectDB } from "@/libs/connectDB";
import { User } from "@/models/user";

async function test() {
  try {
    await connectDB();
    console.log("연결 성공");
    
    const testUser = new User({
      id: "test123",
      name: "테스트",
      password: "1234",
      provider: "credentials",
      image: null
    });
    
    await testUser.save();
    console.log("사용자 저장 성공");
    
    const found = await User.findOne({ id: "test123" });
    console.log("사용자 조회 성공:", found);
    
  } catch (error) {
    console.error("테스트 실패:", error);
  }
}

test();