// PBKDF2-SHA256 berbasis Web Crypto (edge-safe, tanpa nodejs_compat).
// Format hash: `pbkdf2-sha256$<iterations>$<salt hex>$<derived key hex>`
const ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;

const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer | Uint8Array): string =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const fromHex = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

const deriveBits = async (password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> => {
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    KEY_LENGTH_BITS,
  );
};

const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedBits = await deriveBits(password, salt, ITERATIONS);
  return `pbkdf2-sha256$${ITERATIONS}$${toHex(salt)}$${toHex(derivedBits)}`;
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [algorithm, iterationStr, saltHex, hashHex] = stored.split('$');
  if (algorithm !== 'pbkdf2-sha256') return false;
  const iterations = parseInt(iterationStr, 10);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;
  const salt = fromHex(saltHex);
  const derivedBits = await deriveBits(password, salt, iterations);
  return timingSafeEqual(toHex(derivedBits), hashHex);
};