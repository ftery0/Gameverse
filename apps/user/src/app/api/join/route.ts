import { connectDB } from "@gameverse/lib";
import { User } from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, name, password } = await req.json();
  
  await connectDB();
  
  const existingUser = await User.findOne({ id });
  
  if (existingUser) {
    return NextResponse.json({ error: "이미 존재하는 아이디입니다." }, { status: 400 });
  }
  
  const newUser = new User({
    id,
    name,
    password,
    provider: "credentials",
    image: null, 
  });

  await newUser.save();

  return NextResponse.json({ message: "회원가입 성공" }, { status: 201 });
}
