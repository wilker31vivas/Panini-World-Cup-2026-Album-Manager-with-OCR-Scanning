import { useRef, useEffect, useState, useCallback } from "react";
import type {CameraStatus} from '../types/index.ts'

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  statusCamera: CameraStatus;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export default function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [statusCamera, setStatusCamera] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setStatusCamera("loading");
    stopCamera()
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