'use client';

import { useEffect, useRef, useState } from 'react';

interface OmokProps {
  mode: 'easy' | 'normal' | 'hard';
}

const Omok = ({ mode }: OmokProps) => {
  const [chatMessages, setChatMessages] = useState<string[]>([
    'AI: 안녕하세요! 오목 게임을 시작해봅시다.',
  ]);
  const [notifications, setNotifications] = useState<string[]>([
    '해준님이 입장하였습니다.',
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ WebSocket 연결됨');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'aiMove') {
        setChatMessages((prev) => [
          ...prev,
          `AI: 다음 수는 (${data.move.x}, ${data.move.y})입니다.`,
        ]);
      } else if (data.type === 'error') {
        setChatMessages((prev) => [
          ...prev,
          `AI 오류: ${data.message}`,
        ]);
      }
    };

    socket.onerror = (err) => {
      console.error('❌ WebSocket 오류:', err);
    };

    socket.onclose = () => {
      console.log('❌ WebSocket 연결 종료');
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    setChatMessages((prev) => [...prev, `나: ${inputMessage}`]);

    // 예시 보드 상태 (15x15 2차원 배열, 전부 0으로 초기화)
    const dummyBoard = Array.from({ length: 15 }, () =>
      Array.from({ length: 15 }, () => 0)
    );

    // WebSocket으로 전송
    socketRef.current?.send(
      JSON.stringify({ boardState: dummyBoard })
    );

    setInputMessage('');
  };

  return (
    <div className="flex w-full h-screen">
      {/* 왼쪽: 오목판 */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-yellow-200 border-4 border-gray-700 grid grid-cols-15 grid-rows-15">
          {Array.from({ length: 15 * 15 }).map((_, idx) => (
            <div key={idx} className="border border-gray-400"></div>
          ))}
        </div>
      </div>

      {/* 오른쪽: 채팅 & 네비 */}
      <div className="w-[400px] flex flex-col border-l border-gray-300">
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-xl font-bold mb-2">AI 채팅</h3>
          {chatMessages.map((msg, idx) => (
            <div key={idx} className="mb-1 text-sm">
              {msg}
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-gray-300">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded p-2 text-sm"
              placeholder="메시지를 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
            >
              전송
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-300 bg-gray-50 h-32 overflow-y-auto">
          <h3 className="text-md font-semibold mb-2">알림</h3>
          {notifications.map((note, idx) => (
            <div key={idx} className="text-xs text-gray-600">
              {note}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Omok;
