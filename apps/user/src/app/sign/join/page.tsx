"use client";

import { useState } from "react";
import {Button} from "@/components/button";
import {TextField} from "@/components/textField";
import Link from "next/link";

const JoinPage = () => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleJoin = async () => {
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
  
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        alert(data.error || "회원가입 실패");
      } else {
        alert("회원가입 성공! 로그인 페이지로 이동합니다.");
        window.location.href = "/sign"; 
      }
    } catch (error) {
      console.error("회원가입 에러:", error);
      alert("회원가입 중 에러가 발생했습니다.");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-center">회원가입</h1>
        <div className="space-y-4">
          <TextField
            label="아이디"
            name="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디를 입력하세요"
          />
          <TextField
            label="이름"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
          />
          <TextField
            label="비밀번호"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
          />
          <TextField
            label="비밀번호 확인"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
          />
          <Button onClick={handleJoin} size="lg">
            회원가입
          </Button>
          <div className=" w-full flex items-center justify-center">
            <span className="px-2 text-gray-400">이미 회원인가요?</span>
            <Link href="/sign" className="px-2 font-extrabold text-gray-500 underline cursor-pointer"> 로그인</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
