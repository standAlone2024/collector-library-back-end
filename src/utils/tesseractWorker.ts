import { createWorker, type Worker } from 'tesseract.js';

let worker: Worker | null = null;

export async function initializeWorker() {
  if (worker) return;

  worker = await createWorker('kor+eng+jpn');
  console.log('Tesseract worker initialized with Korean, English, and Japanese');
}

export async function recognizeText(imageBuffer: Buffer): Promise<string> {
  if (!worker) {
    throw new Error('Tesseract worker not initialized');
  }

  const { data: { text } } = await worker.recognize(imageBuffer);
  return text;
}

export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

// 별도의 로깅 함수
export function logMessage(message: any) {
  console.log(message);
}