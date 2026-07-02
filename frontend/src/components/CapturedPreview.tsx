import ErrorBanner from "./ErrorBanner";
import LoadingBanner from "./LoadingBanner";

type CapturedPreview = {
  image: string,
  onRetry: () => void,
  onScan: () => void,
  loading: boolean,
  errorScanner: string | null | undefined
}

export default function CapturedPreview({ image, onRetry, onScan, loading, errorScanner }: CapturedPreview) {
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
        Escanear figurinha
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