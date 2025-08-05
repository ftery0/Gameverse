import WebSocket, { WebSocketServer } from 'ws';
import { LLM } from 'llama-node';
import { LLamaCpp } from 'llama-node/dist/llm/llama-cpp.js';
import path from 'path';

const wss = new WebSocketServer({ port: 8080 });
const llama = new LLM(LLamaCpp);

// 방 관리
interface GameRoom {
  id: string;
  gameType: string;
  difficulty: string;
  players: WebSocket[];
  boardState?: number[][];
}

const rooms = new Map<string, GameRoom>();
let isModelLoaded = false;

async function loadModel() {
  if (!isModelLoaded) {
    await llama.load({
        modelPath: path.resolve(process.cwd(), 'model/ggml-model.bin'),
        enableLogging: false,
        nCtx: 2048,
        seed: 1337,
        nGpuLayers: 0,
        f16Kv: false,
        logitsAll: false,
        vocabOnly: false,
        useMlock: false,
        embedding: false,
        useMmap: false
    });
    isModelLoaded = true;
    console.log('🧠 LLaMA 모델 로드 완료');
  }
}

// 방 생성 함수
function createRoom(gameType: string, difficulty: string): string {
  const roomId = `${gameType}-${difficulty}-${Date.now()}`;
  const room: GameRoom = {
    id: roomId,
    gameType,
    difficulty,
    players: [],
    boardState: Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => 0))
  };
  rooms.set(roomId, room);
  console.log(`🎮 방 생성: ${roomId} (${gameType}, ${difficulty})`);
  return roomId;
}

wss.on('connection', (ws: WebSocket) => {
  console.log('✅ 클라이언트 접속됨');

  ws.on('message', async (message: WebSocket.RawData) => {
    try {
      const data = JSON.parse(message.toString());
      
      // 방 생성 요청
      if (data.type === 'createRoom') {
        const { gameType, difficulty } = data;
        const roomId = createRoom(gameType, difficulty);
        const room = rooms.get(roomId);
        if (room) {
          room.players.push(ws);
          ws.send(JSON.stringify({ 
            type: 'roomCreated', 
            roomId,
            gameType,
            difficulty 
          }));
          console.log(`🎮 방 ${roomId}에 플레이어 입장`);
        }
        return;
      }

      // 방 입장 요청
      if (data.type === 'joinRoom') {
        const { roomId } = data;
        const room = rooms.get(roomId);
        if (room) {
          room.players.push(ws);
          ws.send(JSON.stringify({ 
            type: 'roomJoined', 
            roomId,
            gameType: room.gameType,
            difficulty: room.difficulty,
            boardState: room.boardState
          }));
          console.log(`🎮 방 ${roomId}에 플레이어 입장`);
        } else {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: '방을 찾을 수 없습니다.' 
          }));
        }
        return;
      }

      // 게임 진행 (기존 오목 로직)
      if (data.type === 'gameMove') {
        const { roomId, boardState } = data;
        const room = rooms.get(roomId);
        
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: '방을 찾을 수 없습니다.' }));
          return;
        }

        await loadModel();

        const prompt = `
당신은 오목 AI입니다.
현재 보드 상태는 다음과 같습니다 (15x15 배열입니다):

${boardState.map((row: any[]) => row.join(' ')).join('\n')}

당신은 흑돌입니다. 다음 수를 (x, y) 좌표로 응답하세요.
응답 형식: {"x": 7, "y": 8"}
`;

        const params = {
          nThreads: 4,
          nTokPredict: 50,
          topK: 40,
          topP: 0.9,
          temp: 0.7,
          repeatPenalty: 1,
          prompt,
        };

        let result = '';

        await llama.createCompletion(params, (response: any) => {
          result += response.token;
        });

        try {
          const move = JSON.parse(result.trim());
          // 방의 모든 플레이어에게 AI 이동 전송
          room.players.forEach(player => {
            if (player.readyState === WebSocket.OPEN) {
              player.send(JSON.stringify({ 
                type: 'aiMove', 
                move,
                roomId 
              }));
            }
          });
        } catch (err) {
          console.error('❌ AI 응답 파싱 오류:', err);
          ws.send(JSON.stringify({ type: 'error', message: 'AI 응답 파싱 실패' }));
        }
      }
    } catch (error) {
      console.error('❌ 메시지 처리 오류:', error);
      ws.send(JSON.stringify({ type: 'error', message: '메시지 처리 실패' }));
    }
  });

  ws.on('close', () => {
    console.log('❌ 클라이언트 연결 종료');
    // 방에서 플레이어 제거
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.indexOf(ws);
      if (playerIndex > -1) {
        room.players.splice(playerIndex, 1);
        console.log(`🎮 방 ${roomId}에서 플레이어 퇴장`);
        
        // 방이 비면 방 삭제
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`🎮 방 ${roomId} 삭제`);
        }
      }
    });
  });
});

console.log('🧠 게임 WebSocket 서버 실행 중: ws://localhost:8080');
