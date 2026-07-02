import type {CameraStatus} from '../types/index.ts'
import ScanCorners from './ScanCorners.tsx'

export default function CameraStream({ videoRef, status, error }: { videoRef: React.RefObject<HTMLVideoElement | null>, status: CameraStatus, error: string | null }) {
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