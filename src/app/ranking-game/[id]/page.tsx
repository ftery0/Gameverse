'use client';

import { useParams } from 'next/navigation';
import { rankedGames } from '@/constants/game/game.constants';
import { Button } from "@/components/button";
import { useState, useEffect } from 'react';
import { getGameComponent } from '@/components/games/usegame';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';

const RankedGamePage = () => {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const game = rankedGames.find((game) => game.id === id);

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

    const handleStartRanked = async () => {
        setIsLoading(true);

        try {
            const newSocket = io('http://localhost:8080');
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('✅ Socket connected (Ranked)');
                // Join Ranked Queue
                newSocket.emit('joinQueue', {
                    userId: `user-${Math.floor(Math.random() * 10000)}`,
                    userName: `Player ${Math.floor(Math.random() * 100)}`,
                    gameName: id,
                    isRanked: true
                });
            });

            newSocket.on('matchFound', (data: { roomId: string, opponent: string, color: 'black' | 'white' }) => {
                console.log('🎮 Ranked match found:', data);
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

    if (roomId && socket && matchInfo) {
        return (
            <div className="w-full h-screen overflow-hidden">
                {/* Pass socket and match info to game component */}
                {getGameComponent({
                    mode: 'normal', // Default mode for ranked
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
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
            {/* Game Intro Card */}
            <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">

                {/* Left: Image */}
                <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
                    <Link
                        href="/"
                        className="absolute top-6 left-6 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm font-semibold transition shadow-sm z-10"
                    >
                        ← Home
                    </Link>
                    <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="inline-block px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full mb-2">
                            🏆 RANKED
                        </div>
                    </div>
                </div>

                {/* Right: Info + Start Button */}
                <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{game.title}</h1>
                        <p className="text-base md:text-lg text-gray-300 mb-6 leading-relaxed">
                            {game.detail}
                        </p>
                        <div className="flex flex-col gap-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span>실시간 매칭</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                <span>랭킹 시스템</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span>티어 승급</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 mt-8">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-yellow-500 font-semibold animate-pulse">Finding opponent...</p>
                            </div>
                        ) : (
                            <Button
                                onClick={handleStartRanked}
                                variant="primary"
                                size="lg"
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-lg py-4"
                            >
                                🎮 Start Ranked Match
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RankedGamePage;
