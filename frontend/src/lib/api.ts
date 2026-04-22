import { getAccessToken } from './auth';

/** Base URL sin barra final: proxy `/api` en dev o `VITE_API_BASE` en build. */
export function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE as string | undefined;
  if (fromEnv?.trim()) {
    return fromEnv.replace(/\/$/, '');
  }
  return '/api';
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = getApiBase();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, { ...init, headers });
}

/** Mensaje legible a partir de respuestas JSON típicas de FastAPI. */
export async function readApiError(res: Response): Promise<string> {
  const text = await res.text();
  if (!text.trim()) return res.statusText || 'Error';
  try {
    const j = JSON.parse(text) as { detail?: unknown };
    const d = j.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) {
      return d
        .map((x) =>
          typeof x === 'object' && x !== null && 'msg' in x
            ? String((x as { msg: string }).msg)
            : JSON.stringify(x),
        )
        .join(' ');
    }
  } catch {
    return text;
  }
  return text;
}
