import { API_BASE } from './config';
import { ApiError } from './errors';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: Method;
  /** Query params (sẽ bị URL-encode). Bỏ qua undefined/null. */
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  /** Mặc định 15s. Set 0 để tắt. */
  timeoutMs?: number;
  /** Idempotency-Key header cho POST mutate (vd: tạo booking). */
  idempotencyKey?: string;
  /** Nếu true, không tự retry sau 401 (dùng cho /auth/refresh chính nó). */
  skipRefresh?: boolean;
  /** Server-side fetch options (Next.js cache hints). */
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
}

const DEFAULT_TIMEOUT = 15_000;

/**
 * Đang refresh không? Khi nhiều request 401 đồng thời, gom chung 1 lần refresh.
 */
let refreshPromise: Promise<void> | null = null;

async function callRefresh(): Promise<void> {
  // POST /auth/refresh — cookie sb_refresh được gửi tự động (credentials: 'include').
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) {
    throw new ApiError(res.status, 'REFRESH_FAILED', 'Session expired');
  }
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.startsWith('http') ? path : API_BASE + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Low-level request. Handle auto-retry on 401 (1 lần) qua /auth/refresh.
 *
 * **Browser side**: cookie `sb_access` + `sb_refresh` được gửi tự động qua
 * `credentials: 'include'` (vì backend đã enable CORS với credentials:true).
 *
 * **Server side (Next.js RSC)**: cookie không tự động — caller phải truyền
 * header `cookie` qua `options.headers.cookie` (đọc từ `next/headers`).
 */
export async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    query,
    body,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT,
    idempotencyKey,
    skipRefresh,
    cache,
    next,
  } = options;

  const url = buildUrl(path, query);
  const controller = new AbortController();
  const timer = timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null;

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (idempotencyKey) finalHeaders['Idempotency-Key'] = idempotencyKey;

  const init: RequestInit & { next?: RequestOptions['next'] } = {
    method,
    credentials: 'include',
    headers: finalHeaders,
    signal: controller.signal,
  };
  if (body !== undefined) {
    init.body = body instanceof FormData ? body : JSON.stringify(body);
  }
  if (cache) init.cache = cache;
  if (next) init.next = next;

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      throw new ApiError(0, 'TIMEOUT', `Request timeout (${timeoutMs}ms)`);
    }
    throw ApiError.network((e as Error).message);
  } finally {
    if (timer) clearTimeout(timer);
  }

  // Auto-refresh trên 401 — chỉ thử 1 lần, và không refresh khi đang call /auth/refresh.
  if (res.status === 401 && !skipRefresh && !path.includes('/auth/refresh')) {
    try {
      if (!refreshPromise) refreshPromise = callRefresh().finally(() => (refreshPromise = null));
      await refreshPromise;
      // Retry lần 2 với skipRefresh để tránh loop.
      return request<T>(path, { ...options, skipRefresh: true });
    } catch {
      // Refresh fail — phiên hết hạn. Notify để header refetch và update UI sang logged-out.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }
    }
  }

  // 204 no content
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      // Non-JSON response — giữ raw text trong message
    }
  }

  if (!res.ok) {
    const err = parsed as { code?: string; message?: string; details?: unknown } | null;
    throw new ApiError(
      res.status,
      err?.code ?? `HTTP_${res.status}`,
      err?.message ?? text ?? res.statusText,
      err?.details,
    );
  }

  return parsed as T;
}

// ─────────── Sugar helpers ───────────

export const apiGet = <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
  request<T>(path, { ...opts, method: 'GET' });

export const apiPost = <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
  request<T>(path, { ...opts, method: 'POST', body });

export const apiPatch = <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
  request<T>(path, { ...opts, method: 'PATCH', body });

export const apiPut = <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
  request<T>(path, { ...opts, method: 'PUT', body });

export const apiDelete = <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
  request<T>(path, { ...opts, method: 'DELETE' });
