'use client';

import { useParams } from 'next/navigation';
import { games } from '@/constants/game/game.constants';
import { Button } from "@/components/button";
import { useState } from 'react';
import { getGameComponent } from '@/components/games/usegame'; 
import Link from 'next/link';

const GameDetailPage = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const game = games.find((game) => game.id === id);

  const [selectedMode, setSelectedMode] = useState<'easy' | 'normal' | 'hard' | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!game) {
    return <div className="text-center mt-10 text-lg text-red-500">게임을 찾을 수 없습니다.</div>;
  }

  const handleModeSelect = async (mode: 'easy' | 'normal' | 'hard') => {
    setIsLoading(true);
    try {
      // WebSocket 연결 및 방 생성
      const ws = new WebSocket('ws://localhost:8080');
      
      ws.onopen = () => {
        console.log('✅ WebSocket 연결됨');
        // 방 생성 요청
        ws.send(JSON.stringify({
          type: 'createRoom',
          gameType: id,
          difficulty: mode
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'roomCreated') {
          console.log('🎮 방 생성됨:', data.roomId);
          setRoomId(data.roomId);
          setSelectedMode(mode);
          setIsLoading(false);
        } else if (data.type === 'error') {
          console.error('❌ 방 생성 실패:', data.message);
          alert('게임 시작에 실패했습니다.');
          setIsLoading(false);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket 오류:', error);
        alert('서버 연결에 실패했습니다.');
        setIsLoading(false);
      };

    } catch (error) {
      console.error('❌ 게임 시작 오류:', error);
      alert('게임 시작에 실패했습니다.');
      setIsLoading(false);
    }
  };

  if (selectedMode && roomId) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="flex flex-col items-center w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <Link
            href="/"
            className="self-end mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold transition"
          >
            홈으로
          </Link>
          {getGameComponent({ mode: selectedMode, id, roomId })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* 왼쪽: 이미지 */}
        <div className="w-full md:w-1/2 h-[300px] md:h-auto flex flex-col items-start justify-start p-6 md:p-10 gap-4">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold transition"
          >
            홈으로
          </Link>
          <img
            src={game.image}
            alt={game.title}
            className="w-full h-full object-contain rounded-lg shadow"
          />
        </div>

        {/* 오른쪽: 설명 + 난이도 선택 */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 md:p-10 ">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4 mt-2">{game.title}</h1>
            <p className="text-base md:text-lg text-gray-600 mb-8">
              {game.detail || game.description}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Button
                onClick={() => handleModeSelect("easy")}
                variant="secondary"
                size="lg"
                width="w-24 md:w-28"
                disabled={isLoading}
              >
                {isLoading ? '로딩중...' : '쉬움'}
              </Button>
              <Button
                onClick={() => handleModeSelect("normal")}
                variant="primary"
                size="lg"
                width="w-24 md:w-28"
                disabled={isLoading}
              >
                {isLoading ? '로딩중...' : '보통'}
              </Button>
              <Button
                onClick={() => handleModeSelect("hard")}
                variant="danger"
                size="lg"
                width="w-24 md:w-28"
                disabled={isLoading}
              >
                {isLoading ? '로딩중...' : '어려움'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;
