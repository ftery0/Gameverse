"use client";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/button";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [showPwChange, setShowPwChange] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const router = useRouter();

  if (!session) return <div className="flex justify-center items-center min-h-screen">로그인이 필요합니다.</div>;

  const user = session.user as any;
  const isCredentials = user?.provider === "credentials";

  const handleLogout = () => {
    signOut({ callbackUrl: "/sign" });
  };

  const handlePwChange = async () => {
    if (newPw !== confirmPw) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    // TODO: 비밀번호 변경 API 연동
    alert("비밀번호가 변경되었습니다.");
    setShowPwChange(false);
    setNewPw("");
    setConfirmPw("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center w-full max-w-md">
        <Image
          src={user?.image ?? "/images/Avatars.svg"}
          alt="프로필 이미지"
          width={120}
          height={120}
          className="rounded-full mb-4"
        />
        <div className="text-xl font-bold mb-2">{user?.id ?? "-"}</div>
        <div className="text-lg text-gray-600 mb-4">{user?.name ?? "-"}</div>
        {isCredentials && (
          <>
            {showPwChange ? (
              <div className="w-full flex flex-col gap-2 mb-4">
                <input
                  type="password"
                  placeholder="새 비밀번호"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <Button onClick={handlePwChange}>비밀번호 변경</Button>
                <Button onClick={() => setShowPwChange(false)} variant="secondary">취소</Button>
              </div>
            ) : (
              <Button onClick={() => setShowPwChange(true)} className="mb-4">비밀번호 변경</Button>
            )}
          </>
        )}
        <Button onClick={handleLogout} variant="danger">로그아웃</Button>
      </div>
    </div>
  );
} 