import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sticker } from '../types/index';
import { stickerApi } from '../services/api';
import { extractStickerCode } from '../utils/ocr';

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Sticker | null>(null);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (err: any) {
      console.error('Camera error:', err); 
      const errorMsg = err?.name === 'NotAllowedError'
        ? 'Permission denied. Grant camera access in browser settings.'
        : 'Cannot access camera. Use HTTPS or localhost.';
      setError(errorMsg);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setScanning(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const imageData = canvasRef.current.toDataURL('image/jpeg');
    await processImage(imageData);
  };

  const processImage = async (imageData: string) => {
    setLoading(true);
    setError(null);
    try {
      const code = await extractStickerCode(imageData);
      if (!code) {
        setError('No sticker code detected. Please try again.');
        setLoading(false);
        return;
      }

      setDetectedCode(code);
      const sticker = await stickerApi.getStickerByCode(code);

      if (!sticker) {
        setError(`Sticker "${code}" not found in database.`);
        setDetectedCode(null);
      } else {
        setResult(sticker);
        stopCamera();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing image');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      processImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const updateStatus = async (owned: boolean) => {
    if (!result) return;
    setLoading(true);
    try {
      await stickerApi.updateStickerStatus(result.code, owned);
      setResult({ ...result, owned });
      alert(`Sticker marked as ${owned ? 'Owned' : 'Missing'}`);
      resetScan();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setDetectedCode(null);
    setError(null);
    startCamera();
  };

  if (result) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Sticker Detected!</h2>

          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="text-gray-600 text-sm">Code</p>
            <p className="text-3xl font-bold text-gray-900">{result.code}</p>
            <p className="text-gray-600 mt-2">{result.team} #{result.number}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded mb-6">
            <p className="text-gray-600 text-sm">Status</p>
            <p className={`text-lg font-bold ${result.owned ? 'text-green-600' : 'text-red-600'}`}>
              {result.owned ? '✓ Owned' : '✗ Missing'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => updateStatus(!result.owned)}
              disabled={loading}
              className={`w-full py-3 px-4 rounded font-semibold transition ${
                result.owned
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {loading ? 'Updating...' : result.owned ? '❌ Mark as Missing' : '✓ Mark as Owned'}
            </button>
            <button
              onClick={resetScan}
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold transition"
            >
              🔄 Scan Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-2xl font-bold">Scan Sticker</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {scanning ? (
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded bg-black"
            />
            <button
              onClick={capturePhoto}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition"
            >
              {loading ? '📷 Processing...' : '📷 Capture'}
            </button>
            <button
              onClick={stopCamera}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded transition"
            >
              Close Camera
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={startCamera}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition"
            >
              📷 Open Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition"
            >
              📁 Upload Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
