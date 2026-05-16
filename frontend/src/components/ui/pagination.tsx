'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  /** Trang hiện tại (1-based). */
  page: number;
  /** Số bản ghi mỗi trang. */
  pageSize: number;
  /** Tổng số bản ghi. */
  total: number;
  /** Khi user đổi trang. */
  onPageChange: (page: number) => void;
  /** Khi user đổi pageSize (optional — bỏ qua thì ẩn dropdown). */
  onPageSizeChange?: (size: number) => void;
  /** Danh sách lựa chọn pageSize. Default `[10, 20, 50, 100]`. */
  pageSizeOptions?: number[];
  /** Tuỳ chỉnh số nút trang tối đa hiển thị giữa (không tính first/last). Default 5. */
  siblingCount?: number;
  /** Có hiện nút tới đầu/cuối không (>>, <<). Default true. */
  showFirstLast?: boolean;
  /** Disable toàn bộ (đang loading). */
  disabled?: boolean;
  className?: string;
}

/**
 * Pagination dùng chung. Server-side (gọi API với page/pageSize) hoặc client-side (slice array).
 *
 * @example
 *   <Pagination
 *     page={page} pageSize={size} total={data.total}
 *     onPageChange={setPage} onPageSizeChange={setSize}
 *   />
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  siblingCount = 1,
  showFirstLast = true,
  disabled = false,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  // Hiển thị "X – Y / Z bản ghi"
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  const pages = buildPageList(safePage, totalPages, siblingCount);

  function go(p: number) {
    if (disabled) return;
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== safePage) onPageChange(next);
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 border-t bg-card px-4 py-3 text-sm sm:flex-row',
        className,
      )}
    >
      {/* Bên trái: thông tin + chọn pageSize */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-muted-foreground">
        <span>
          {total === 0 ? (
            'Không có bản ghi'
          ) : (
            <>
              <span className="font-semibold text-foreground">{start.toLocaleString('vi-VN')}</span>
              {' – '}
              <span className="font-semibold text-foreground">{end.toLocaleString('vi-VN')}</span>
              {' / '}
              <span className="font-semibold text-foreground">{total.toLocaleString('vi-VN')}</span>
              {' bản ghi'}
            </>
          )}
        </span>

        {onPageSizeChange && (
          <label className="inline-flex items-center gap-2">
            <span className="text-xs">Hiển thị</span>
            <select
              className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              value={pageSize}
              disabled={disabled}
              onChange={(e) => {
                const next = parseInt(e.target.value, 10);
                onPageSizeChange(next);
                // Reset về trang 1 để tránh out-of-range
                if (safePage !== 1) onPageChange(1);
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-xs">/ trang</span>
          </label>
        )}
      </div>

      {/* Bên phải: các nút trang */}
      <nav className="inline-flex items-center gap-1" aria-label="Pagination">
        {showFirstLast && (
          <PageButton
            onClick={() => go(1)}
            disabled={disabled || safePage === 1}
            ariaLabel="Trang đầu"
          >
            <ChevronsLeft className="h-4 w-4" />
          </PageButton>
        )}
        <PageButton
          onClick={() => go(safePage - 1)}
          disabled={disabled || safePage === 1}
          ariaLabel="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </PageButton>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e-${i}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <PageButton
              key={p}
              onClick={() => go(p)}
              disabled={disabled}
              active={p === safePage}
              ariaLabel={`Trang ${p}`}
              ariaCurrent={p === safePage ? 'page' : undefined}
            >
              {p}
            </PageButton>
          ),
        )}

        <PageButton
          onClick={() => go(safePage + 1)}
          disabled={disabled || safePage === totalPages}
          ariaLabel="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </PageButton>
        {showFirstLast && (
          <PageButton
            onClick={() => go(totalPages)}
            disabled={disabled || safePage === totalPages}
            ariaLabel="Trang cuối"
          >
            <ChevronsRight className="h-4 w-4" />
          </PageButton>
        )}
      </nav>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  ariaLabel,
  ariaCurrent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  ariaLabel?: string;
  ariaCurrent?: 'page' | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-md border bg-background px-2 text-sm font-medium transition-colors',
        'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background',
        active &&
          'border-primary bg-primary text-primary-foreground hover:bg-primary/90 disabled:hover:bg-primary',
      )}
    >
      {children}
    </button>
  );
}

/**
 * Trả về list trang dạng `[1, '...', 4, 5, 6, '...', 10]` để hiển thị.
 * - Luôn hiện trang đầu + cuối.
 * - Hiện `siblingCount` trang quanh trang hiện tại.
 */
function buildPageList(current: number, total: number, sibling: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(2, current - sibling);
  const right = Math.min(total - 1, current + sibling);
  const showLeftDots = left > 2;
  const showRightDots = right < total - 1;

  const out: (number | 'ellipsis')[] = [1];
  if (showLeftDots) {
    out.push('ellipsis');
  } else {
    for (let i = 2; i < left; i += 1) out.push(i);
  }
  for (let i = left; i <= right; i += 1) out.push(i);
  if (showRightDots) {
    out.push('ellipsis');
  } else {
    for (let i = right + 1; i < total; i += 1) out.push(i);
  }
  out.push(total);
  return out;
}
