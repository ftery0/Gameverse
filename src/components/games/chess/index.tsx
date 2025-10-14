import React from 'react';
import axios from 'axios'; // axios 임포트
import { Button } from '@/components/button'; // Button 컴포넌트 임포트

interface ChessGameProps {
  roomId: string;
  opponent: string;
  currentUser: string;
  // TODO: 실제 userId를 받아오도록 수정 (NextAuth.js 등)
  currentUserId: string; // 현재 유저의 ID를 props로 받음 (임시)
  opponentId: string; // 상대방 유저의 ID를 props로 받음 (임시)
}

const ChessGame: React.FC<ChessGameProps> = ({ roomId, opponent, currentUser, currentUserId, opponentId }) => {
  // 여기에 체스 게임 로직 및 UI를 구현합니다.
  // 예를 들어, 체스 보드, 말 움직임, 게임 상태 표시 등.

  const handleGameEnd = async (winnerId: string | null, loserId: string | null, isDraw: boolean) => {
    try {
      const gameResult = {
        gameName: 'chess',
        players: [
          { userId: currentUserId, userName: currentUser },
          { userId: opponentId, userName: opponent },
        ],
        winner: winnerId ? { userId: winnerId, userName: winnerId === currentUserId ? currentUser : opponent } : null,
        loser: loserId ? { userId: loserId, userName: loserId === currentUserId ? currentUser : opponent } : null,
        draw: isDraw,
        // endTime은 백엔드에서 자동 생성되므로 여기서는 전송하지 않음
      };

      await axios.post('http://localhost:5000/api/game/result', gameResult);
      console.log('Game result saved successfully!', gameResult);
      alert('게임 결과가 성공적으로 저장되었습니다!');
      // 게임 종료 후 매칭 페이지 등으로 돌아가는 로직 추가
    } catch (error) {
      console.error('Error saving game result:', error);
      alert('게임 결과 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">체스 게임</h2>
      <p className="text-lg">현재 플레이어: {currentUser}</p>
      <p className="text-lg">상대방: {opponent}</p>
      <div className="mt-6 p-8 bg-white border border-gray-300 rounded-lg flex items-center justify-center w-64 h-64">
        <p className="text-gray-500">체스 보드 (구현 예정)</p>
      </div>
    </div>
  );
};

export default ChessGame;
