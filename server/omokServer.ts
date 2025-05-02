import WebSocket, { WebSocketServer } from 'ws';
import { LLM } from 'llama-node';
import { LLamaCpp } from 'llama-node/dist/llm/llama-cpp.js';
import path from 'path';

const wss = new WebSocketServer({ port: 8080 });
const llama = new LLM(LLamaCpp);

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

wss.on('connection', (ws: WebSocket) => {
  console.log('✅ 클라이언트 접속됨');

  ws.on('message', async (message: WebSocket.RawData) => {
    const parsed = JSON.parse(message.toString());
    const { boardState } = parsed;

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

    await llama.createCompletion(params, (response) => {
      result += response.token;
    });

    try {
      const move = JSON.parse(result.trim());
      ws.send(JSON.stringify({ type: 'aiMove', move }));
    } catch (err) {
      console.error('❌ AI 응답 파싱 오류:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'AI 응답 파싱 실패' }));
    }
  });
});

console.log('🧠 오목 WebSocket 서버 실행 중: ws://localhost:8080');
