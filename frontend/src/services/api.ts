import type { Sticker, Stats } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const stickerApi = {
  async getAllStickers(): Promise<Sticker[]> {
    const response = await fetch(`${API_BASE_URL}/stickers`);
    if (!response.ok) throw new Error('Failed to fetch stickers');
    return response.json();
  },

  async getStickerByCode(code: string): Promise<Sticker | null> {
    const response = await fetch(`${API_BASE_URL}/stickers/${code}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch sticker');
    return response.json();
  },

  async updateStickerStatus(code: string, owned: boolean): Promise<Sticker> {
    const response = await fetch(`${API_BASE_URL}/stickers/${code}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owned }),
    });
    if (!response.ok) throw new Error('Failed to update sticker');
    return response.json();
  },

  async getStats(): Promise<Stats> {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
};
