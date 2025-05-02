// import { NextRequest, NextResponse } from 'next/server';
// import { LlamaCpp } from '@llama-node/llama-cpp';
// import { Llama } from 'llama-node';
// import fs from 'fs';
// import path from 'path';

// const llama = new Llama(LlamaCpp);

// let isModelLoaded = false;

// export async function POST(req: NextRequest) {
//   const { userMessage, history = '' } = await req.json();

//   const modelPath = path.join(process.cwd(), 'model', 'ggml-model.bin');
//   const systemPrompt = fs.readFileSync(path.join(process.cwd(), 'prompts/system.txt'), 'utf-8');

//   if (!isModelLoaded) {
//     await llama.load({
//       modelPath,
//       enableLogging: false,
//       nCtx: 2048,
//       seed: 42,
//     });
//     isModelLoaded = true;
//   }

//   const fullPrompt = `[시스템]: ${systemPrompt}\n${history}[유저]: ${userMessage}\n[친구]:`;

//   const result = await llama.createCompletion({
//     prompt: fullPrompt,
//     temperature: 0.7,
//     topP: 0.9,
//     maxTokens: 200,
//     stop: ['[유저]:', '\n'],
//   });

//   const reply = result.choices[0].text.trim();

//   return NextResponse.json({ reply });
// }
