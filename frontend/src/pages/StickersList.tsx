import { useEffect, useState } from 'react';
import type { Sticker } from '../types/index';
import { stickerApi } from '../services/api';

type Filter = 'all' | 'owned' | 'missing';

const FilterButton = ({
  active,
  onClick,
  children,
  variant,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant: 'all' | 'owned' | 'missing';
}) => {
  const activeStyles = {
    all: 'bg-[#0a1628] text-white border-[#0a1628]',
    owned: 'bg-green-600 text-white border-green-600',
    missing: 'bg-red-600 text-white border-red-600',
  };

  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150',
        active
          ? activeStyles[variant]
          : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600',
      ].join(' ')}
    >
      {children}
    </button>
  );
};

const StatusPill = ({ owned }: { owned: boolean }) =>
  owned ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
      Tenho
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
      </svg>
      Falta
    </span>
  );

export default function StickersList() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [filtered, setFiltered] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const data = await stickerApi.getAllStickers();
        setStickers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stickers');
      } finally {
        setLoading(false);
      }
    };
    fetchStickers();
  }, []);

  useEffect(() => {
    let result = stickers;
    if (search) {
      result = result.filter(
        (s) =>
          s.code.toLowerCase().includes(search.toLowerCase()) ||
          s.team.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter === 'owned') result = result.filter((s) => s.owned);
    if (filter === 'missing') result = result.filter((s) => !s.owned);
    setFiltered(result);
  }, [search, filter, stickers]);

  const toggleSticker = async (sticker: Sticker) => {
    try {
      await stickerApi.updateStickerStatus(sticker.code, !sticker.owned);
      setStickers((prev) =>
        prev.map((s) => (s.id === sticker.id ? { ...s, owned: !s.owned } : s))
      );
    } catch {
      alert('Erro ao atualizar a figurinha');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-400">Carregando figurinhas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <div className="bg-white rounded-2xl border border-red-100 p-6 text-center">
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <h2 className="text-base font-extrabold text-[#0a1628]">Todas as figurinhas</h2>

        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Pesquise por código ou equipe."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <FilterButton variant="all" active={filter === 'all'} onClick={() => setFilter('all')}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Todas
          </FilterButton>
          <FilterButton variant="owned" active={filter === 'owned'} onClick={() => setFilter('owned')}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Tenho
          </FilterButton>
          <FilterButton variant="missing" active={filter === 'missing'} onClick={() => setFilter('missing')}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Faltam
          </FilterButton>
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          Mostrando{' '}
          <span className="text-[#0a1628] font-bold">{filtered.length}</span> de{' '}
          <span className="text-[#0a1628] font-bold">{stickers.length}</span> figurinhas
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">Nenhuma figurinha foi encontrada.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[52px_1fr_80px_56px] items-center px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            {['#', 'Figurinha', 'Estado', ''].map((h, i) => (
              <span
                key={i}
                className={`text-[10px] font-bold text-slate-400 uppercase tracking-wide ${i === 3 ? 'text-center' : ''}`}
              >
                {h}
              </span>
            ))}
          </div>

          {filtered.map((sticker) => (
            <div
              key={sticker.id}
              className="grid grid-cols-[52px_1fr_80px_56px] items-center px-4 py-3 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/70 transition-colors"
            >
              <div>
                <div
                  className={[
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold font-mono',
                    sticker.owned
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-red-50 text-red-600 border border-red-100',
                  ].join(' ')}
                >
                  {sticker.number}
                </div>
              </div>

              <div>
                <p className="text-xs font-extrabold text-[#0a1628] font-mono tracking-wide">
                  {sticker.code}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{sticker.team}</p>
              </div>

              <StatusPill owned={sticker.owned} />

              <div className="flex justify-center">
                <button
                  onClick={() => toggleSticker(sticker)}
                  aria-label="Mudar estado"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-400 hover:bg-[#0a1628] hover:text-white hover:border-[#0a1628] active:scale-95 transition-all duration-150"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}