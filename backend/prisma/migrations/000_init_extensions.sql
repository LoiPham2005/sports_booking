-- Extensions cần thiết. Chạy sau prisma migrate dev đầu tiên,
-- hoặc đặt vào file migration của prisma (-- migration.sql).
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Anti double-booking: 1 court không thể có 2 booking active overlap
-- Cần thêm cột helper để dùng với EXCLUDE USING gist
ALTER TABLE "Booking"
  ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    "courtId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  ) WHERE (status IN ('PENDING_PAYMENT','CONFIRMED','CHECKED_IN'));
