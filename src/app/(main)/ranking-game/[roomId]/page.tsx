"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface ChessGameProps {
  params: { roomId: string }; // Next.js dynamic route에서 가져오기
}

const ChessGame = ({ params }: ChessGameProps) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [opponent, setOpponent] = useState<string>("");
  const [gameLog, setGameLog] = useState<string[]>([]);

  useEffect(() => {
    if (!session) return;

    const s = io("http://localhost:8080", {
      auth: { token: session.jwt },
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("체스방 연결 완료:", params.roomId);
      s.emit("joinRoom", { roomId: params.roomId, userId: session.user?.id });
    });

    s.on("gameUpdate", (move) => {
      setGameLog((prev) => [...prev, `상대 움직임: ${JSON.stringify(move)}`]);
    });

    s.on("matchInfo", (data) => {
      setOpponent(data.opponent);
    });

    return () => {
      s.disconnect();
    };
  }, [session, params.roomId]);

  const handleMove = (move: { x: number; y: number }) => {
    if (!socket) return;
    socket.emit("gameMove", { roomId: params.roomId, move });
    setGameLog((prev) => [...prev, `내 움직임: ${JSON.stringify(move)}`]);
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen p-4 gap-6">
      {/* 체스판 */}
      <div className="flex-1 flex justify-center items-center">
        <div className="w-full max-w-[90vmin] aspect-square grid grid-cols-8 border-4 border-gray-800">
          {Array.from({ length: 64 }).map((_, idx) => {
            const row = Math.floor(idx / 8);
            const col = idx % 8;
            const isDark = (row + col) % 2 === 1;

            return (
              <div
                key={idx}
                onClick={() => handleMove({ x: col, y: row })} // 칸 클릭 → 이동 이벤트
                className={`w-full h-full cursor-pointer ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* 유저 / 게임 정보 */}
      <div className="md:w-72 w-full border rounded-xl shadow-lg bg-white p-4 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-center border-b pb-2">게임 정보</h2>
        <div className="space-y-2">
          <p className="font-semibold">방 ID: {params.roomId}</p>
          <p>
            <span className="font-semibold">{session?.user?.name}</span> vs{" "}
            <span className="font-semibold">{opponent}</span>
          </p>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">게임 로그</h3>
          <ul className="text-sm max-h-60 overflow-y-auto">
            {gameLog.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
