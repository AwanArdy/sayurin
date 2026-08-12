export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export const parseLimit = (raw: string | undefined): number => {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(value), MAX_LIMIT);
};

export const parseOffset = (raw: string | undefined): number => {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
};