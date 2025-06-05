"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image"; 
import {TextField, Button} from "@gameverse/ui";
import Link from "next/link";

const SignPage = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!id || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    
    signIn("credentials", {
      id,
      password,
      callbackUrl: '/'
    });
  };

  
  const handleSocialLogin = (provider: string) => {
    signIn(provider, {
      callbackUrl: "/", 
    })
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
          
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">간편 로그인</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center py-2.5 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Image src="/images/Googlelogo.svg" width={20} height={20} alt="Google 로고" className="mr-2" />
              Google
            </button>
            <button
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center py-2.5 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
               <Image src="/images/instagram.png" width={20} height={20} alt="인스타그램 로고" className="mr-2" />
               Instagram
            </button>
          </div>

          <div className=" w-full flex items-center justify-center">
            <span className="px-2 text-gray-400">아직 회원이 아닌가요?</span>
            <Link href="/sign/join" className="px-2 font-extrabold text-gray-500 underline cursor-pointer"> 회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignPage;