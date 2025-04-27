'use client';

import { useParams } from 'next/navigation';
import { games } from '@/constants/game/game.constants';
import Button from '@/components/button';
import { useState } from 'react';
import { getGameComponent } from '@/components/games/usegame'; // 이름 수정

const GameDetailPage = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const game = games.find((game) => game.id === id);

  const [selectedMode, setSelectedMode] = useState<'easy' | 'normal' | 'hard' | null>(null);

  if (!game) {
    return <div>게임을 찾을 수 없습니다.</div>;
  }

  const handleModeSelect = (mode: 'easy' | 'normal' | 'hard') => {
    setSelectedMode(mode);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
      {!selectedMode ? (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">{game.title}</h1>
            <p className="text-lg text-gray-600">{game.description}</p>
          </div>

          <div className="flex gap-4 w-full max-w-md">
            <Button
              onClick={() => handleModeSelect("easy")}
              variant="secondary"
              size="lg"
              width="w-1/3"
            >
              쉬움
            </Button>
            <Button
              onClick={() => handleModeSelect("normal")}
              variant="primary"
              size="lg"
              width="w-1/3"
            >
              보통
            </Button>
            <Button
              onClick={() => handleModeSelect("hard")}
              variant="danger"
              size="lg"
              width="w-1/3"
            >
              어려움
            </Button>
          </div>
        </>
      ) : (
        getGameComponent({ mode: selectedMode, id }) // 이렇게 바로 호출
      )}
    </div>
  );
};

export default GameDetailPage;
