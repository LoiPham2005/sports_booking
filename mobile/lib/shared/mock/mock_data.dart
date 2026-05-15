class Sport {
  final String slug;
  final String name;
  final String icon;
  final int count;
  const Sport({required this.slug, required this.name, required this.icon, required this.count});
}

class Venue {
  final String id;
  final String name;
  final String address;
  final String city;
  final String district;
  final List<String> sports;
  final int priceFrom;
  final double rating;
  final int reviewCount;
  final double distance;
  final String image;
  final List<String> amenities;
  final String description;

  const Venue({
    required this.id,
    required this.name,
    required this.address,
    required this.city,
    required this.district,
    required this.sports,
    required this.priceFrom,
    required this.rating,
    required this.reviewCount,
    required this.distance,
    required this.image,
    required this.amenities,
    required this.description,
  });
}

class Court {
  final String id;
  final String name;
  final String surface;
  final bool indoor;
  final int capacity;
  final int pricePerHour;
  const Court({
    required this.id,
    required this.name,
    required this.surface,
    required this.indoor,
    required this.capacity,
    required this.pricePerHour,
  });
}

enum BookingStatus { pendingPayment, confirmed, checkedIn, completed, cancelled }

class Booking {
  final String id;
  final String code;
  final Venue venue;
  final String courtName;
  final DateTime startsAt;
  final DateTime endsAt;
  final int total;
  final BookingStatus status;
  const Booking({
    required this.id,
    required this.code,
    required this.venue,
    required this.courtName,
    required this.startsAt,
    required this.endsAt,
    required this.total,
    required this.status,
  });
}

enum StaffRole { manager, staff }
enum StaffStatus { active, pending, suspended }

class OwnerStaff {
  final String id;
  final String name;
  final String email;
  final String phone;
  final StaffRole role;
  final String venueId;
  final String venueName;
  final StaffStatus status;
  final DateTime joinedAt;
  final int bookingsHandled;
  const OwnerStaff({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    required this.venueId,
    required this.venueName,
    required this.status,
    required this.joinedAt,
    required this.bookingsHandled,
  });
}

class NotificationItem {
  final String id;
  final String type;
  final String title;
  final String body;
  final DateTime time;
  final bool read;
  const NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.time,
    required this.read,
  });
}

class MockData {
  MockData._();

  static const sports = [
    Sport(slug: 'football_5', name: 'Bóng đá 5', icon: '⚽', count: 124),
    Sport(slug: 'football_7', name: 'Bóng đá 7', icon: '🥅', count: 82),
    Sport(slug: 'badminton', name: 'Cầu lông', icon: '🏸', count: 156),
    Sport(slug: 'tennis', name: 'Tennis', icon: '🎾', count: 67),
    Sport(slug: 'pickleball', name: 'Pickleball', icon: '🏓', count: 41),
    Sport(slug: 'basketball', name: 'Bóng rổ', icon: '🏀', count: 53),
    Sport(slug: 'volleyball', name: 'Bóng chuyền', icon: '🏐', count: 28),
    Sport(slug: 'table_tennis', name: 'Bóng bàn', icon: '🏓', count: 33),
  ];

  static const amenities = {
    'wifi': ('Wifi miễn phí', '📶'),
    'parking': ('Bãi đỗ xe', '🅿️'),
    'changing_room': ('Phòng thay đồ', '🚪'),
    'shower': ('Phòng tắm', '🚿'),
    'led_light': ('Đèn LED', '💡'),
    'roof': ('Có mái che', '🏛️'),
    'water': ('Nước uống', '💧'),
  };

  static const venues = [
    Venue(
      id: 'v1',
      name: 'Sân bóng đá Phú Mỹ Hưng',
      address: '123 Nguyễn Văn Linh',
      city: 'Hồ Chí Minh',
      district: 'Quận 7',
      sports: ['football_5', 'football_7'],
      priceFrom: 350000,
      rating: 4.8,
      reviewCount: 246,
      distance: 1.2,
      image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop',
      amenities: ['parking', 'changing_room', 'led_light', 'shower'],
      description:
          'Hệ thống sân cỏ nhân tạo chất lượng cao, đèn LED chiếu sáng chuẩn quốc tế. Vị trí trung tâm Phú Mỹ Hưng, thuận tiện di chuyển.',
    ),
    Venue(
      id: 'v2',
      name: 'CLB cầu lông Vinhomes Central',
      address: '720A Điện Biên Phủ',
      city: 'Hồ Chí Minh',
      district: 'Bình Thạnh',
      sports: ['badminton'],
      priceFrom: 120000,
      rating: 4.7,
      reviewCount: 189,
      distance: 3.1,
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop',
      amenities: ['wifi', 'parking', 'led_light', 'water'],
      description: 'Sàn gỗ chuẩn thi đấu, không khí mát mẻ, có khu nghỉ giữa giờ.',
    ),
    Venue(
      id: 'v3',
      name: 'Sân tennis Lan Anh',
      address: '291 Cách Mạng Tháng 8',
      city: 'Hồ Chí Minh',
      district: 'Quận 10',
      sports: ['tennis'],
      priceFrom: 200000,
      rating: 4.6,
      reviewCount: 102,
      distance: 5.8,
      image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop',
      amenities: ['parking', 'changing_room', 'shower'],
      description: 'Sân clay tiêu chuẩn ATP, phù hợp tập luyện chuyên nghiệp.',
    ),
    Venue(
      id: 'v4',
      name: 'Pickleball Saigon Sports Club',
      address: '14 Thi Sách',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      sports: ['pickleball', 'badminton'],
      priceFrom: 180000,
      rating: 4.9,
      reviewCount: 312,
      distance: 0.8,
      image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop',
      amenities: ['wifi', 'parking', 'changing_room', 'led_light', 'shower', 'water'],
      description: 'Top 1 pickleball Sài Gòn — sân chuyên nghiệp, đông cộng đồng người chơi.',
    ),
    Venue(
      id: 'v5',
      name: 'Sân bóng rổ Tao Đàn',
      address: 'Công viên Tao Đàn',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      sports: ['basketball'],
      priceFrom: 80000,
      rating: 4.4,
      reviewCount: 64,
      distance: 1.5,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop',
      amenities: ['parking', 'led_light'],
      description: 'Sân ngoài trời giữa công viên, không gian xanh mát, có khán đài.',
    ),
    Venue(
      id: 'v6',
      name: 'Sân bóng 7 Mini Thủ Đức',
      address: '45 Võ Văn Ngân',
      city: 'Hồ Chí Minh',
      district: 'Thủ Đức',
      sports: ['football_5', 'football_7'],
      priceFrom: 280000,
      rating: 4.5,
      reviewCount: 178,
      distance: 8.2,
      image: 'https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800&auto=format&fit=crop',
      amenities: ['parking', 'changing_room', 'led_light', 'shower', 'water'],
      description: 'Cỏ nhân tạo cao 5cm, mới thay 2024. Hệ thống livestream booking.',
    ),
  ];

  static const courts = [
    Court(id: 'c1', name: 'Sân 1', surface: 'Cỏ nhân tạo', indoor: false, capacity: 10, pricePerHour: 350000),
    Court(id: 'c2', name: 'Sân 2', surface: 'Cỏ nhân tạo', indoor: false, capacity: 10, pricePerHour: 350000),
    Court(id: 'c3', name: 'Sân VIP', surface: 'Cỏ nhân tạo', indoor: true, capacity: 14, pricePerHour: 500000),
  ];

  static List<Booking> bookings = [
    Booking(
      id: 'b1',
      code: '20250547',
      venue: venues[0],
      courtName: 'Sân VIP',
      startsAt: DateTime.now().add(const Duration(days: 2, hours: 4)),
      endsAt: DateTime.now().add(const Duration(days: 2, hours: 6)),
      total: 1000000,
      status: BookingStatus.confirmed,
    ),
    Booking(
      id: 'b2',
      code: '20250548',
      venue: venues[1],
      courtName: 'Sân 3',
      startsAt: DateTime.now().add(const Duration(days: 3, hours: 5)),
      endsAt: DateTime.now().add(const Duration(days: 3, hours: 7)),
      total: 240000,
      status: BookingStatus.pendingPayment,
    ),
    Booking(
      id: 'b3',
      code: '20250490',
      venue: venues[3],
      courtName: 'Sân 2',
      startsAt: DateTime.now().subtract(const Duration(days: 5, hours: 4)),
      endsAt: DateTime.now().subtract(const Duration(days: 5, hours: 2)),
      total: 360000,
      status: BookingStatus.completed,
    ),
    Booking(
      id: 'b4',
      code: '20250453',
      venue: venues[4],
      courtName: 'Sân ngoài trời',
      startsAt: DateTime.now().subtract(const Duration(days: 7)),
      endsAt: DateTime.now().subtract(const Duration(days: 7, hours: -2)),
      total: 160000,
      status: BookingStatus.cancelled,
    ),
  ];

  static List<NotificationItem> notifications = [
    NotificationItem(
      id: 'n1',
      type: 'payment_success',
      title: 'Thanh toán thành công',
      body: 'Booking #20250547 đã được xác nhận. Hẹn gặp bạn tại sân!',
      time: DateTime.now().subtract(const Duration(hours: 2)),
      read: false,
    ),
    NotificationItem(
      id: 'n2',
      type: 'promo',
      title: 'Khuyến mãi cuối tuần',
      body: 'Giảm 20% sân cầu lông T7-CN. Dùng mã SPORT20.',
      time: DateTime.now().subtract(const Duration(hours: 6)),
      read: false,
    ),
    NotificationItem(
      id: 'n3',
      type: 'reminder',
      title: 'Nhắc lịch chơi',
      body: 'Bạn có booking lúc 18:00 hôm nay tại Pickleball Saigon SC.',
      time: DateTime.now().subtract(const Duration(days: 1)),
      read: true,
    ),
    NotificationItem(
      id: 'n4',
      type: 'review',
      title: 'Đánh giá trận đấu',
      body: 'Hãy cho chúng tôi biết trải nghiệm của bạn ở Sân tennis Lan Anh',
      time: DateTime.now().subtract(const Duration(days: 3)),
      read: true,
    ),
  ];

  static const timeSlots = [
    '06:00', '07:00', '08:00', '09:00',
    '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00',
  ];

  /// Mock slot status by hour.
  static String slotStatus(String slot) {
    final h = int.parse(slot.split(':')[0]);
    if (h == 18 || h == 19) return 'booked';
    if (h == 17) return 'held';
    return 'available';
  }

  // ─────────────────── OWNER mock ───────────────────

  /// Owner đang sở hữu 2 venue (v1, v2).
  static List<Venue> ownerVenues = [venues[0], venues[1]];

  /// KPI cho dashboard owner — giá trị tham khảo, không phải tính từ list bookings.
  static const ownerKpi = {
    'revenueToday': 4350000,
    'bookingsToday': 18,
    'occupancyToday': 76,
    'revenueMonth': 82500000,
    'revenueMonthDelta': 8.3,
    'ratingAvg': 4.7,
  };

  /// Danh sách nhân viên của owner.
  static List<OwnerStaff> ownerStaffList = [
    OwnerStaff(
      id: 's1',
      name: 'Trần Văn Trực',
      email: 'truc@example.com',
      phone: '+84 901 234 567',
      role: StaffRole.manager,
      venueId: 'v1',
      venueName: 'Sân bóng đá Phú Mỹ Hưng',
      status: StaffStatus.active,
      joinedAt: DateTime.now().subtract(const Duration(days: 240)),
      bookingsHandled: 348,
    ),
    OwnerStaff(
      id: 's2',
      name: 'Lê Thị Mai',
      email: 'mai@example.com',
      phone: '+84 909 876 543',
      role: StaffRole.staff,
      venueId: 'v1',
      venueName: 'Sân bóng đá Phú Mỹ Hưng',
      status: StaffStatus.active,
      joinedAt: DateTime.now().subtract(const Duration(days: 120)),
      bookingsHandled: 215,
    ),
    OwnerStaff(
      id: 's3',
      name: 'Nguyễn Quốc Anh',
      email: 'anh@example.com',
      phone: '+84 905 111 222',
      role: StaffRole.staff,
      venueId: 'v2',
      venueName: 'CLB cầu lông Vinhomes Central',
      status: StaffStatus.active,
      joinedAt: DateTime.now().subtract(const Duration(days: 60)),
      bookingsHandled: 88,
    ),
    OwnerStaff(
      id: 's4',
      name: 'Phạm Hoàng Long',
      email: 'long@example.com',
      phone: '+84 908 333 444',
      role: StaffRole.staff,
      venueId: 'v1',
      venueName: 'Sân bóng đá Phú Mỹ Hưng',
      status: StaffStatus.pending,
      joinedAt: DateTime.now().subtract(const Duration(days: 3)),
      bookingsHandled: 0,
    ),
    OwnerStaff(
      id: 's5',
      name: 'Đỗ Thị Hà',
      email: 'ha@example.com',
      phone: '+84 902 555 666',
      role: StaffRole.staff,
      venueId: 'v2',
      venueName: 'CLB cầu lông Vinhomes Central',
      status: StaffStatus.suspended,
      joinedAt: DateTime.now().subtract(const Duration(days: 180)),
      bookingsHandled: 124,
    ),
  ];

  /// Mock booking trong ngày dùng cho owner dashboard / staff today.
  static List<Booking> bookingsToday = [
    Booking(
      id: 't1',
      code: '20260547',
      venue: venues[0],
      courtName: 'Sân 1',
      startsAt: _today(7, 0),
      endsAt: _today(8, 0),
      total: 350000,
      status: BookingStatus.completed,
    ),
    Booking(
      id: 't2',
      code: '20260548',
      venue: venues[0],
      courtName: 'Sân 1',
      startsAt: _today(8, 0),
      endsAt: _today(10, 0),
      total: 700000,
      status: BookingStatus.completed,
    ),
    Booking(
      id: 't3',
      code: '20260549',
      venue: venues[0],
      courtName: 'Sân VIP',
      startsAt: _today(16, 0),
      endsAt: _today(18, 0),
      total: 1000000,
      status: BookingStatus.confirmed,
    ),
    Booking(
      id: 't4',
      code: '20260550',
      venue: venues[0],
      courtName: 'Sân 2',
      startsAt: _today(18, 0),
      endsAt: _today(20, 0),
      total: 700000,
      status: BookingStatus.confirmed,
    ),
    Booking(
      id: 't5',
      code: '20260551',
      venue: venues[0],
      courtName: 'Sân VIP',
      startsAt: _today(19, 0),
      endsAt: _today(21, 0),
      total: 1000000,
      status: BookingStatus.pendingPayment,
    ),
    Booking(
      id: 't6',
      code: '20260552',
      venue: venues[0],
      courtName: 'Sân 2',
      startsAt: _today(20, 0),
      endsAt: _today(22, 0),
      total: 700000,
      status: BookingStatus.confirmed,
    ),
  ];

  /// Top khách hàng tháng (cho dashboard owner).
  static const topCustomers = [
    ('Trần Minh', 8, 2400000),
    ('Lê Hà', 6, 1800000),
    ('Đức Phạm', 5, 1500000),
    ('Nguyễn An', 4, 1200000),
  ];

  /// Revenue 7 ngày gần nhất (data demo cho biểu đồ).
  static const revenueLast7Days = [
    2800000, 3100000, 4200000, 3500000, 5100000, 4800000, 4350000,
  ];

  /// Tài khoản nhận tiền của owner.
  static const ownerBankAccount = {
    'bankName': 'Vietcombank',
    'accountNumber': '0123 4567 8901 2345',
    'accountHolder': 'NGUYEN VAN A',
  };

  /// Lịch sử payout (giả lập 5 đợt gần nhất).
  static List<({DateTime date, int amount, String status})> payoutHistory = [
    (date: DateTime.now().subtract(const Duration(days: 1)), amount: 18450000, status: 'PAID'),
    (date: DateTime.now().subtract(const Duration(days: 8)), amount: 22300000, status: 'PAID'),
    (date: DateTime.now().subtract(const Duration(days: 15)), amount: 19800000, status: 'PAID'),
    (date: DateTime.now().subtract(const Duration(days: 22)), amount: 21100000, status: 'PAID'),
    (date: DateTime.now().subtract(const Duration(days: 29)), amount: 17600000, status: 'PAID'),
  ];

  // ─────────────────── STAFF mock ───────────────────

  /// Venue mà staff đang trực.
  static Venue staffVenue = venues[0];

  /// Booking hôm nay tại venue của staff (cùng bookingsToday vì cùng venue).
  static List<Booking> get staffBookingsToday => bookingsToday;

  /// Helper tạo DateTime hôm nay với giờ phút cho trước.
  static DateTime _today(int h, int m) {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day, h, m);
  }
}

