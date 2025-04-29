import { NextApiRequest, NextApiResponse } from 'next';
import { LlamaModel } from 'llama-node';

const llama = new LlamaModel();

// 오목 보드 상태를 텍스트로 변환하는 함수
function boardToString(board: number[][]): string {
  let boardState = '';
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      boardState += board[i][j] + ' ';
    }
    boardState += '\n';
  }
  return boardState.trim();
}

// 오목 AI 요청 처리 함수
async function getBestMove(board: number[][]) {
  const boardState = boardToString(board);
  const prompt = `Given the following Gomoku board state, suggest the next optimal move for player 1 (X):

    ${boardState}

    Provide the move as a coordinate (x, y).`;

  try {
    const response = await llama.generate({ prompt });
    const moveText = response.text.trim();
    const move = moveText.match(/x: (\d+), y: (\d+)/);
    if (move) {
      return { x: parseInt(move[1]), y: parseInt(move[2]) };
    }
    return { x: 7, y: 7 }; // 기본값
  } catch (error) {
    console.error('Error getting AI move:', error);
    return { x: 7, y: 7 }; // 기본값
  }
}

// API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { board } = req.body;
      if (!board || board.length !== 15 || board[0].length !== 15) {
        return res.status(400).json({ error: 'Invalid board format' });
      }

      const move = await getBestMove(board);
      return res.status(200).json({ move });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
