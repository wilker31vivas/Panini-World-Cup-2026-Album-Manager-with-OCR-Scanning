export interface Sticker {
  id: number;
  team: string;
  number: number;
  code: string;
  owned: boolean;
}

export interface ScanResult {
  detected: boolean;
  code: string | null;
  sticker: Sticker | null;
  error?: string;
}

export interface Stats {
  total: number;
  owned: number;
  missing: number;
  percentage: number;
}