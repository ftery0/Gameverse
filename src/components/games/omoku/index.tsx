'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="flex flex-col lg:flex-row w-full h-full gap-6 p-4">
      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center bg-amber-50 rounded-3xl shadow-inner p-6 relative">

        {/* Status Header */}
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className={`px-6 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 transition-colors ${turn === myColor
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-600'
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

        {/* Board */}
        <div
          className="relative bg-[#e3cca8] rounded-lg shadow-2xl p-4 select-none"
          style={{
            boxShadow: '10px 10px 30px rgba(0,0,0,0.3), inset 0 0 50px rgba(0,0,0,0.1)'
          }}
        >
          {/* Grid Lines */}
          <div className="grid grid-cols-15 grid-rows-15 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[500px] md:h-[500px] border-2 border-amber-900/50 relative">
            {Array.from({ length: 15 * 15 }).map((_, idx) => {
              const x = idx % 15;
              const y = Math.floor(idx / 15);
              return (
                <div
                  key={idx}
                  className="border-[0.5px] border-amber-900/30 relative flex items-center justify-center cursor-pointer"
                  onClick={() => handleCellClick(x, y)}
                >
                  {/* Stone */}
                  {board[y][x] !== 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`w-[80%] h-[80%] rounded-full shadow-md ${board[y][x] === 1
                          ? 'bg-gradient-to-br from-gray-800 to-black'
                          : 'bg-gradient-to-br from-white to-gray-200'
                        }`}
                      style={{
                        boxShadow: board[y][x] === 1
                          ? '2px 2px 4px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.2)'
                          : '2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(0,0,0,0.1)'
                      }}
                    />
                  )}

                  {/* Last Move Indicator */}
                  {lastMove?.x === x && lastMove?.y === y && (
                    <div className="absolute w-2 h-2 rounded-full bg-red-500/80 animate-ping" />
                  )}

                  {/* Hover Effect */}
                  {board[y][x] === 0 && turn === myColor && gameStatus === 'playing' && (
                    <div className={`absolute w-[60%] h-[60%] rounded-full opacity-0 hover:opacity-30 transition-opacity ${myColor === 'black' ? 'bg-black' : 'bg-white'
                      }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {(gameStatus === 'win' || gameStatus === 'loss') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10"
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

      {/* Sidebar (Chat & Info) */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Player Info */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${myColor === 'black' ? 'bg-black' : 'bg-white border border-gray-300'}`} />
              <span className="font-semibold text-sm">You</span>
            </div>
            <span className="text-xs text-gray-500">Rank: Gold 3</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${myColor === 'black' ? 'bg-white border border-gray-300' : 'bg-black'}`} />
              <span className="font-semibold text-sm">{opponentName || 'Opponent'}</span>
            </div>
            <span className="text-xs text-gray-500">Rank: ???</span>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden min-h-[300px]">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-700">Chat</div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50/50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'Me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.sender === 'Me'
                    ? 'bg-indigo-500 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
    </div>
  );
};

export default Omok;
