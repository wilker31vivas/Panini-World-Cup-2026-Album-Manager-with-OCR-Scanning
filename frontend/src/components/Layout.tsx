import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🏆 Panini 2026 Album
          </h1>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          <Link
            to="/"
            className="px-4 py-4 text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition"
          >
            Dashboard
          </Link>
          <Link
            to="/scanner"
            className="px-4 py-4 text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition"
          >
            Scanner
          </Link>
          <Link
            to="/list"
            className="px-4 py-4 text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition"
          >
            All Stickers
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-100 text-center py-6 text-gray-600 text-sm">
        <p>Panini World Cup 2026 Collection Manager</p>
      </footer>
    </div>
  );
}
