import { useRef, useEffect, useState } from "react";
import type { Sticker } from '../types/index';
import { stickerApi } from '../services/api';
import { extractStickerCode } from '../utils/ocr';
import { validateImage } from '../utils/fileValidation';

type ScanState = 'idle' | 'processing' | 'result';

interface UseScannerReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  errorScanner: string | null | undefined
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement, Element>) => void
  statusScanner: ScanState
  result: Sticker | null
  isProcessing: boolean
  resetScanner: () => void
  updateStatus: (owned: boolean) => Promise<void>
  capturedImage: string | null
  setCapturedImage: React.Dispatch<React.SetStateAction<string | null>>
  validateAndProcess: (imageData: string) => Promise<void>
}

export default function useScanner(): UseScannerReturn {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorScanner, setErrorScanner] = useState<string | null | undefined>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [statusScanner, setStatusScanner] = useState<ScanState>('idle');
  const [validCodes, setValidCodes] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<Sticker | null>(null);
  const isProcessing = statusScanner === 'processing';
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const getValidCodes = async () => {
      try {
        const teams = await stickerApi.getAllStickers();
        setValidCodes(new Set(teams.map(t => t.team)));
      } catch (error) {
        console.error('Erro carregando seleçoes:', error);
      }
    };
    getValidCodes()
  }, []);

  const validateAndProcess = async (imageData: string) => {

    setStatusScanner('processing');
    setErrorScanner(null);
    try {
      const code = await extractStickerCode(imageData, validCodes);
      if (!code) {
        setErrorScanner('Nenhum código foi detectado. Por favor, tente novamente.');
        setStatusScanner('idle');
        return;
      }

      const sticker = await stickerApi.getStickerByCode(code);
      if (!sticker) {
        setErrorScanner(`A figurinha "${code}" não está no banco de dados.`);
        setStatusScanner('idle');
        return;
      }

      setCapturedImage(null)
      setResult(sticker);
      setStatusScanner('result');
    } catch (err) {
      setErrorScanner(err instanceof Error ? err.message : 'Erro ao processar a imagem');
      setStatusScanner('idle');
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      setErrorScanner(validation.error);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const imageData = ev.target?.result as string;
      validateAndProcess(imageData);
    };
    reader.onerror = () => {
      setErrorScanner('Erro ao ler arquivo. Tente novamente.');
    };
    reader.readAsDataURL(file);
  };

  const updateStatus = async (owned: boolean) => {
    if (!result) return;
    setStatusScanner('processing');
    try {
      await stickerApi.updateStickerStatus(result.code, owned);
      setResult({ ...result, owned });
      setStatusScanner('result');
    } catch (err) {
      setErrorScanner(err instanceof Error ? err.message : 'Erro de atualização');
      setStatusScanner('result');
    }
  };

  const resetScanner = () => {
    setCapturedImage(null)
    setResult(null);
    setErrorScanner(null);
    setStatusScanner('idle');
  };

  return { fileInputRef, canvasRef, errorScanner, handleFileUpload, statusScanner, result, isProcessing, resetScanner, validateAndProcess, updateStatus, capturedImage, setCapturedImage, }
}