import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/scanner',
    label: 'Scanner',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/list',
    label: 'Figurinhas',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  }
];

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="bg-slate-300 flex justify-center min-h-screen">
      <div className="overflow-hidden max-w-7xl bg-slate-100 flex flex-col">
        <header className="bg-[#0a1628] py-4 sm:p-6">
          <div className="max-w-7xl flex items-center justify-center h-14">
            <h1 className='text-white font-extrabold text-xl leading-none text-center'>Gerenciador de figurinhas do álbum da Copa do Mundo Panini 2026
            </h1>
          </div>
        </header>

        <nav className="bg-[#0f1e35] border-b border-white/[0.07]">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 flex justify-evenly  overflow-x-auto scrollbar-hide">
            {navItems.map(({ to, label, icon }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={[
                    'flex items-center gap-1.5 px-4 h-11 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors duration-150',
                    isActive
                      ? 'text-white border-red-600'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-white/20',
                  ].join(' ')}
                >
                  {icon}
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 max-w-7xl mx-auto w-full h-min-screen overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}