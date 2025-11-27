import Omok from './omoku';
import { Socket } from 'socket.io-client';

interface GameComponentProps {
  mode: 'easy' | 'normal' | 'hard';
  id: string;
  roomId?: string;
  socket?: Socket;
  myColor?: 'black' | 'white';
  opponentName?: string;
}

export const getGameComponent = ({ id, mode, roomId, socket, myColor, opponentName }: GameComponentProps) => {
  switch (id) {
    case 'omok':
      return <Omok mode={mode} roomId={roomId} socket={socket} myColor={myColor} opponentName={opponentName} />;
    case 'chess':
      return <div>체스 게임 (개발 중)</div>;
    case 'coding-game':
      return <div>코딩 게임 (개발 중)</div>;
    default:
      return <div>게임을 찾을 수 없습니다.</div>;
  }
};
