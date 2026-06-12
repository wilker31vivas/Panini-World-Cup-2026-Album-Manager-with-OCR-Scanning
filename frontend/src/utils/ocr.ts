import { createWorker, type Worker } from 'tesseract.js';

let workerPromise: Promise<Worker> | null = null;

function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('eng', undefined, undefined, {
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    } as any);
  }
  return workerPromise;
}

export async function extractStickerCode(imageData: string): Promise<string | null> {
  try {
    const worker = await getWorker();
    const result = await worker.recognize(imageData);
    const text = result.data.text.toUpperCase();

    const match = text.match(/[A-Z]{3}\s?\d+/);
    
    return match ? `${match[1]} ${match[2]}` : null;
  } catch (error) {
    console.error('OCR Error:', error);
    return null;
  }
}