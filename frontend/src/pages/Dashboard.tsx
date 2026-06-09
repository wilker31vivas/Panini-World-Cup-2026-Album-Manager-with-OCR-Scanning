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

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;
  if (!stats) return null;

  const percentage = stats.total > 0 ? Math.round((stats.owned / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8">
        <h2 className="text-4xl font-bold mb-2">Your Collection</h2>
        <p className="text-lg opacity-90">{percentage}% Complete</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Stickers</p>
          <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Owned</p>
          <p className="text-4xl font-bold text-green-600">{stats.owned}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Missing</p>
          <p className="text-4xl font-bold text-red-600">{stats.missing}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-center mt-4 text-gray-700">{percentage}% Collected</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/scanner"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-center transition"
        >
          📷 Scan Sticker
        </Link>
        <Link
          to="/list"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg text-center transition"
        >
          📋 View All
        </Link>
      </div>
    </div>
  );
}
