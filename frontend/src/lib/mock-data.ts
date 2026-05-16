export type Sport = {
  slug: string;
  name: string;
  icon: string;
  count: number;
};

export const SPORTS: Sport[] = [
  { slug: 'football_5', name: 'Bóng đá 5', icon: '⚽', count: 124 },
  { slug: 'football_7', name: 'Bóng đá 7', icon: '🥅', count: 82 },
  { slug: 'badminton', name: 'Cầu lông', icon: '🏸', count: 156 },
  { slug: 'tennis', name: 'Tennis', icon: '🎾', count: 67 },
  { slug: 'pickleball', name: 'Pickleball', icon: '🏓', count: 41 },
  { slug: 'basketball', name: 'Bóng rổ', icon: '🏀', count: 53 },
  { slug: 'volleyball', name: 'Bóng chuyền', icon: '🏐', count: 28 },
  { slug: 'table_tennis', name: 'Bóng bàn', icon: '🏓', count: 33 },
];

export type Venue = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  district: string;
  sports: string[];
  priceFrom: number;
  rating: number;
  reviewCount: number;
  distance: number;
  image: string;
  amenities: string[];
  lat: number;
  lng: number;
};

export const VENUES: Venue[] = [
  {
    id: 'v1',
    name: 'Sân bóng đá Phú Mỹ Hưng',
    slug: 'san-bong-da-pmh',
    address: '123 Nguyễn Văn Linh',
    city: 'Hồ Chí Minh',
    district: 'Quận 7',
    sports: ['football_5', 'football_7'],
    priceFrom: 350_000,
    rating: 4.8,
    reviewCount: 246,
    distance: 1.2,
    image:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop',
    amenities: ['parking', 'changing_room', 'led_light', 'shower'],
    lat: 10.7299,
    lng: 106.7215,
  },
  {
    id: 'v2',
    name: 'CLB cầu lông Vinhomes Central',
    slug: 'clb-cau-long-vinhomes',
    address: '720A Điện Biên Phủ',
    city: 'Hồ Chí Minh',
    district: 'Bình Thạnh',
    sports: ['badminton'],
    priceFrom: 120_000,
    rating: 4.7,
    reviewCount: 189,
    distance: 3.1,
    image:
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop',
    amenities: ['wifi', 'parking', 'led_light', 'water'],
    lat: 10.8014,
    lng: 106.7109,
  },
  {
    id: 'v3',
    name: 'Sân tennis Lan Anh',
    slug: 'san-tennis-lan-anh',
    address: '291 Cách Mạng Tháng 8',
    city: 'Hồ Chí Minh',
    district: 'Quận 10',
    sports: ['tennis'],
    priceFrom: 200_000,
    rating: 4.6,
    reviewCount: 102,
    distance: 5.8,
    image:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop',
    amenities: ['parking', 'changing_room', 'shower'],
    lat: 10.7745,
    lng: 106.6649,
  },
  {
    id: 'v4',
    name: 'Pickleball Saigon Sports Club',
    slug: 'pickleball-ssc',
    address: '14 Thi Sách',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    sports: ['pickleball', 'badminton'],
    priceFrom: 180_000,
    rating: 4.9,
    reviewCount: 312,
    distance: 0.8,
    image:
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop',
    amenities: ['wifi', 'parking', 'changing_room', 'led_light', 'shower', 'water'],
    lat: 10.7806,
    lng: 106.7019,
  },
  {
    id: 'v5',
    name: 'Sân bóng rổ Tao Đàn',
    slug: 'san-bong-ro-tao-dan',
    address: 'Công viên Tao Đàn',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    sports: ['basketball'],
    priceFrom: 80_000,
    rating: 4.4,
    reviewCount: 64,
    distance: 1.5,
    image:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop',
    amenities: ['parking', 'led_light'],
    lat: 10.7716,
    lng: 106.6919,
  },
  {
    id: 'v6',
    name: 'Sân bóng 7 Mini Thủ Đức',
    slug: 'san-bong-7-thu-duc',
    address: '45 Võ Văn Ngân',
    city: 'Hồ Chí Minh',
    district: 'Thủ Đức',
    sports: ['football_5', 'football_7'],
    priceFrom: 280_000,
    rating: 4.5,
    reviewCount: 178,
    distance: 8.2,
    image:
      'https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800&auto=format&fit=crop',
    amenities: ['parking', 'changing_room', 'led_light', 'shower', 'water'],
    lat: 10.8505,
    lng: 106.7717,
  },
];

export const AMENITIES: Record<string, { name: string; icon: string }> = {
  wifi: { name: 'Wifi miễn phí', icon: '📶' },
  parking: { name: 'Bãi đỗ xe', icon: '🅿️' },
  changing_room: { name: 'Phòng thay đồ', icon: '🚪' },
  shower: { name: 'Vòi sen', icon: '🚿' },
  led_light: { name: 'Đèn LED', icon: '💡' },
  roof: { name: 'Có mái che', icon: '🏛️' },
  water: { name: 'Nước uống', icon: '💧' },
};

export type Court = {
  id: string;
  name: string;
  surface: string;
  indoor: boolean;
  capacity: number;
  pricePerHour: number;
};

export const COURTS: Court[] = [
  { id: 'c1', name: 'Sân 1', surface: 'ARTIFICIAL_GRASS', indoor: false, capacity: 10, pricePerHour: 300_000 },
  { id: 'c2', name: 'Sân 2', surface: 'ARTIFICIAL_GRASS', indoor: false, capacity: 10, pricePerHour: 300_000 },
  { id: 'c3', name: 'Sân 3', surface: 'ARTIFICIAL_GRASS', indoor: false, capacity: 10, pricePerHour: 350_000 },
  { id: 'c4', name: 'Sân 4', surface: 'ARTIFICIAL_GRASS', indoor: true, capacity: 10, pricePerHour: 400_000 },
  { id: 'c5', name: 'Sân VIP 1', surface: 'ARTIFICIAL_GRASS', indoor: true, capacity: 14, pricePerHour: 500_000 },
  { id: 'c6', name: 'Sân VIP 2', surface: 'ARTIFICIAL_GRASS', indoor: true, capacity: 14, pricePerHour: 500_000 },
];

/** @deprecated dùng để giữ backward compatibility cho booking flow cũ */
export const _OLD_COURTS: Court[] = [
  { id: 'c1', name: 'Sân 1', surface: 'ARTIFICIAL_GRASS', indoor: false, capacity: 10, pricePerHour: 350_000 },
  { id: 'c2', name: 'Sân 2', surface: 'ARTIFICIAL_GRASS', indoor: false, capacity: 10, pricePerHour: 350_000 },
  { id: 'c3', name: 'Sân VIP', surface: 'ARTIFICIAL_GRASS', indoor: true, capacity: 14, pricePerHour: 500_000 },
];

export const SURFACES: Record<string, string> = {
  NATURAL_GRASS: 'Cỏ tự nhiên',
  ARTIFICIAL_GRASS: 'Cỏ nhân tạo',
  WOOD: 'Sàn gỗ',
  EPOXY: 'Sơn epoxy',
  CLAY: 'Đất nện',
  RUBBER: 'Cao su',
  CONCRETE: 'Bê tông',
};

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED';

export const STATUS_LABEL: Record<BookingStatus, { text: string; tone: string }> = {
  PENDING_PAYMENT: { text: 'Chờ thanh toán', tone: 'warning' },
  CONFIRMED: { text: 'Đã xác nhận', tone: 'success' },
  CHECKED_IN: { text: 'Đã check-in', tone: 'default' },
  COMPLETED: { text: 'Hoàn thành', tone: 'muted' },
  CANCELLED: { text: 'Đã huỷ', tone: 'destructive' },
};

export type Booking = {
  id: string;
  code: string;
  venue: Venue;
  courtName: string;
  startsAt: string;
  endsAt: string;
  total: number;
  status: BookingStatus;
};

export const BOOKINGS: Booking[] = [
  {
    id: 'b1',
    code: '20250547',
    venue: VENUES[0],
    courtName: 'Sân VIP',
    startsAt: '2026-05-20T18:00:00',
    endsAt: '2026-05-20T20:00:00',
    total: 1_000_000,
    status: 'CONFIRMED',
  },
  {
    id: 'b2',
    code: '20250548',
    venue: VENUES[1],
    courtName: 'Sân 3',
    startsAt: '2026-05-22T19:00:00',
    endsAt: '2026-05-22T21:00:00',
    total: 240_000,
    status: 'PENDING_PAYMENT',
  },
  {
    id: 'b3',
    code: '20250490',
    venue: VENUES[3],
    courtName: 'Sân 2',
    startsAt: '2026-05-10T17:00:00',
    endsAt: '2026-05-10T19:00:00',
    total: 360_000,
    status: 'COMPLETED',
  },
  {
    id: 'b4',
    code: '20250453',
    venue: VENUES[4],
    courtName: 'Sân ngoài trời',
    startsAt: '2026-05-08T15:00:00',
    endsAt: '2026-05-08T17:00:00',
    total: 160_000,
    status: 'CANCELLED',
  },
];

// Slot grid mock
export const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const hour = 6 + i;
  return `${String(hour).padStart(2, '0')}:00`;
});

/** Trả về trạng thái slot dựa trên seed (cho UI). */
export function mockSlotStatus(hour: string): 'available' | 'held' | 'booked' {
  const h = parseInt(hour.split(':')[0], 10);
  if (h === 18 || h === 19) return 'booked';
  if (h === 17) return 'held';
  return 'available';
}

export type CellStatus = 'available' | 'held' | 'booked';

/**
 * Mock status cho mỗi (court, hour) — tạo ra pattern thực tế: tối nhiều sân kín,
 * trưa thưa, một vài "held" rải rác.
 */
export function mockCellStatus(courtId: string, hour: string): CellStatus {
  const h = parseInt(hour.split(':')[0], 10);
  const courtIdx = parseInt(courtId.replace(/\D/g, ''), 10) || 0;

  // Khung tối 18-21 đông
  if (h === 18) {
    if (['c1', 'c2', 'c5'].includes(courtId)) return 'booked';
    if (courtId === 'c3') return 'held';
    return 'available';
  }
  if (h === 19) {
    if (['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].includes(courtId)) return 'booked';
    return 'available';
  }
  if (h === 20) {
    if (['c2', 'c3', 'c5'].includes(courtId)) return 'booked';
    if (courtId === 'c1') return 'held';
    return 'available';
  }
  if (h === 21) {
    if (['c1', 'c5'].includes(courtId)) return 'booked';
    return 'available';
  }

  // Chiều 15-17
  if (h === 17) {
    if (courtId === 'c2') return 'booked';
    if (courtId === 'c5') return 'held';
    return 'available';
  }
  if (h === 16) {
    if (courtId === 'c3') return 'booked';
    return 'available';
  }
  if (h === 15) {
    if (courtId === 'c1') return 'booked';
    return 'available';
  }

  // Sáng 8-10 thưa
  if (h === 8 && courtIdx % 2 === 0) return 'booked';
  if (h === 9 && courtId === 'c4') return 'held';
  if (h === 10 && courtId === 'c6') return 'booked';

  return 'available';
}
