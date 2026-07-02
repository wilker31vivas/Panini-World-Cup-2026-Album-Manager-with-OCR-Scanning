import type { Sticker } from '../types/index';

type Result = {
  result: Sticker;
  isProcessing: boolean;
  reset: () => void;
  updateStatus: (owned: boolean) => Promise<void>
}

export default function Result({ result, isProcessing, reset, updateStatus }: Result) {
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