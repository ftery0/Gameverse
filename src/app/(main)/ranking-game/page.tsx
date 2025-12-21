"use client"

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react'; // NextAuth.js의 useSession 임포트
import { useRouter } from 'next/navigation'; // useRouter 임포트
import Image from 'next/image'; // Image 컴포넌트 임포트

const RankingGame = () => {
  const { data: session, status } = useSession(); // 세션 정보 가져오기
  const router = useRouter(); // useRouter 훅 초기화
  const [socket, setSocket] = useState<Socket | null>(null);
  const [waitingPlayers, setWaitingPlayers] = useState<string[]>([]);
  const [matchFound, setMatchFound] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [opponentId, setOpponentId] = useState<string | null>(null); // opponentId 상태 추가
  const [userName, setUserName] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false); // 매칭 중 상태
  const [waitingCount, setWaitingCount] = useState<number>(0); // 대기 인원 수

  const [isConnected, setIsConnected] = useState<boolean>(false);

  // 세션이 있고 인증되었을 때 소켓 연결 초기화
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name && session?.jwt) {
      setUserName(session.user.name);

      const newSocket = io('http://localhost:8080', {
        auth: {
          token: session.jwt,
        },
        reconnection: true,
        reconnectionAttempts: 5,
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
      });

      newSocket.on('waitingPlayersUpdate', (players: string[]) => {
        setWaitingPlayers(players);
      });

      newSocket.on('matchFound', (data: { roomId: string, opponent: string, gameName: string, opponentId: string }) => {
        setMatchFound(true);
        setIsSearching(false);
        setRoomId(data.roomId);
        setOpponent(data.opponent);
        setSelectedGame(data.gameName);
        setOpponentId(data.opponentId);
        console.log('Match found:', data);
        router.push(`/ranking-game/room/${data.roomId}`);
      });

      newSocket.on('joinQueueSuccess', (data: { isRanked: boolean, gameName: string }) => {
        if (data.isRanked) {
          setIsSearching(true);
          console.log(`Joined ranked queue for ${data.gameName}`);
        }
      });

      newSocket.on('waitingRankedCount', (data: { gameName: string, count: number }) => {
        // 현재 선택된 게임과 업데이트된 게임이 같을 때만 카운트 업데이트
        // 또는 선택된 게임이 없더라도 미리 업데이트 해둘 수 있음 (여기선 선택된 게임 기준)
         setWaitingCount(data.count);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
        setIsSearching(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        if (err.message === 'Authentication error') {
          // alert('인증 오류: 로그인 정보를 확인해주세요.'); // 너무 자주 뜰 수 있으므로 콘솔에만
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [session, status, router]);

  const handleSelectGame = (game: string) => {
    if (status === 'unauthenticated') {
      alert('게임을 선택하려면 로그인해야 합니다.');
      router.push('/api/auth/signin');
      return;
    }
    setSelectedGame(game);
    // 게임 선택 시 UI 상태 초기화 (필요하다면)
    setIsSearching(false); 
  };

  const handleStartMatching = () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isSearching) {
      return;
    }

    if (!socket || !isConnected) {
      alert('서버와 연결되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (userName && selectedGame) {
      console.log(`Joining queue as ${userName} (${session.user.id}) for ${selectedGame}`);
      socket.emit('joinQueue', { userName, userId: session.user.id, gameName: selectedGame, isRanked: true });
      // 낙관적 업데이트: 서버 응답 기다리지 않고 바로 로딩 표시 (선택 사항, 여기선 서버 응답 의존)
      // setIsSearching(true); 
    } else {
      alert('게임을 선택해주세요!');
    }
  };

  const handleCancelMatching = () => {
    if (socket) {
      socket.emit("leaveQueue");
      setIsSearching(false);
      setWaitingCount(0);
    }
  };

  if (status === 'loading') {
    return <div className="text-center p-8 text-xl font-semibold">세션 로딩 중...</div>;
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">랭크게임을 시작합니다</h1>
      {!matchFound ? (
        <>
          {!selectedGame ? (
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">게임을 선택해주세요:</h2>
              <div className="flex space-x-4">
                <div
                  className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 w-48 h-48"
                  onClick={() => handleSelectGame('chess')}
                >
                  <Image
                    src="/images/chessrank.png"
                    alt="Chess Rank"
                    width={100}
                    height={100}
                    className="mb-2"
                  />
                  <span className="text-xl font-semibold text-gray-800">체스</span>
                </div>
                <div
                  className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 w-48 h-48"
                  onClick={() => handleSelectGame('omok')}
                >
                  <Image
                    src="/images/omok.png"
                    alt="Omok Rank"
                    width={100}
                    height={100}
                    className="mb-2"
                  />
                  <span className="text-xl font-semibold text-gray-800">오목</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">선택된 게임: {selectedGame}</h2>
              {status === 'authenticated' ? (
                <div className="flex flex-col items-center w-full">
                  {!isSearching ? (
                    <button
                      className={`font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-md transform hover:scale-105 ${isConnected ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                      onClick={handleStartMatching}
                      disabled={!isConnected}
                    >
                      {isConnected ? '매칭 시작하기' : '서버 연결 중...'}
                    </button>
                  ) : (
                    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border border-blue-100">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-500 mb-4"></div>
                      <p className="text-xl font-bold text-blue-600 mb-2">상대 찾는 중...</p>
                      <p className="text-gray-600 mb-4 font-medium">현재 대기 인원: <span className="text-blue-600 text-lg">{waitingCount}</span>명</p>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300 shadow-sm"
                        onClick={handleCancelMatching}
                      >
                        매칭 취소
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-lg text-red-500">매칭을 시작하려면 로그인해주세요.</p>
              )}
              <br />
              <p className="text-xl font-bold text-gray-800 mb-6 mt-8">랭킹 게임은 랜덤으로 플레이어를 만나게임을 합니다.</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-green-600">매칭 완료!</h2>
          <p className="text-xl text-gray-800">게임으로 이동 중...</p>
        </div>
      )}
    </div>
  )
}

export default RankingGame;