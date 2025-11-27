'use client';

import { useParams } from 'next/navigation';
import { games } from '@/constants/game/game.constants';
import { Button } from "@/components/button";
import { useState, useEffect } from 'react';
import { getGameComponent } from '@/components/games/usegame';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import RankingBoard from '@/components/ranking/RankingBoard';

const GameDetailPage = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const game = games.find((game) => game.id === id);

  const [selectedMode, setSelectedMode] = useState<'easy' | 'normal' | 'hard' | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [matchInfo, setMatchInfo] = useState<{ opponent: string, color: 'black' | 'white' } | null>(null);

  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  if (!game) {
    return <div className="text-center mt-10 text-lg text-red-500">게임을 찾을 수 없습니다.</div>;
  }

  const handleModeSelect = async (mode: 'easy' | 'normal' | 'hard') => {
    setIsLoading(true);
    setSelectedMode(mode);

    try {
      const newSocket = io('http://localhost:8080');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        // Join Queue
        newSocket.emit('joinQueue', {
          userId: `user-${Math.floor(Math.random() * 10000)}`, // Temporary random ID
          userName: `Player ${Math.floor(Math.random() * 100)}`,
          gameName: id
        });
      });

      newSocket.on('matchFound', (data: { roomId: string, opponent: string, color: 'black' | 'white' }) => {
        console.log('🎮 Match found:', data);
        setRoomId(data.roomId);
        setMatchInfo({ opponent: data.opponent, color: data.color });
        setIsLoading(false);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsLoading(false);
      });

    } catch (error) {
      console.error('❌ Connection error:', error);
      alert('Failed to connect to server.');
      setIsLoading(false);
    }
  };

  if (selectedMode && roomId && socket && matchInfo) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="flex flex-col items-center w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <div className="w-full flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{game.title}</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold transition"
            >
              Exit Game
            </Link>
          </div>

          {/* Pass socket and match info to game component */}
          {getGameComponent({
            mode: selectedMode,
            id,
            roomId,
            socket: socket ?? undefined,
            myColor: matchInfo.color,
            opponentName: matchInfo.opponent
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-4 bg-gray-50 gap-8">
      {/* Game Intro Section */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden mt-10">

        {/* Left: Image */}
        <div className="w-full md:w-1/2 h-[300px] md:h-auto flex flex-col items-start justify-start p-6 md:p-10 gap-4 relative">
          <Link
            href="/"
            className="absolute top-6 left-6 px-4 py-2 bg-white/80 hover:bg-white text-gray-800 rounded-lg text-sm font-semibold transition shadow-sm backdrop-blur-sm z-10"
          >
            ← Home
          </Link>
          <img
            src={game.image}
            alt={game.title}
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Right: Description + Play Button */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 md:p-10 bg-white">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 mt-2 text-gray-900">{game.title}</h1>
            <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed">
              {game.detail || game.description}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-indigo-600 font-semibold animate-pulse">Finding match...</p>
              </div>
            ) : (
              <div className="w-full">
                <p className="text-center text-gray-500 mb-3 text-sm font-medium uppercase tracking-wide">Select Difficulty to Start</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    onClick={() => handleModeSelect("easy")}
                    variant="secondary"
                    size="lg"
                    className="flex-1 min-w-[100px]"
                    disabled={isLoading}
                  >
                    Easy
                  </Button>
                  <Button
                    onClick={() => handleModeSelect("normal")}
                    variant="primary"
                    size="lg"
                    className="flex-1 min-w-[100px]"
                    disabled={isLoading}
                  >
                    Normal
                  </Button>
                  <Button
                    onClick={() => handleModeSelect("hard")}
                    variant="danger"
                    size="lg"
                    className="flex-1 min-w-[100px]"
                    disabled={isLoading}
                  >
                    Hard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ranking Section */}
      <div className="w-full max-w-5xl">
        <RankingBoard />
      </div>
    </div>
  );
};

export default GameDetailPage;
