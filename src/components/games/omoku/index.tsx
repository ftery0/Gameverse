'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import Omok3D from './Omok3D';

interface OmokProps {
  mode: 'easy' | 'normal' | 'hard';
  roomId?: string;
  socket?: Socket;
  myColor?: 'black' | 'white';
  opponentName?: string;
  onGameEnd?: (result: 'win' | 'loss') => void;
}

const BOARD_SIZE = 15;

const Omok = ({ mode, roomId, socket, myColor, opponentName, onGameEnd }: OmokProps) => {
  const [board, setBoard] = useState<number[][]>(Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0)));
  const [turn, setTurn] = useState<'black' | 'white'>('black');
  const [lastMove, setLastMove] = useState<{ x: number, y: number } | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'win' | 'loss' | 'waiting'>('waiting');

  const [chatMessages, setChatMessages] = useState<{ sender: string, text: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;

    setGameStatus('playing');

    socket.on('gameUpdate', (data: { x: number, y: number, color: 'black' | 'white', nextTurn: 'black' | 'white' }) => {
      const { x, y, color, nextTurn } = data;
      setBoard(prev => {
        const newBoard = [...prev];
        newBoard[y] = [...newBoard[y]];
        newBoard[y][x] = color === 'black' ? 1 : 2;
        return newBoard;
      });
      setLastMove({ x, y });
      setTurn(nextTurn);
    });

    socket.on('gameEnd', (data: { winner: 'black' | 'white', reason: string }) => {
      if (data.winner === myColor) {
        setGameStatus('win');
        if (onGameEnd) onGameEnd('win');
      } else {
        setGameStatus('loss');
        if (onGameEnd) onGameEnd('loss');
      }
    });

    socket.on('error', (data: { message: string }) => {
      alert(data.message);
    });

    return () => {
      socket.off('gameUpdate');
      socket.off('gameEnd');
      socket.off('error');
    };
  }, [socket, myColor]);

  const handleCellClick = (x: number, y: number) => {
    if (gameStatus !== 'playing') return;
    if (turn !== myColor) return;
    if (board[y][x] !== 0) return;

    socket?.emit('gameMove', { roomId, x, y });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    // Chat implementation would go here (socket emit)
    // For now just local echo
    setChatMessages(prev => [...prev, { sender: 'Me', text: inputMessage }]);
    setInputMessage('');
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* 3D Game Board - Fullscreen */}
      <div className="absolute inset-0">
        <Omok3D
          board={board}
          onCellClick={handleCellClick}
          lastMove={lastMove}
          myColor={myColor}
          turn={turn}
        />
      </div>

      {/* Player Info - Top Left */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-xl shadow-2xl p-4 min-w-[200px] z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${(myColor || 'black') === 'black' ? 'bg-black border border-white' : 'bg-white'}`} />
              <span className="font-semibold text-sm text-white">You</span>
            </div>
            <span className="text-xs text-gray-300">Gold 3</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${(myColor || 'black') === 'black' ? 'bg-white' : 'bg-black border border-white'}`} />
              <span className="font-semibold text-sm text-white">{opponentName || 'Opponent'}</span>
            </div>
            <span className="text-xs text-gray-300">???</span>
          </div>
        </div>
      </div>

      {/* Exit Button - Top Right */}
      <button
        onClick={() => window.location.href = '/game/omok'}
        className="absolute top-4 right-4 px-4 py-2 bg-red-600/80 hover:bg-red-700 backdrop-blur-md text-white rounded-lg font-semibold shadow-lg transition-colors z-10"
      >
        나가기
      </button>

      {/* Turn Indicator - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className={`px-6 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 transition-colors backdrop-blur-md ${turn === myColor
          ? 'bg-indigo-600/90 text-white'
          : 'bg-gray-200/90 text-gray-700'
          }`}>
          {turn === myColor ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Your Turn
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              Opponent's Turn
            </>
          )}
        </div>
      </div>

      {/* Chat - Collapsible */}
      {isChatOpen ? (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-80 h-[500px] bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl flex flex-col z-10">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-white">Chat</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                  {msg.sender.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-white">{msg.sender}</span>
                    <span className="text-xs text-gray-400">now</span>
                  </div>
                  <p className="text-sm text-gray-200 mt-1">{msg.text}</p>
                </div>
              </div>
            ))}
            {chatMessages.length === 0 && (
              <p className="text-center text-gray-500 text-sm mt-8">No messages yet</p>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsChatOpen(true)}
          className="absolute bottom-4 right-4 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg flex items-center justify-center text-white transition-colors z-10"
          title="Open Chat"
        >
          <Send className="w-6 h-6" />
        </button>
      )}

      {/* Game Over Overlay */}
      <AnimatePresence>
        {(gameStatus === 'win' || gameStatus === 'loss') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4">
              {gameStatus === 'win' ? (
                <div className="text-green-500 mb-4 flex justify-center">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
              ) : (
                <div className="text-red-500 mb-4 flex justify-center">
                  <AlertCircle className="w-16 h-16" />
                </div>
              )}
              <h2 className="text-3xl font-bold mb-2 text-gray-800">
                {gameStatus === 'win' ? 'Victory!' : 'Defeat'}
              </h2>
              <p className="text-gray-600 mb-6">
                {gameStatus === 'win' ? 'Great moves! You dominated the board.' : 'Better luck next time!'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Omok;
