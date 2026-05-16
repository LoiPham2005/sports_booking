/**
 * Lỗi đồng nhất từ API. Backend trả về dạng RFC 7807 `{ code, message, details? }`
 * (xem `common/filters/http-exception.filter.ts`).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Network failure, timeout, abort — backend không trả response. */
  static network(message = 'Network error') {
    return new ApiError(0, 'NETWORK_ERROR', message);
  }
}

/** Type guard rẻ tiền nếu cần phân biệt với Error thường. */
export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
