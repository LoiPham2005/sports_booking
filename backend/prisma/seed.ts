import {
  PrismaClient,
  Role,
  Surface,
  VenueMemberRole,
  VenueMemberStatus,
  VenueStatus,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Sports
  const sports = [
    { slug: 'football_5', nameVi: 'Bóng đá 5 người', nameEn: 'Futsal 5', icon: '⚽', defaultSlotMinutes: 60 },
    { slug: 'football_7', nameVi: 'Bóng đá 7 người', nameEn: 'Football 7', icon: '⚽', defaultSlotMinutes: 90 },
    { slug: 'badminton', nameVi: 'Cầu lông', nameEn: 'Badminton', icon: '🏸', defaultSlotMinutes: 60 },
    { slug: 'tennis', nameVi: 'Tennis', nameEn: 'Tennis', icon: '🎾', defaultSlotMinutes: 60 },
    { slug: 'pickleball', nameVi: 'Pickleball', nameEn: 'Pickleball', icon: '🏓', defaultSlotMinutes: 60 },
    { slug: 'basketball', nameVi: 'Bóng rổ', nameEn: 'Basketball', icon: '🏀', defaultSlotMinutes: 60 },
  ];
  for (const s of sports) {
    await prisma.sport.upsert({ where: { slug: s.slug }, create: s, update: s });
  }

  // Amenities
  const amenities = [
    { slug: 'wifi', nameVi: 'Wifi', nameEn: 'Wifi' },
    { slug: 'parking', nameVi: 'Bãi đỗ xe', nameEn: 'Parking' },
    { slug: 'changing_room', nameVi: 'Phòng thay đồ', nameEn: 'Changing room' },
    { slug: 'shower', nameVi: 'Phòng tắm', nameEn: 'Shower' },
    { slug: 'led_light', nameVi: 'Đèn LED', nameEn: 'LED lighting' },
    { slug: 'roof', nameVi: 'Có mái che', nameEn: 'Roof cover' },
    { slug: 'water', nameVi: 'Nước uống', nameEn: 'Water' },
  ];
  for (const a of amenities) {
    await prisma.amenity.upsert({ where: { slug: a.slug }, create: a, update: a });
  }

  // ─────────── Test accounts (mọi role) ───────────
  // Convention: <role>@sportsbooking.local / <role>@1234
  async function upsertUser(email: string, fullName: string, password: string, role: Role) {
    return prisma.user.upsert({
      where: { email },
      create: {
        email,
        fullName,
        passwordHash: await argon2.hash(password),
        role,
        emailVerified: true,
      },
      update: { role, fullName }, // ép đúng role mỗi lần seed
    });
  }

  const superAdmin = await upsertUser(
    'super@gmail.com',
    'Super Admin',
    '12345678',
    Role.SUPER_ADMIN,
  );
  const admin = await upsertUser(
    'admin@gmail.com',
    'Admin Demo',
    '12345678',
    Role.ADMIN,
  );
  const owner = await upsertUser(
    'owner@gmail.com',
    'Demo Owner',
    '12345678',
    Role.OWNER,
  );
  const manager = await upsertUser(
    'manager@gmail.com',
    'Demo Manager',
    '12345678',
    Role.STAFF,
  );
  const staff = await upsertUser(
    'staff@gmail.com',
    'Demo Staff',
    '12345678',
    Role.STAFF,
  );
  const customer = await upsertUser(
    'customer@gmail.com',
    'Demo Customer',
    '12345678',
    Role.CUSTOMER,
  );
  // Tránh warning unused (các account này hiện chỉ dùng để đăng nhập test)
  void superAdmin;
  void admin;
  void customer;

  const badminton = await prisma.sport.findUniqueOrThrow({ where: { slug: 'badminton' } });

  const venue = await prisma.venue.upsert({
    where: { slug: 'san-cau-long-demo' },
    create: {
      ownerId: owner.id,
      name: 'Sân cầu lông Demo',
      slug: 'san-cau-long-demo',
      description: 'Sân demo seed data',
      addressLine: '123 Nguyễn Văn Linh',
      city: 'Hồ Chí Minh',
      district: 'Quận 7',
      lat: 10.7280,
      lng: 106.7160,
      status: VenueStatus.APPROVED,
    },
    update: {},
  });

  // Manager + Staff thuộc venue demo
  await prisma.venueMember.upsert({
    where: { venueId_userId: { venueId: venue.id, userId: manager.id } },
    create: {
      venueId: venue.id,
      userId: manager.id,
      role: VenueMemberRole.MANAGER,
      inviteStatus: VenueMemberStatus.ACTIVE,
      acceptedAt: new Date(),
    },
    update: {
      role: VenueMemberRole.MANAGER,
      inviteStatus: VenueMemberStatus.ACTIVE,
    },
  });
  await prisma.venueMember.upsert({
    where: { venueId_userId: { venueId: venue.id, userId: staff.id } },
    create: {
      venueId: venue.id,
      userId: staff.id,
      role: VenueMemberRole.STAFF,
      inviteStatus: VenueMemberStatus.ACTIVE,
      acceptedAt: new Date(),
    },
    update: {
      role: VenueMemberRole.STAFF,
      inviteStatus: VenueMemberStatus.ACTIVE,
    },
  });

  const court = await prisma.court.create({
    data: {
      venueId: venue.id,
      sportId: badminton.id,
      name: 'Sân 1',
      surface: Surface.WOOD,
      indoor: true,
      capacity: 4,
      slotDurationMinutes: 60,
    },
  });

  // PriceRule: thứ 2-6 (1..5): 6h-17h: 80k/h, 17h-22h: 150k/h; thứ 7-CN: 120k / 180k
  for (let dow = 1; dow <= 5; dow += 1) {
    await prisma.priceRule.createMany({
      data: [
        { courtId: court.id, dayOfWeek: dow, startTime: '06:00', endTime: '17:00', pricePerSlot: 80_000 },
        { courtId: court.id, dayOfWeek: dow, startTime: '17:00', endTime: '22:00', pricePerSlot: 150_000 },
      ],
    });
  }
  for (const dow of [0, 6]) {
    await prisma.priceRule.createMany({
      data: [
        { courtId: court.id, dayOfWeek: dow, startTime: '06:00', endTime: '17:00', pricePerSlot: 120_000 },
        { courtId: court.id, dayOfWeek: dow, startTime: '17:00', endTime: '22:00', pricePerSlot: 180_000 },
      ],
    });
  }

  // Hours
  for (let dow = 0; dow < 7; dow += 1) {
    await prisma.venueHour.create({
      data: { venueId: venue.id, dayOfWeek: dow, openTime: '06:00', closeTime: '22:00' },
    });
  }

  // ─────────── Venues bổ sung cho map (đa môn, toạ độ HCM thật) ───────────
  const sportBySlug = Object.fromEntries(
    (await prisma.sport.findMany()).map((s) => [s.slug, s]),
  );

  const extraVenues = [
    {
      slug: 'san-bong-da-pmh',
      name: 'Sân bóng đá Phú Mỹ Hưng',
      addressLine: '123 Nguyễn Văn Linh',
      district: 'Quận 7',
      lat: 10.7299,
      lng: 106.7215,
      sport: 'football_7',
      surface: Surface.ARTIFICIAL_GRASS,
      indoor: false,
      base: 350_000,
    },
    {
      slug: 'clb-cau-long-vinhomes',
      name: 'CLB cầu lông Vinhomes Central',
      addressLine: '720A Điện Biên Phủ',
      district: 'Bình Thạnh',
      lat: 10.8014,
      lng: 106.7109,
      sport: 'badminton',
      surface: Surface.WOOD,
      indoor: true,
      base: 120_000,
    },
    {
      slug: 'san-tennis-lan-anh',
      name: 'Sân tennis Lan Anh',
      addressLine: '291 Cách Mạng Tháng 8',
      district: 'Quận 10',
      lat: 10.7745,
      lng: 106.6649,
      sport: 'tennis',
      surface: Surface.CLAY,
      indoor: false,
      base: 200_000,
    },
    {
      slug: 'pickleball-ssc',
      name: 'Pickleball Saigon Sports Club',
      addressLine: '14 Thi Sách',
      district: 'Quận 1',
      lat: 10.7806,
      lng: 106.7019,
      sport: 'pickleball',
      surface: Surface.RUBBER,
      indoor: true,
      base: 180_000,
    },
    {
      slug: 'san-bong-ro-tao-dan',
      name: 'Sân bóng rổ Tao Đàn',
      addressLine: 'Công viên Tao Đàn',
      district: 'Quận 1',
      lat: 10.7716,
      lng: 106.6919,
      sport: 'basketball',
      surface: Surface.CONCRETE,
      indoor: false,
      base: 80_000,
    },
    {
      slug: 'san-bong-7-thu-duc',
      name: 'Sân bóng 7 Mini Thủ Đức',
      addressLine: '45 Võ Văn Ngân',
      district: 'Thủ Đức',
      lat: 10.8505,
      lng: 106.7717,
      sport: 'football_7',
      surface: Surface.ARTIFICIAL_GRASS,
      indoor: false,
      base: 280_000,
    },
  ];

  for (const v of extraVenues) {
    const sport = sportBySlug[v.sport];
    if (!sport) continue;
    const created = await prisma.venue.upsert({
      where: { slug: v.slug },
      create: {
        ownerId: owner.id,
        name: v.name,
        slug: v.slug,
        addressLine: v.addressLine,
        city: 'Hồ Chí Minh',
        district: v.district,
        lat: v.lat,
        lng: v.lng,
        status: VenueStatus.APPROVED,
      },
      update: { lat: v.lat, lng: v.lng, status: VenueStatus.APPROVED },
    });
    const existingCourt = await prisma.court.findFirst({ where: { venueId: created.id } });
    if (!existingCourt) {
      const c = await prisma.court.create({
        data: {
          venueId: created.id,
          sportId: sport.id,
          name: 'Sân 1',
          surface: v.surface,
          indoor: v.indoor,
          capacity: 10,
          slotDurationMinutes: sport.defaultSlotMinutes,
        },
      });
      // Giá đơn giản: 1 rule cả ngày, tất cả các ngày.
      for (let dow = 0; dow < 7; dow += 1) {
        await prisma.priceRule.create({
          data: {
            courtId: c.id,
            dayOfWeek: dow,
            startTime: '06:00',
            endTime: '22:00',
            pricePerSlot: v.base,
          },
        });
      }
      for (let dow = 0; dow < 7; dow += 1) {
        await prisma.venueHour.create({
          data: { venueId: created.id, dayOfWeek: dow, openTime: '06:00', closeTime: '22:00' },
        });
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    [
      'Seeded:',
      '- sports + amenities',
      '- accounts (mọi role):',
      '    super@sportsbooking.local  / super@1234   (SUPER_ADMIN)',
      '    admin@sportsbooking.local  / admin@1234   (ADMIN)',
      '    owner@sportsbooking.local  / owner@1234   (OWNER)',
      '    manager@sportsbooking.local / manager@1234 (STAFF + VenueMember.MANAGER)',
      '    staff@sportsbooking.local  / staff@1234   (STAFF + VenueMember.STAFF)',
      '    customer@sportsbooking.local / customer@1234 (CUSTOMER)',
      `- ${1 + extraVenues.length} venues at HCM with lat/lng for map`,
    ].join('\n'),
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
