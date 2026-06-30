import { useRef, useEffect, useState, useCallback } from "react";
import { validateImage } from '../utils/fileValidation';
import { extractStickerCode } from '../utils/ocr';
import { stickerApi } from '../services/api';
import type { Sticker } from '../types/index';

type CameraStatus = "idle" | "loading" | "active" | "error";
type ScanState = 'idle' | 'scanning' | 'processing' | 'result';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  statusCamera: CameraStatus;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

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

function ScanCorners() {
  const base = 'absolute w-5 h-5 border-[#c8102e] border-solid';
  return (
    <>
      <div className={`${base} top-5 left-5 border-t-[3px] border-l-[3px] rounded-tl`} />
      <div className={`${base} top-5 right-5 border-t-[3px] border-r-[3px] rounded-tr`} />
      <div className={`${base} bottom-5 left-5 border-b-[3px] border-l-[3px] rounded-bl`} />
      <div className={`${base} bottom-5 right-5 border-b-[3px] border-r-[3px] rounded-br`} />
    </>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mx-4 mt-3 flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
      <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-xs font-semibold text-red-600">{message}</span>
    </div>
  );
}

function LoadingBanner({ message = "Escaneando..." }: { message?: string }) {
  return (
    <div className="mx-4 mt-3 flex items-center justify-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2.5">
      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="text-xs font-semibold text-blue-600">{message}</span>
    </div>
  );
}

function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [statusCamera, setStatusCamera] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setStatusCamera("loading");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStatusCamera("active");
      }
    } catch (err: any) {
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Acesso negado. Habilite o acesso à câmera nas configurações.'
          : 'Não é possível acessar a câmera.';
      setError(msg);
      setStatusCamera("error");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStatusCamera("idle");
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { videoRef, statusCamera, error, startCamera, stopCamera };
}

function useScanner(): UseScannerReturn {
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

      setResult(sticker);
      setStatusScanner('result');
    } catch (err) {
      setErrorScanner(err instanceof Error ? err.message : 'Erro ao processar a imagem');
      setStatusScanner('idle');
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
  };

  return { fileInputRef, canvasRef, errorScanner, handleFileUpload, statusScanner, result, isProcessing, resetScanner, validateAndProcess, updateStatus, capturedImage, setCapturedImage, }
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function Scanner() {
  const { statusCamera, videoRef, error, startCamera, stopCamera } = useCamera();
  const { fileInputRef, canvasRef, errorScanner, handleFileUpload, statusScanner, result, isProcessing, resetScanner, validateAndProcess, updateStatus, capturedImage, setCapturedImage } = useScanner();

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg");

    setCapturedImage(imageData);
  };

  if (statusScanner === 'result' && result) {
    return <Result result={result} isProcessing={isProcessing} reset={() => {
      resetScanner();
      startCamera()
    }} updateStatus={updateStatus} />
  }

  if (capturedImage) {
    return (
      <CapturedPreview
        image={capturedImage}
        onRetry={() => {
          resetScanner();
          startCamera()
        }}
        onScan={() => validateAndProcess(capturedImage)}
        loading={isProcessing}
        errorScanner={errorScanner}
      />
    )
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        <CameraStream videoRef={videoRef} status={statusCamera} error={error} />

        {errorScanner && <ErrorBanner message={errorScanner} />}

        {isProcessing && <LoadingBanner />}

        <CameraControls status={statusCamera} startCamera={startCamera} stopCamera={stopCamera} fileInputRef={fileInputRef} captureFrame={captureFrame} />

      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      <p className="text-xs text-gray-500">
        Estado: <span className="font-mono">{statusCamera}</span>
      </p>
    </div>
  );
}

export function CameraStream({ videoRef, status, error }: { videoRef: React.RefObject<HTMLVideoElement | null>, status: CameraStatus, error: string | null }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="bg-[#0a1628] relative" style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {status === "active" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-20 border-2 border-[#d4a017] rounded-lg opacity-70" />
          </div>
        )}


        {status !== "active" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2">
            {status === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 bg-[#1a2d4a] rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium">Câmera inativa</p>
              </div>
            )}
            {status === "loading" && (
              <p className="text-sm text-white/60">Iniciando câmera...</p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-400 text-center px-4">{error}</p>
            )}
          </div>
        )}

        {/* Indicador activo */}
        {status === "active" && (

          <>
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[#0a1628]/30" />
              <ScanCorners />

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#0a1628]/70 text-slate-400 text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                Aponte para o código na figurinha.
              </div>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 rounded-full px-2 py-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-xs">AO VIVO</span>
            </div>
          </>

        )}
      </div>
    </div>
  )
}

export function CameraControls({ status, startCamera, stopCamera, fileInputRef, captureFrame }) {
  return (
    <div className="p-4 space-y-2.5">
      {status === 'active' ? (
        <>
          <button
            onClick={captureFrame}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm shadow-red-600/20 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Capturar figurinha
          </button>
          <button
            onClick={stopCamera}
            className="w-full flex items-center justify-center gap-2 bg-white text-slate-600 font-bold text-sm py-3 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Fechar câmera
          </button>
        </>
      ) : (
        <>
          <button
            onClick={startCamera}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm shadow-red-600/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Abrir câmera
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 bg-[#0a1628] hover:bg-[#122035] active:scale-95 text-white font-bold text-sm py-3 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Carregar foto da galeria
          </button>
        </>
      )}
    </div>
  )
}

export function Result({ result, isProcessing, reset, updateStatus }) {
  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        <div className="bg-[#0a1628] px-4 py-3 flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm">Figurinha detectada</span>
        </div>

        <div className="p-4 space-y-3">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Código</p>
            <p className="text-3xl font-extrabold text-[#0a1628] font-mono tracking-wider leading-none">
              {result.code}
            </p>
            <p className="text-xs text-slate-400 mt-1.5">
              {result.team} · #{result.number}
            </p>
          </div>

          <div
            className={[
              'flex items-center gap-3 rounded-xl p-3.5 border',
              result.owned
                ? 'bg-green-50 border-green-100'
                : 'bg-red-50 border-red-100',
            ].join(' ')}
          >
            <div
              className={[
                'w-3 h-3 rounded-full flex-shrink-0',
                result.owned ? 'bg-green-500' : 'bg-red-500',
              ].join(' ')}
            />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                Estado atual
              </p>
              <p className={`text-sm font-bold ${result.owned ? 'text-green-700' : 'text-red-600'}`}>
                {result.owned ? 'Eu já tenho.' : 'Eu não tenho'}
              </p>
            </div>
          </div>

          <button
            onClick={() => updateStatus(!result.owned)}
            disabled={isProcessing}
            className={[
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95',
              isProcessing ? 'opacity-50 cursor-not-allowed' : '',
              result.owned
                ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                : 'bg-green-600 text-white hover:bg-green-700',
            ].join(' ')}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : result.owned ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Marcar como faltante
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Marcar como obtido
              </>
            )}
          </button>

          <button
            onClick={reset}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-[#0a1628] text-white hover:bg-[#122035] active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Escaneie outra figurinha
          </button>
        </div>
      </div>
    </div>
  );
}

function CapturedPreview({ image, onRetry, onScan, loading, errorScanner }: { image: string, onRetry: () => void, onScan: () => void, loading: boolean, errorScanner: string | null | undefined }) {
  return (
    <div className="p-4 max-w-md mx-auto space-y-4">

      <div className="rounded-2xl overflow-hidden">
        <img
          src={image}
          alt="captura"
          className="w-full"
        />
      </div>

      {errorScanner && <ErrorBanner message={errorScanner} />}
      {loading && <LoadingBanner />}

      <button
        onClick={onScan}
        disabled={loading}
        className="w-full bg-red-600 text-white py-3 rounded-xl"
      >
        Escanear
      </button>

      <button
        onClick={onRetry}
        className="w-full border py-3 rounded-xl"
      >
        Tente novamente
      </button>

    </div>
  );
}