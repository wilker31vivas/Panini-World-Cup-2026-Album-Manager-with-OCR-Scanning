import useCamera from "../hooks/useCamera";
import useScanner from "../hooks/useScanner";
import Result from "../components/Result";
import CapturedPreview from "../components/CapturedPreview";
import CameraStream from "../components/CameraStream";
import ErrorBanner from "../components/ErrorBanner";
import LoadingBanner from "../components/LoadingBanner";
import CameraControls from "../components/CameraControls";

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
    stopCamera()
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

        <CameraControls status={statusCamera} loading={isProcessing} startCamera={startCamera} stopCamera={stopCamera} fileInputRef={fileInputRef} captureFrame={captureFrame} />

      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}