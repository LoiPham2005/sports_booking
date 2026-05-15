/**
 * API client config. Đọc từ NEXT_PUBLIC_* env (build-time inline cho client bundle).
 *
 * - API_BASE: URL backend. Phải khớp với app.appUrl của NestJS.
 *   Mặc định http://localhost:3000 (đã setGlobalPrefix('api') ở backend).
 * - USE_MOCK: nếu true, các endpoint/repository sẽ trả mock data thay vì gọi API thật.
 *   Cho phép từng page chuyển dần từ mock sang real.
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000') + '/api/v1';

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

/** Tên cookie do backend set (xem backend/src/modules/auth/auth.controller.ts). */
export const ACCESS_COOKIE = 'sb_access';
export const REFRESH_COOKIE = 'sb_refresh';
