
"use client";
import { useState } from "react";
import Link from "next/link";
import { games } from "@/constants/game/game.constants";
import Image from "next/image";
import { categories } from "@/constants/game/game.category.constants";
import { Category } from "@/types/game/categories.type";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("고전게임");

  const filteredGames = games.filter((game) => game.category === selectedCategory);

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">게임을 선택하세요</h1>

      <div className="flex space-x-4 mb-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 게임 리스트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 ">
        {filteredGames.map((game) => (
          <Link
            href={`/game/${game.id}`}
            key={game.id}
            className="flex flex-col items-center bg-gray-100 rounded-lg p-4 hover:bg-gray-200"
          >
            <div className="relative w-full aspect-square mb-4">
              <Image
                src={game.image}
                alt={game.title}
                fill 
                className="rounded-md object-cover"
                sizes="100%"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{game.title}</h2>
            <p className="text-gray-600 mt-2">{game.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;