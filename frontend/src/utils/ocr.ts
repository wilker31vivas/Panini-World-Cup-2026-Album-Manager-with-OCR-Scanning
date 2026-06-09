import Tesseract from 'tesseract.js';

export async function extractStickerCode(imageData: string): Promise<string | null> {
  try {
    const result = await Tesseract.recognize(imageData, 'eng');
    const text = result.data.text.toUpperCase().trim();
    const match = text.match(/[A-Z]{3}\s?\d+/);
    return match ? match[0].replace(/\s+/, ' ') : null;
  } catch (error) {
    console.error('OCR Error:', error);
    return null;
  }
}
