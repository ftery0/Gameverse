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
    setSelectedMode(mode);
  };

  const handleRandomMatch = async () => {
    if (!selectedMode) {
      alert('난이도를 먼저 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setMatchingMode('random');

    try {
      const newSocket = io('http://localhost:8080');
      setSocket(newSocket);

      const userId = session?.user?.id || `user-${Math.floor(Math.random() * 10000)}`;
      const userName = session?.user?.name || `Player ${Math.floor(Math.random() * 100)}`;

      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        // 일반 게임 큐에 참가 (isRanked: false)
        newSocket.emit('joinQueue', {
          userId,
          userName,
          gameName: id,
          isRanked: false
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

      newSocket.on('error', (data: { message: string }) => {
        alert(data.message);
        setIsLoading(false);
      });

    } catch (error) {
      console.error('❌ Connection error:', error);
      alert('Failed to connect to server.');
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedMode) {
      alert('난이도를 먼저 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setMatchingMode('friend');

    try {
      const newSocket = io('http://localhost:8080');
      setSocket(newSocket);

      const userId = session?.user?.id || `user-${Math.floor(Math.random() * 10000)}`;
      const userName = session?.user?.name || `Player ${Math.floor(Math.random() * 100)}`;

      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        newSocket.emit('createRoom', {
          userId,
          userName,
          gameName: id
        });
      });

      newSocket.on('roomCreated', (data: { roomId: string, roomCode: string }) => {
        console.log('🏠 Room created:', data);
        setRoomId(data.roomId);
        setRoomCode(data.roomCode);
        setIsLoading(false);
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

      newSocket.on('error', (data: { message: string }) => {
        alert(data.message);
        setIsLoading(false);
      });

    } catch (error) {
      console.error('❌ Connection error:', error);
      alert('Failed to connect to server.');
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!inputRoomCode.trim()) {
      alert('방 코드를 입력해주세요.');
      return;
    }

    if (!selectedMode) {
      alert('난이도를 먼저 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setMatchingMode('friend');

    try {
      const newSocket = io('http://localhost:8080');
      setSocket(newSocket);

      const userId = session?.user?.id || `user-${Math.floor(Math.random() * 10000)}`;
      const userName = session?.user?.name || `Player ${Math.floor(Math.random() * 100)}`;

      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        newSocket.emit('joinRoom', {
          roomCode: inputRoomCode.toUpperCase(),
          userId,
          userName
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

      newSocket.on('error', (data: { message: string }) => {
        alert(data.message);
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
      <div className="w-full h-screen overflow-hidden">
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
            {isLoading && matchingMode === 'random' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-indigo-600 font-semibold animate-pulse">랜덤 매칭 중...</p>
              </div>
            ) : isLoading && matchingMode === 'friend' && roomCode ? (
              <div className="flex flex-col items-center gap-3 w-full">
                <p className="text-indigo-600 font-semibold">방이 생성되었습니다!</p>
                <div className="bg-gray-100 p-4 rounded-lg w-full">
                  <p className="text-sm text-gray-600 mb-2">방 코드를 친구에게 공유하세요:</p>
                  <p className="text-2xl font-bold text-center text-indigo-600">{roomCode}</p>
                </div>
                <p className="text-sm text-gray-500">친구가 방 코드로 입장할 때까지 대기 중...</p>
              </div>
            ) : isLoading && matchingMode === 'friend' && !roomCode ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-indigo-600 font-semibold animate-pulse">방 생성 중...</p>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div>
                  <p className="text-center text-gray-500 mb-3 text-sm font-medium uppercase tracking-wide">난이도 선택</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button
                      onClick={() => handleModeSelect("easy")}
                      variant={selectedMode === "easy" ? "primary" : "secondary"}
                      size="lg"
                      className="flex-1 min-w-[100px]"
                      disabled={isLoading}
                    >
                      Easy
                    </Button>
                    <Button
                      onClick={() => handleModeSelect("normal")}
                      variant={selectedMode === "normal" ? "primary" : "secondary"}
                      size="lg"
                      className="flex-1 min-w-[100px]"
                      disabled={isLoading}
                    >
                      Normal
                    </Button>
                    <Button
                      onClick={() => handleModeSelect("hard")}
                      variant={selectedMode === "hard" ? "primary" : "secondary"}
                      size="lg"
                      className="flex-1 min-w-[100px]"
                      disabled={isLoading}
                    >
                      Hard
                    </Button>
                  </div>
                </div>

                {selectedMode && (
                  <div className="border-t pt-4">
                    <p className="text-center text-gray-500 mb-3 text-sm font-medium uppercase tracking-wide">매칭 방식 선택</p>
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={handleRandomMatch}
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={isLoading}
                      >
                        🎲 랜덤 매칭
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateRoom}
                          variant="secondary"
                          size="lg"
                          className="flex-1"
                          disabled={isLoading}
                        >
                          🏠 방 만들기
                        </Button>
                        <div className="flex gap-2 flex-1">
                          <input
                            type="text"
                            value={inputRoomCode}
                            onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                            placeholder="방 코드"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center font-mono"
                            maxLength={6}
                            disabled={isLoading}
                          />
                          <Button
                            onClick={handleJoinRoom}
                            variant="secondary"
                            size="lg"
                            disabled={isLoading || !inputRoomCode.trim()}
                          >
                            입장
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
