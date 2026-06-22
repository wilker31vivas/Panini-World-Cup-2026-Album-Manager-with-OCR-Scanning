import { createWorker, type Worker } from "tesseract.js";

let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker("eng").then(async (worker) => {
      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        load_system_dawg: "0",
        load_freq_dawg: "0",
      });
      return worker;
    });
  }
  return workerPromise;
}

export async function extractStickerCode(
  imageData: string,
  validTeamCodes: Set<string>,
): Promise<string | null> {
  try {
    const worker = await getWorker();
    const result = await worker.recognize(imageData);
    const text = result.data.text.toUpperCase().trim();

    const matches = [...text.matchAll(/([A-Z]{3})\s?(\d+)/g)];
    const validMatch = matches.find((m) => validTeamCodes.has(m[1]));

    return validMatch ? `${validMatch[1]} ${validMatch[2]}` : null;
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
}
