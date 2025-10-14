"use client"

import {useState, useEffect, useRef} from 'react';
import {io, Socket} from 'socket.io-client';
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

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name) {
      setUserName(session.user.name);
    } // else if (status === 'unauthenticated') {
      // console.log('User is not authenticated. Redirecting to login page.');
      // router.push('/api/auth/signin'); // 로그인 페이지로 리디렉션
    // }
  }, [session, status]); // router 의존성 제거

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socket.on('waitingPlayersUpdate', (players: string[]) => {
        setWaitingPlayers(players);
        console.log('Waiting players updated:', players);
      });

      socket.on('matchFound', (data: { roomId: string, opponent: string, gameName: string, opponentId: string }) => {
        setMatchFound(true);
        setRoomId(data.roomId);
        setOpponent(data.opponent);
        setSelectedGame(data.gameName);
        setOpponentId(data.opponentId); // opponentId 저장
        console.log('Match found:', data);
        // 매칭 완료 시 해당 방으로 리다이렉트
        router.push(`/ranking-game/${data.roomId}`);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setMatchFound(false);
        setRoomId(null);
        setOpponent(null);
        setSelectedGame(null);
        setSocket(null);
        setOpponentId(null); // opponentId 초기화
      });

      // 에러 처리 추가
      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        if (err.message === 'Authentication error') {
          alert('인증 오류: 로그인 정보를 확인해주세요.');
          router.push('/api/auth/signin');
        }
      });

      return () => {
        socket.off('connect');
        socket.off('waitingPlayersUpdate');
        socket.off('matchFound');
        socket.off('disconnect');
        socket.off('connect_error'); // 에러 리스너 해제
        socket.disconnect();
      };
    }
  }, [socket, router]);

  const handleSelectGame = (game: string) => {
    if (status === 'unauthenticated') {
      alert('게임을 선택하려면 로그인해야 합니다.');
      router.push('/api/auth/signin'); // 로그인 페이지로 리디렉션
      return;
    }
    setSelectedGame(game);
  };

  const handleStartMatching = () => {
    if (status !== 'authenticated' || !session?.user?.id || !session?.jwt) { // session.jwt 추가
      alert('로그인이 필요합니다.');
      console.log(session?.user);
      console.log(session?.jwt);
      // router.push('/api/auth/signin'); // 로그인 페이지로 리디렉션
      return;
    }

    const userId = session.user.id as string;
    const currentUser = session.user.name as string;
    const jwtToken = session.jwt as string; // JWT 토큰 가져오기

    if (!socket) {
      const newSocket = io('http://localhost:8080', {
        auth: {
          token: jwtToken, 
        },
      });
      setSocket(newSocket);
      newSocket.on('connect', () => {
        if (currentUser && selectedGame) {
          console.log(`Joining queue as ${currentUser} (${userId}) for ${selectedGame}`);
          newSocket.emit('joinQueue', { userName: currentUser, userId, gameName: selectedGame });
        }
      });
    } else if (currentUser && selectedGame) {
      console.log(`Joining queue as ${currentUser} (${userId}) for ${selectedGame}`);
      socket.emit('joinQueue', { userName: currentUser, userId, gameName: selectedGame });
    } else {
      alert('게임을 선택해주세요!');
    }
  };

  if (status === 'loading') {
    return <div className="text-center p-8 text-xl font-semibold">세션 로딩 중...</div>;
  }

  return(
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
                {/* 다른 게임 버튼도 여기에 추가 */}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">선택된 게임: {selectedGame}</h2>
              {status === 'authenticated' ? (
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 w-1/3"
                  onClick={handleStartMatching}
                >
                  {socket && socket.connected ? `매칭 대기 중...` : `매칭 시작하기`}
                </button>
              ) : (
                <p className="text-lg text-red-500">매칭을 시작하려면 로그인해주세요.</p>
              )}
              <br/>
              <p className="text-xl font-bold text-gray-800 mb-6">랭킹 게임은 랜덤으로 플레이어를 만나게임을 합니다.</p>
              {waitingPlayers.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-2xl font-semibold text-gray-700">대기 중인 플레이어:</h2>
                  <ul className="list-disc list-inside">
                    {waitingPlayers.map((player, index) => (
                      <li key={index} className="text-gray-600">{player}</li>
                    ))}
                  </ul>
                </div>
              )}
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