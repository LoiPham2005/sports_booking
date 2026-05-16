/**
 * Tải danh sách hành chính Việt Nam (cũ — 63 tỉnh + quận/huyện + phường/xã).
 * Source: https://provinces.open-api.vn/api/?depth=3 (free, no key)
 *
 * Cache trong localStorage để không tải lại 3MB mỗi lần load page.
 */

export interface VnWard {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  short_codename: string;
}

export interface VnDistrict {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  short_codename: string;
  wards: VnWard[];
}

export interface VnProvince {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
  districts: VnDistrict[];
}

const CACHE_KEY = 'vn-address-tree-v1';
const CACHE_TTL_MS = 30 * 24 * 3600_000; // 30 ngày

let inMemory: VnProvince[] | null = null;
let inFlight: Promise<VnProvince[]> | null = null;

/**
 * Lấy toàn bộ cây hành chính. Cache:
 * 1. In-memory cho lần gọi tiếp theo trong cùng session
 * 2. localStorage cho lần load page sau
 */
export async function getProvinces(): Promise<VnProvince[]> {
  if (inMemory) return inMemory;

  // localStorage cache
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { ts: number; data: VnProvince[] };
        if (Date.now() - parsed.ts < CACHE_TTL_MS && Array.isArray(parsed.data)) {
          inMemory = parsed.data;
          return parsed.data;
        }
      }
    } catch {
      // Bỏ qua cache hỏng
    }
  }

  // Dedupe: nhiều component cùng gọi → chỉ fetch 1 lần
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const res = await fetch('https://provinces.open-api.vn/api/?depth=3', {
      cache: 'force-cache',
    });
    if (!res.ok) throw new Error('Không tải được dữ liệu hành chính');
    const data = (await res.json()) as VnProvince[];
    inMemory = data;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
      } catch {
        // localStorage quota — bỏ qua
      }
    }
    return data;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

// ─────── Helpers ───────

export function findProvince(provinces: VnProvince[], code: number | string | null | undefined) {
  if (code == null) return undefined;
  const num = typeof code === 'string' ? parseInt(code, 10) : code;
  return provinces.find((p) => p.code === num);
}

export function findDistrict(province: VnProvince | undefined, code: number | string | null | undefined) {
  if (!province || code == null) return undefined;
  const num = typeof code === 'string' ? parseInt(code, 10) : code;
  return province.districts.find((d) => d.code === num);
}

export function findWard(district: VnDistrict | undefined, code: number | string | null | undefined) {
  if (!district || code == null) return undefined;
  const num = typeof code === 'string' ? parseInt(code, 10) : code;
  return district.wards.find((w) => w.code === num);
}

/**
 * Quy đổi địa chỉ cũ → mới (sau cải cách 7/2025).
 *
 * Hiện chưa có mapping dataset chính thức công khai cho toàn bộ tỉnh/xã.
 * Tạm thời dùng heuristic: gộp district + ward thành "newWard" và giữ tỉnh.
 * Khi nào có nguồn chính thức → thay thế hàm này.
 */
export function convertOldToNew(province: VnProvince, district: VnDistrict, ward: VnWard) {
  // Heuristic tạm: tỉnh giữ nguyên (chưa có mapping merge thực),
  // xã mới = tên xã cũ (vì phần lớn xã được giữ nguyên tên, chỉ huyện bị bỏ).
  return {
    newCity: province.name,
    newWard: ward.name,
    provinceCode: String(province.code),
    wardCode: String(ward.code),
  };
}
