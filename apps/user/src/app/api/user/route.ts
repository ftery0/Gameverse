import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/libs/mongodb/mongodb";
import { User } from "@/models/user";
import { NextResponse } from "next/server";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const userSession = session.user as SessionUser; // <- 타입 단언 추가!

  await connectDB();

  const user = await User.findOne({ id: userSession.id });

  if (!user) {
    return NextResponse.json({ error: "유저를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    image: user.image || null,
    provider: user.provider,
  });
}
