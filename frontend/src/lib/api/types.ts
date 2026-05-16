/**
 * Types do API trả về (DB-shape). Mirror từ `backend/prisma/schema.prisma`.
 *
 * Chú ý:
 * - Decimal: backend đã có DecimalSerializerInterceptor convert → `number`.
 * - DateTime: backend trả ISO string (`"2026-05-20T11:00:00.000Z"`).
 *
 * Mỗi khi schema backend đổi → cập nhật file này thủ công (mình chọn không codegen).
 * Adapter layer (`adapters/`) sẽ map từ những types này → UI types ổn định.
 */

// ─────────── ENUMS ───────────

export type Role = 'CUSTOMER' | 'OWNER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type VenueStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'SUSPENDED';

export type VenueMemberRole = 'MANAGER' | 'STAFF';

export type Surface =
  | 'NATURAL_GRASS'
  | 'ARTIFICIAL_GRASS'
  | 'WOOD'
  | 'EPOXY'
  | 'CLAY'
  | 'RUBBER'
  | 'CONCRETE';

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED_BY_USER'
  | 'CANCELLED_BY_OWNER'
  | 'CANCELLED_TIMEOUT'
  | 'NO_SHOW'
  | 'REFUNDED';

export type BookingSource = 'ONLINE' | 'WALK_IN';

export type PaymentProvider =
  | 'VNPAY'
  | 'MOMO'
  | 'ZALOPAY'
  | 'STRIPE'
  | 'BANK_TRANSFER'
  | 'CASH';

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

// ─────────── ENTITIES ───────────

export interface SportDto {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  icon: string | null;
  defaultSlotMinutes: number;
  isActive: boolean;
  count?: number; // aggregate, có khi list trả về
}

export interface AmenityDto {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  icon: string | null;
}

export interface VenueImageDto {
  id: string;
  url: string;
  sort: number;
  isPrimary: boolean;
}

export interface VenueDto {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  addressLine: string;
  ward: string | null;
  district: string | null;
  city: string;
  // Địa chỉ sau cải cách 7/2025 (luôn populate khi user nhập qua dropdown)
  newCity?: string | null;
  newWard?: string | null;
  provinceCode?: string | null;
  wardCode?: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  status: VenueStatus;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;

  // Denormalized (backend nên trả về trong response):
  images?: VenueImageDto[];
  amenities?: AmenityDto[];
  sports?: SportDto[];
  priceFrom?: number; // MIN price rule
  distance?: number; // km, nếu query có lat/lng
}

export interface CourtDto {
  id: string;
  venueId: string;
  sportId: string;
  name: string;
  surface: Surface;
  indoor: boolean;
  capacity: number;
  slotDurationMinutes: number;
  isActive: boolean;
  sport?: SportDto;
}

export interface BookingDto {
  id: string;
  code: string;
  userId: string;
  courtId: string;
  venueId: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  source: BookingSource;
  subtotal: number;
  discount: number;
  total: number;
  voucherId: string | null;
  notes: string | null;
  checkInToken: string | null;
  checkedInAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  refundAmount: number | null;
  createdAt: string;
  updatedAt: string;

  // Relations nested khi API trả về
  court?: CourtDto;
  venue?: VenueDto;
}

export interface UserDto {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: Role;
  status: UserStatus;
  locale: string;
  createdAt: string;
}

export interface AuthResultDto {
  accessToken: string;
  refreshToken: string;
  user: Pick<UserDto, 'id' | 'email' | 'phone' | 'fullName' | 'role' | 'avatarUrl'>;
}
