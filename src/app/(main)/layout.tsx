"use client";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/header";

export default function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <div className="bg-gray-50">
      <Header />
        <div className="w-full min-h-screen flex flex-col items-center p-8 mt-20 scrollbar-hide">
        {children}
        </div>
      </div>
    </SessionProvider>
  );
}
