"use client"; 

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ErrorPage = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Signin: "다시 로그인을 시도해주세요.",
    OAuthSignin: "소셜 로그인 시작 중 오류가 발생했습니다.",
    OAuthCallback: "소셜 로그인 콜백 처리 중 오류가 발생했습니다.",
    OAuthCreateAccount: "소셜 계정 생성 중 오류가 발생했습니다.",
    EmailCreateAccount: "이메일 계정 생성 중 오류가 발생했습니다.",
    Callback: "콜백 처리 중 오류가 발생했습니다.",
    OAuthAccountNotLinked: "이미 다른 소셜 계정으로 가입된 이메일입니다.",
    EmailSignin: "이메일 로그인 중 오류가 발생했습니다.",
    CredentialsSignin: "아이디 또는 비밀번호가 올바르지 않습니다.",
    SessionRequired: "이 페이지에 접근하려면 로그인이 필요합니다.",
    default: "인증 중 오류가 발생했습니다."
  };

  const errorMessage = error ? (errorMessages[error] || errorMessages.default) : errorMessages.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg space-y-6 text-center">
        <h1 className="text-3xl font-bold text-red-600">로그인 오류</h1>
        <p className="text-lg text-gray-700">{errorMessage}</p>
        <div className="pt-4">
          <Link 
            href="/sign"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;