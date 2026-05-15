import { PrismaClient, Role, Surface, VenueStatus } from '@prisma/client';
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

  // Admin user
  const adminPassword = await argon2.hash('admin@1234');
  await prisma.user.upsert({
    where: { email: 'admin@sportsbooking.local' },
    create: {
      email: 'admin@sportsbooking.local',
      fullName: 'Admin',
      passwordHash: adminPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: true,
    },
    update: {},
  });

  // Demo owner + venue + courts
  const owner = await prisma.user.upsert({
    where: { email: 'owner@sportsbooking.local' },
    create: {
      email: 'owner@sportsbooking.local',
      fullName: 'Demo Owner',
      passwordHash: await argon2.hash('owner@1234'),
      role: Role.OWNER,
      emailVerified: true,
    },
    update: {},
  });

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

  // eslint-disable-next-line no-console
  console.log('Seeded sports, amenities, admin (admin@sportsbooking.local / admin@1234), owner & demo venue');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
