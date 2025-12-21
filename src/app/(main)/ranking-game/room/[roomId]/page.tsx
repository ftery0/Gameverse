"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { getGameComponent } from "@/components/games/usegame";

interface RankingGameRoomProps {
  params: { roomId: string }; // Next.js dynamic route에서 가져오기
}

const RankingGameRoom = ({ params }: RankingGameRoomProps) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [opponent, setOpponent] = useState<string>("");
  const [gameName, setGameName] = useState<string>("");
  const [myColor, setMyColor] = useState<'black' | 'white'>('black');

  useEffect(() => {
    if (!session) return;

    const s = io("http://localhost:8080", {
      auth: { token: session.jwt },
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("게임방 연결 완료:", params.roomId);
      s.emit("joinRoom", { roomId: params.roomId, userId: session.user?.id });
    });

    s.on("matchInfo", (data: { opponent: string, gameName?: string, color?: 'black' | 'white' }) => {
      setOpponent(data.opponent);
      if (data.gameName) setGameName(data.gameName);
      if (data.color) setMyColor(data.color);
    });

    // 게임 타입 정보를 받기 위한 이벤트 리스너 추가
    s.on("gameType", (data: { gameName: string, color: 'black' | 'white' }) => {
      setGameName(data.gameName);
      setMyColor(data.color);
    });

    return () => {
      s.disconnect();
    };
  }, [session, params.roomId]);

  // 게임 컴포넌트가 있는 경우 렌더링
  if (gameName && socket) {
    return (
      <div className="w-full h-screen overflow-hidden">
        {getGameComponent({
          mode: 'normal',
          id: gameName,
          roomId: params.roomId,
          socket: socket,
          myColor: myColor,
          opponentName: opponent
        })}
      </div>
    );
  }

  // 로딩 중이거나 게임 정보가 없는 경우
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen p-4">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-700">게임 로딩 중...</p>
        <p className="text-sm text-gray-500 mt-2">방 ID: {params.roomId}</p>
      </div>
    </div>
  );
};

export default RankingGameRoom;

