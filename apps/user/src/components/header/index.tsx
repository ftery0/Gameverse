"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
// import Avatar from "@/assets/img/Avatars.svg"
import Image from "next/image";
import { useProfileSession } from "@/hooks/profile/useprofile";
import Skeleton from "react-loading-skeleton";
import NavLinks from "./navLink";
import MobileNavLinks from "./mobileNavLink";



const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const {session,isLoading}= useProfileSession();

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <header className="w-full fixed top-0 left-0 h-20 bg-white z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-full">
        
        <div className="flex items-center space-x-3">
          {isLoading ? (
            <Skeleton circle={true} height={36} width={36} /> 
          ) : (
            <Link href="/profile">
              <Image
                src={session?.user?.image ?? "/images/Avatars.svg"}
                alt="Profile"
                width={36}
                height={36}
                className="rounded-full cursor-pointer"
              />
            </Link>
          )} 

          {/* 프로필 이름 */}
          <span className="font-semibold text-gray-800">
            {isLoading ? <Skeleton width={100} /> : session?.user?.name ?? <Link href="/sign">로그인 하러가기</Link>}
          </span>
        </div>

        {/* 오른쪽 - 모바일 메뉴 아이콘 */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none cursor-pointer">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 네비게이션 (PC용) */}
        <NavLinks/>
      </div>

      {/* 모바일 메뉴 펼침 */}
      {menuOpen && (
        <>
        
          
          {/* 모바일 메뉴 */}
          <div className="fixed top-20 left-0 w-full bg-white px-4 pt-2 pb-4 space-y-2 z-50 animate-slideDown">
            <MobileNavLinks toggleMenu={toggleMenu} />
          </div>
          
          <div 
            onClick={toggleMenu} 
            className="fixed h-full w-full bg-black opacity-50"
          />
        </>
      )}
    </header>
  );
};

export default Header;
