"use client";

import { useState } from "react";
import TextField from "@/components/textField";
import Button from "@/components/button";

const SignPage = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("로그인 시도:", { id, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-center">로그인</h1>
        <div className="space-y-4">
          <TextField
            label="아이디"
            name="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디를 입력하세요"
          />
          <TextField
            label="비밀번호"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
          />
          <Button onClick={handleLogin} size="lg">
            로그인
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignPage;
