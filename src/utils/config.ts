if (
  typeof import.meta.env.VITE_BACKEND_URL !== 'string' ||
  typeof import.meta.env.VITE_TENOR_API_KEY !== 'string' ||
  !import.meta.env.VITE_BACKEND_URL ||
  !import.meta.env.VITE_TENOR_API_KEY
) {
  throw new Error('Missing environment variables');
}

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY;
