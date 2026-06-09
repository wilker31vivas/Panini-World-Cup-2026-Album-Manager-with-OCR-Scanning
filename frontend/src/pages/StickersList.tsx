import { useEffect, useState } from 'react';
import type { Sticker } from '../types/index';
import { stickerApi } from '../services/api';

type Filter = 'all' | 'owned' | 'missing';

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
        applyFilters(data, search, filter);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stickers');
      } finally {
        setLoading(false);
      }
    };

    fetchStickers();
  }, []);

  useEffect(() => {
    applyFilters(stickers, search, filter);
  }, [search, filter, stickers]);

  const applyFilters = (list: Sticker[], searchTerm: string, filterType: Filter) => {
    let result = list;

    if (searchTerm) {
      result = result.filter(s => s.code.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filterType === 'owned') {
      result = result.filter(s => s.owned);
    } else if (filterType === 'missing') {
      result = result.filter(s => !s.owned);
    }

    setFiltered(result);
  };

  const toggleSticker = async (sticker: Sticker) => {
    try {
      await stickerApi.updateStickerStatus(sticker.code, !sticker.owned);
      const updated = stickers.map(s =>
        s.id === sticker.id ? { ...s, owned: !s.owned } : s
      );
      setStickers(updated);
    } catch (err) {
      alert('Failed to update sticker');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-2xl font-bold">All Stickers</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('owned')}
              className={`px-4 py-2 rounded transition ${
                filter === 'owned'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Owned
            </button>
            <button
              onClick={() => setFilter('missing')}
              className={`px-4 py-2 rounded transition ${
                filter === 'missing'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Missing
            </button>
          </div>
        </div>

        <p className="text-gray-600">
          Showing {filtered.length} of {stickers.length} stickers
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Team</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Number</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((sticker) => (
              <tr key={sticker.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-bold text-gray-900">{sticker.code}</td>
                <td className="px-6 py-4 text-gray-700">{sticker.team}</td>
                <td className="px-6 py-4 text-gray-700">#{sticker.number}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      sticker.owned
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {sticker.owned ? '✓ Owned' : '✗ Missing'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleSticker(sticker)}
                    className="text-blue-600 hover:text-blue-800 font-semibold transition"
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">No stickers found</div>
      )}
    </div>
  );
}
