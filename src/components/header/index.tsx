"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Avatar from "@/assets/img/Avatar.svg";
import Image from "next/image";
import { useProfileSession } from "@/hooks/profile/useprofile";
import Skeleton from "react-loading-skeleton";
import NavLinks from "./navLink";


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const {session,isLoading}= useProfileSession();
  console.log(isLoading);
  
  


  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <header className="w-full fixed top-0 left-0 z-50 h-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-full">
        
        <div className="flex items-center space-x-3">
          {isLoading ? (
            <Skeleton circle={true} height={36} width={36} /> 
          ) : (
            <Image
              src={session?.user?.image ? session?.user.image : Avatar}
              alt="Profile"
              width={36}
              height={36}
              className="rounded-full"
            />
          )} 

          {/* 프로필 이름 */}
          <span className="font-semibold text-gray-800">
            {isLoading ? <Skeleton width={100} /> : session?.user?.name ?? "Loading..."}
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
        <div className="md:hidden bg-white px-4 pt-2 pb-4 space-y-2">
          <NavLinks/>
        </div>
      )}
    </header>
  );
};

export default Header;
