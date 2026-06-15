import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Stats } from '../types/index';
import { stickerApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await stickerApi.getStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Carregando seu álbum...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 text-center max-w-sm w-full">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const percentage = stats.total > 0 ? Math.round((stats.owned / stats.total) * 100) : 0;

  return (
    <div className="bg-slate-100">

      <div className="bg-[#0a1628] px-5 pt-8 pb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-red-600/10 pointer-events-none" />
        <div className="absolute -bottom-8 left-4 w-32 h-32 rounded-full bg-amber-500/10 pointer-events-none" />

        <h1 className="text-2xl font-extrabold text-white leading-tight">Sua Coleção</h1>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">Álbum oficial FIFA World Cup™</p>

        <div className="w-full bg-[#1a2d4a] rounded-full h-2.5 overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>0</span>
          <span className="text-amber-400 font-bold">{percentage}% preenchido</span>
          <span>{stats.total}</span>
        </div>
      </div>

      <div className="px-4 space-y-5 mt-5">

        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2.5">Resumen</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{stats.total}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-1">Total</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{stats.owned}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-1">Tenho</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{stats.missing}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-1">Faltam</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2.5">Ações</p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/scanner"
              className="flex flex-col items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm py-5 px-4 rounded-2xl shadow-lg shadow-red-600/25 transition-all duration-150"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Escanear figurinha
            </Link>
            <Link
              to="/list"
              className="flex flex-col items-center justify-center gap-2 bg-[#0a1628] hover:bg-[#122035] active:scale-95 text-white font-bold text-sm py-5 px-4 rounded-2xl shadow-sm transition-all duration-150"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Ver coleção
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}