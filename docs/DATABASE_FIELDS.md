# Giải thích chi tiết các thuộc tính từng bảng

## Mục lục
- [Enums (Kiểu liệt kê)](#enums)
- [User — Người dùng](#user)
- [RefreshToken — Token làm mới](#refreshtoken)
- [Device — Thiết bị](#device)
- [OtpCode — Mã OTP](#otpcode)
- [Sport — Môn thể thao](#sport)
- [Amenity — Tiện ích](#amenity)
- [Venue — Sân thể thao](#venue)
- [VenueImage — Ảnh sân](#venueimage)
- [VenueAmenity — Tiện ích của sân](#venueamenity)
- [VenueHour — Giờ hoạt động](#venuehour)
- [VenueMember — Thành viên sân](#venuemember)
- [Court — Sân con](#court)
- [CourtClosure — Đóng sân tạm thời](#courtclosure)
- [PriceRule — Quy tắc giá](#pricerule)
- [Pr iceOverride — Giá ghi đè](#priceoverride)
- [Booking — Đặt sân](#booking)
- [Payment — Thanh toán](#payment)
- [PaymentEvent — Sự kiện thanh toán](#paymentevent)
- [Refund — Hoàn tiền](#refund)
- [Voucher — Mã giảm giá](#voucher)
- [VoucherRedemption — Lịch sử dùng voucher](#voucherredemption)
- [Review — Đánh giá](#review)
- [Favorite — Yêu thích](#favorite)
- [Notification — Thông báo](#notification)
- [NotificationPreference — Tùy chỉnh thông báo](#notificationpreference)
- [MediaAsset — File media](#mediaasset)
- [BankAccount — Tài khoản ngân hàng](#bankaccount)
- [OwnerEarning — Thu nhập chủ sân](#ownerearning)
- [Payout — Thanh toán cho chủ sân](#payout)
- [AuditLog — Nhật ký hệ thống](#auditlog)
- [SystemSetting — Cài đặt hệ thống](#systemsetting)
- [FeatureFlag — Cờ tính năng](#featureflag)

---

## Enums

### Role — Vai trò người dùng
| Giá trị | Ý nghĩa |
|---|---|
| `CUSTOMER` | Khách hàng đặt sân thông thường |
| `OWNER` | Chủ sân, quản lý venue và nhân viên |
| `STAFF` | Nhân viên sân, hỗ trợ check-in và vận hành |
| `ADMIN` | Quản trị viên hệ thống |
| `SUPER_ADMIN` | Quản trị viên cấp cao nhất |

### UserStatus — Trạng thái tài khoản
| Giá trị | Ý nghĩa |
|---|---|
| `ACTIVE` | Tài khoản đang hoạt động bình thường |
| `SUSPENDED` | Tài khoản bị tạm khóa |
| `DELETED` | Tài khoản đã bị xóa (soft delete) |

### Gender — Giới tính
| Giá trị | Ý nghĩa |
|---|---|
| `MALE` | Nam |
| `FEMALE` | Nữ |
| `OTHER` | Khác |

### VenueStatus — Trạng thái sân
| Giá trị | Ý nghĩa |
|---|---|
| `DRAFT` | Bản nháp, chủ sân đang điền thông tin |
| `PENDING` | Đã nộp, chờ admin duyệt |
| `APPROVED` | Đã được duyệt, hiển thị cho khách hàng |
| `SUSPENDED` | Bị tạm đình chỉ do vi phạm |

### Surface — Loại mặt sân
| Giá trị | Ý nghĩa |
|---|---|
| `NATURAL_GRASS` | Cỏ tự nhiên |
| `ARTIFICIAL_GRASS` | Cỏ nhân tạo |
| `WOOD` | Sàn gỗ |
| `EPOXY` | Sàn epoxy |
| `CLAY` | Sân đất nện |
| `RUBBER` | Sàn cao su |
| `CONCRETE` | Sân bê tông |

### BookingStatus — Trạng thái đặt sân
| Giá trị | Ý nghĩa |
|---|---|
| `PENDING_PAYMENT` | Đang chờ thanh toán (giữ chỗ tạm thời) |
| `CONFIRMED` | Đã thanh toán, xác nhận thành công |
| `CHECKED_IN` | Khách đã check-in vào sân |
| `COMPLETED` | Buổi chơi đã kết thúc |
| `CANCELLED_BY_USER` | Người dùng tự hủy |
| `CANCELLED_BY_OWNER` | Chủ sân hủy |
| `CANCELLED_TIMEOUT` | Hết thời gian thanh toán, tự động hủy |
| `NO_SHOW` | Khách không đến |
| `REFUNDED` | Đã hoàn tiền |

### BookingSource — Nguồn đặt sân
| Giá trị | Ý nghĩa |
|---|---|
| `ONLINE` | Đặt qua app/web |
| `WALK_IN` | Đặt trực tiếp tại sân (nhân viên tạo) |

### PaymentProvider — Cổng thanh toán
| Giá trị | Ý nghĩa |
|---|---|
| `VNPAY` | Thanh toán qua VNPay |
| `MOMO` | Thanh toán qua MoMo |
| `ZALOPAY` | Thanh toán qua ZaloPay |
| `STRIPE` | Thanh toán qua Stripe |
| `BANK_TRANSFER` | Chuyển khoản ngân hàng |
| `CASH` | Thanh toán tiền mặt (walk-in) |

### PaymentStatus — Trạng thái thanh toán
| Giá trị | Ý nghĩa |
|---|---|
| `PENDING` | Đang chờ xử lý |
| `SUCCESS` | Thanh toán thành công |
| `FAILED` | Thanh toán thất bại |
| `CANCELLED` | Đã hủy |
| `EXPIRED` | Hết hạn thanh toán |
| `REFUND_PENDING` | Đang chờ hoàn tiền |
| `REFUNDED` | Đã hoàn tiền toàn bộ |
| `PARTIALLY_REFUNDED` | Hoàn tiền một phần |

### VoucherType — Loại voucher
| Giá trị | Ý nghĩa |
|---|---|
| `PERCENT` | Giảm theo phần trăm |
| `FIXED` | Giảm số tiền cố định |

### VoucherScope — Phạm vi áp dụng voucher
| Giá trị | Ý nghĩa |
|---|---|
| `GLOBAL` | Áp dụng cho toàn bộ hệ thống |
| `VENUE` | Chỉ áp dụng cho một sân cụ thể |
| `SPORT` | Chỉ áp dụng cho một môn thể thao |

### VenueMemberRole — Vai trò trong sân
| Giá trị | Ý nghĩa |
|---|---|
| `MANAGER` | Quản lý sân, có quyền đặt giá và xem báo cáo |
| `STAFF` | Nhân viên, chỉ hỗ trợ check-in và vận hành |

### VenueMemberStatus — Trạng thái thành viên sân
| Giá trị | Ý nghĩa |
|---|---|
| `PENDING` | Đã gửi lời mời, chưa chấp nhận |
| `ACTIVE` | Đang hoạt động |
| `SUSPENDED` | Tạm đình chỉ |
| `REMOVED` | Đã bị xóa khỏi sân |

---

## User

Bảng trung tâm lưu thông tin tất cả người dùng trong hệ thống.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính, tự động sinh |
| `email` | String? | | Địa chỉ email, duy nhất. Có thể null nếu đăng ký bằng SĐT |
| `phone` | String? | | Số điện thoại định dạng E.164 (VD: +84912345678), duy nhất |
| `passwordHash` | String? | | Mật khẩu đã băm bằng argon2. Null nếu chỉ dùng đăng nhập mạng xã hội |
| `fullName` | String | ✓ | Họ và tên đầy đủ |
| `avatarUrl` | String? | | URL ảnh đại diện |
| `dob` | Date? | | Ngày sinh (chỉ lưu ngày, không có giờ) |
| `gender` | Gender? | | Giới tính |
| `locale` | String | ✓ | Ngôn ngữ hiển thị, mặc định `vi` |
| `role` | Role | ✓ | Vai trò trong hệ thống, mặc định `CUSTOMER` |
| `emailVerified` | Boolean | ✓ | Đã xác thực email chưa, mặc định `false` |
| `phoneVerified` | Boolean | ✓ | Đã xác thực SĐT chưa, mặc định `false` |
| `status` | UserStatus | ✓ | Trạng thái tài khoản, mặc định `ACTIVE` |
| `createdAt` | DateTime | ✓ | Thời điểm tạo tài khoản |
| `updatedAt` | DateTime | ✓ | Thời điểm cập nhật gần nhất |

---

## RefreshToken

Lưu token dùng để làm mới access token mà không cần đăng nhập lại.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `userId` | String | ✓ | ID người dùng sở hữu token này |
| `tokenHash` | String | ✓ | Giá trị token đã băm (không lưu token gốc) |
| `deviceId` | String? | | ID thiết bị tạo token (liên kết với bảng Device) |
| `ip` | String? | | Địa chỉ IP khi tạo token |
| `userAgent` | String? | | Thông tin trình duyệt/app khi tạo token |
| `expiresAt` | DateTime | ✓ | Thời điểm token hết hạn |
| `revokedAt` | DateTime? | | Thời điểm token bị thu hồi. Null = còn hiệu lực |
| `createdAt` | DateTime | ✓ | Thời điểm tạo token |

---

## Device

Lưu thông tin thiết bị của người dùng để gửi push notification.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `userId` | String | ✓ | ID người dùng sở hữu thiết bị |
| `platform` | DevicePlatform | ✓ | Nền tảng: IOS / ANDROID / WEB |
| `fcmToken` | String? | | Firebase Cloud Messaging token để gửi push notification |
| `lastSeenAt` | DateTime | ✓ | Lần cuối thiết bị online |
| `createdAt` | DateTime | ✓ | Thời điểm đăng ký thiết bị |

---

## OtpCode

Lưu mã OTP dùng cho xác thực SĐT, quên mật khẩu, v.v.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `target` | String | ✓ | Email hoặc SĐT nhận OTP |
| `codeHash` | String | ✓ | Mã OTP đã băm |
| `purpose` | String | ✓ | Mục đích: `VERIFY_PHONE`, `RESET_PASSWORD`, ... |
| `attempts` | Int | ✓ | Số lần nhập sai, mặc định 0 (chống brute-force) |
| `expiresAt` | DateTime | ✓ | Thời điểm OTP hết hạn |
| `consumedAt` | DateTime? | | Thời điểm OTP được dùng thành công. Null = chưa dùng |
| `createdAt` | DateTime | ✓ | Thời điểm tạo OTP |

---

## Sport

Danh mục các môn thể thao hỗ trợ trong hệ thống.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `slug` | String | ✓ | Định danh URL thân thiện, duy nhất (VD: `bong-da`) |
| `nameVi` | String | ✓ | Tên tiếng Việt (VD: Bóng đá) |
| `nameEn` | String | ✓ | Tên tiếng Anh (VD: Football) |
| `icon` | String? | | Emoji hoặc tên icon đại diện |
| `defaultSlotMinutes` | Int | ✓ | Thời lượng mặc định một slot đặt sân (phút), mặc định 60 |
| `isActive` | Boolean | ✓ | Có đang kích hoạt không, mặc định `true` |

---

## Amenity

Danh mục tiện ích có thể có tại sân (bãi đỗ xe, phòng thay đồ, ...).

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `slug` | String | ✓ | Định danh duy nhất (VD: `parking`) |
| `nameVi` | String | ✓ | Tên tiếng Việt (VD: Bãi đỗ xe) |
| `nameEn` | String | ✓ | Tên tiếng Anh (VD: Parking) |
| `icon` | String? | | Emoji hoặc tên icon |

---

## Venue

Thông tin sân thể thao do chủ sân tạo và quản lý.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `ownerId` | String | ✓ | ID người dùng là chủ sân |
| `name` | String | ✓ | Tên sân (VD: Sân bóng Thống Nhất) |
| `slug` | String | ✓ | Định danh URL duy nhất (VD: `san-bong-thong-nhat`) |
| `description` | String? | | Mô tả chi tiết về sân |
| `addressLine` | String | ✓ | Địa chỉ chi tiết (số nhà, tên đường) |
| `ward` | String? | | Phường/Xã |
| `district` | String? | | Quận/Huyện |
| `city` | String | ✓ | Tỉnh/Thành phố |
| `country` | String | ✓ | Quốc gia, mặc định `VN` |
| `lat` | Decimal? | | Vĩ độ GPS (để hiển thị bản đồ và tìm kiếm gần đây) |
| `lng` | Decimal? | | Kinh độ GPS |
| `phone` | String? | | SĐT liên hệ của sân |
| `status` | VenueStatus | ✓ | Trạng thái duyệt, mặc định `DRAFT` |
| `ratingAvg` | Decimal | ✓ | Điểm đánh giá trung bình (1.0–5.0), denormalized để query nhanh |
| `ratingCount` | Int | ✓ | Tổng số lượt đánh giá |
| `cancelPolicyJson` | Json? | | Chính sách hủy đặt sân riêng của sân này (ghi đè chính sách mặc định) |
| `createdAt` | DateTime | ✓ | Thời điểm tạo |
| `updatedAt` | DateTime | ✓ | Thời điểm cập nhật gần nhất |
| `deletedAt` | DateTime? | | Thời điểm xóa mềm. Null = chưa xóa |

---

## VenueImage

Ảnh của sân thể thao.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `venueId` | String | ✓ | ID sân sở hữu ảnh này |
| `url` | String | ✓ | Đường dẫn ảnh (URL S3/CDN) |
| `sort` | Int | ✓ | Thứ tự hiển thị, mặc định 0 |
| `isPrimary` | Boolean | ✓ | Có phải ảnh đại diện của sân không |

---

## VenueAmenity

Bảng trung gian liên kết sân với các tiện ích (quan hệ nhiều-nhiều).

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `venueId` | String | ✓ | ID sân |
| `amenityId` | String | ✓ | ID tiện ích |

Khóa chính là tổ hợp `(venueId, amenityId)`.

---

## VenueHour

Giờ hoạt động của sân theo từng ngày trong tuần.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `venueId` | String | ✓ | ID sân |
| `dayOfWeek` | Int | ✓ | Ngày trong tuần: 0=Chủ nhật, 1=Thứ 2, ..., 6=Thứ 7 |
| `openTime` | String | ✓ | Giờ mở cửa, định dạng `HH:MM` (VD: `06:00`) |
| `closeTime` | String | ✓ | Giờ đóng cửa, định dạng `HH:MM` (VD: `22:00`) |

Một ngày có thể có nhiều record để hỗ trợ nghỉ trưa (VD: 6:00–12:00 và 13:00–22:00).

---

## VenueMember

Quản lý nhân viên và người quản lý được phân quyền vào sân.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `venueId` | String | ✓ | ID sân |
| `userId` | String? | | ID người dùng. Null khi lời mời chưa được chấp nhận |
| `email` | String? | | Email mời (dùng khi người được mời chưa có tài khoản) |
| `role` | VenueMemberRole | ✓ | Vai trò: MANAGER hoặc STAFF |
| `inviteStatus` | VenueMemberStatus | ✓ | Trạng thái lời mời, mặc định `ACTIVE` |
| `inviteToken` | String? | | Token xác nhận lời mời, gửi qua email |
| `inviteExpiresAt` | DateTime? | | Thời điểm lời mời hết hạn |
| `createdAt` | DateTime | ✓ | Thời điểm gửi lời mời |
| `acceptedAt` | DateTime? | | Thời điểm chấp nhận lời mời |

---

## Court

Sân con — đơn vị có thể đặt lịch trong một venue.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `venueId` | String | ✓ | ID venue chứa sân con này |
| `sportId` | String | ✓ | ID môn thể thao của sân |
| `name` | String | ✓ | Tên sân con (VD: Sân 1, Sân A) |
| `surface` | Surface | ✓ | Loại mặt sân |
| `indoor` | Boolean | ✓ | Có mái che không, mặc định `false` |
| `capacity` | Int | ✓ | Số người tối đa, mặc định 10 |
| `slotDurationMinutes` | Int | ✓ | Thời lượng một slot đặt (phút), mặc định 60 |
| `isActive` | Boolean | ✓ | Có đang cho đặt lịch không |
| `createdAt` | DateTime | ✓ | Thời điểm tạo |
| `updatedAt` | DateTime | ✓ | Thời điểm cập nhật gần nhất |
| `deletedAt` | DateTime? | | Thời điểm xóa mềm |

---

## CourtClosure

Đóng sân tạm thời trong một khoảng thời gian (bảo trì, sự kiện, ...).

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `courtId` | String | ✓ | ID sân con bị đóng |
| `startsAt` | DateTime | ✓ | Thời điểm bắt đầu đóng |
| `endsAt` | DateTime | ✓ | Thời điểm kết thúc đóng |
| `reason` | String? | | Lý do đóng sân |

---

## PriceRule

Quy tắc giá theo ngày và khung giờ trong tuần.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `courtId` | String | ✓ | ID sân con áp dụng |
| `dayOfWeek` | Int | ✓ | Ngày trong tuần (0=Chủ nhật, 1–6=Thứ 2–7) |
| `startTime` | String | ✓ | Giờ bắt đầu áp dụng giá (VD: `06:00`) |
| `endTime` | String | ✓ | Giờ kết thúc áp dụng giá (VD: `10:00`) |
| `pricePerSlot` | Decimal | ✓ | Giá tiền mỗi slot (VND) |

---

## PriceOverride

Giá ghi đè cho ngày cụ thể (ngày lễ, sự kiện, khuyến mãi).

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `courtId` | String | ✓ | ID sân con áp dụng |
| `date` | Date | ✓ | Ngày cụ thể áp dụng giá đặc biệt |
| `startTime` | String | ✓ | Giờ bắt đầu (VD: `08:00`) |
| `endTime` | String | ✓ | Giờ kết thúc (VD: `12:00`) |
| `price` | Decimal | ✓ | Giá ghi đè (VND) |
| `reason` | String? | | Lý do áp dụng giá đặc biệt (VD: Ngày lễ 30/4) |

---

## Booking

Bảng trung tâm lưu thông tin đặt sân. Không soft delete — giữ toàn bộ lịch sử.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `code` | String | ✓ | Mã booking ngắn 8 ký tự, duy nhất (cho khách tra cứu) |
| `userId` | String | ✓ | ID người đặt sân |
| `courtId` | String | ✓ | ID sân con được đặt |
| `venueId` | String | ✓ | ID venue (denormalized để query nhanh) |
| `startsAt` | DateTime | ✓ | Thời điểm bắt đầu chơi |
| `endsAt` | DateTime | ✓ | Thời điểm kết thúc chơi |
| `status` | BookingStatus | ✓ | Trạng thái đặt sân, mặc định `PENDING_PAYMENT` |
| `source` | BookingSource | ✓ | Nguồn đặt: ONLINE hoặc WALK_IN |
| `subtotal` | Decimal | ✓ | Tổng tiền trước giảm giá (VND) |
| `discount` | Decimal | ✓ | Số tiền giảm giá, mặc định 0 |
| `total` | Decimal | ✓ | Tổng tiền phải trả (= subtotal - discount) |
| `voucherId` | String? | | ID voucher áp dụng (nếu có) |
| `notes` | String? | | Ghi chú của người đặt |
| `checkInToken` | String? | | Token QR code dùng một lần để check-in |
| `checkedInAt` | DateTime? | | Thời điểm check-in thành công |
| `cancelledAt` | DateTime? | | Thời điểm hủy booking |
| `cancelReason` | String? | | Lý do hủy |
| `refundAmount` | Decimal? | | Số tiền đã hoàn lại |
| `recurringGroupId` | String? | | ID nhóm để liên kết các booking thuộc cùng một series lặp lại |
| `handledByUserId` | String? | | ID nhân viên/manager xử lý check-in hoặc tạo walk-in |
| `refusedAt` | DateTime? | | Thời điểm chủ sân từ chối booking |
| `refuseReason` | String? | | Lý do chủ sân từ chối |
| `createdAt` | DateTime | ✓ | Thời điểm tạo booking |
| `updatedAt` | DateTime | ✓ | Thời điểm cập nhật gần nhất |

---

## Payment

Giao dịch thanh toán liên kết với booking.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `bookingId` | String? | | ID booking (nullable cho các payment ngoài luồng tương lai) |
| `userId` | String | ✓ | ID người thanh toán |
| `provider` | PaymentProvider | ✓ | Cổng thanh toán sử dụng |
| `amount` | Decimal | ✓ | Số tiền giao dịch (VND) |
| `currency` | String | ✓ | Đơn vị tiền tệ, mặc định `VND` |
| `status` | PaymentStatus | ✓ | Trạng thái giao dịch, mặc định `PENDING` |
| `providerRef` | String? | | Mã giao dịch do cổng thanh toán trả về |
| `providerOrderId` | String | ✓ | Mã đơn hàng ta gửi sang cổng thanh toán, duy nhất |
| `redirectUrl` | String? | | URL redirect sau thanh toán |
| `qrData` | String? | | Dữ liệu QR code thanh toán |
| `paidAt` | DateTime? | | Thời điểm thanh toán thành công |
| `failedReason` | String? | | Lý do thanh toán thất bại |
| `metadata` | Json? | | Thông tin bổ sung từ cổng thanh toán |
| `createdAt` | DateTime | ✓ | Thời điểm tạo giao dịch |
| `updatedAt` | DateTime | ✓ | Thời điểm cập nhật gần nhất |

---

## PaymentEvent

Lưu các webhook event từ cổng thanh toán để đảm bảo idempotency (không xử lý trùng lặp).

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `paymentId` | String? | | ID payment liên quan |
| `provider` | PaymentProvider | ✓ | Cổng thanh toán gửi event |
| `eventType` | String | ✓ | Loại sự kiện (VD: `payment.success`) |
| `externalEventId` | String | ✓ | ID event do cổng thanh toán cung cấp |
| `rawPayload` | Json | ✓ | Toàn bộ dữ liệu webhook gốc |
| `signatureValid` | Boolean | ✓ | Chữ ký webhook có hợp lệ không |
| `processedAt` | DateTime? | | Thời điểm xử lý xong. Null = chưa xử lý |
| `createdAt` | DateTime | ✓ | Thời điểm nhận event |

Unique: `(provider, externalEventId)` — đảm bảo mỗi event chỉ xử lý một lần.

---

## Refund

Yêu cầu hoàn tiền cho một giao dịch.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `paymentId` | String | ✓ | ID payment cần hoàn |
| `amount` | Decimal | ✓ | Số tiền hoàn (VND) |
| `reason` | String? | | Lý do hoàn tiền |
| `status` | RefundStatus | ✓ | Trạng thái: PENDING / SUCCESS / FAILED |
| `providerRefundRef` | String? | | Mã hoàn tiền do cổng thanh toán cung cấp |
| `requestedById` | String? | | ID người yêu cầu hoàn tiền |
| `createdAt` | DateTime | ✓ | Thời điểm tạo yêu cầu |
| `updatedAt` | DateTime | ✓ | Thời điểm cập nhật gần nhất |

---

## Voucher

Mã giảm giá do admin tạo.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `code` | String | ✓ | Mã voucher người dùng nhập (VD: `SUMMER20`), duy nhất |
| `type` | VoucherType | ✓ | Loại giảm giá: PERCENT hoặc FIXED |
| `value` | Decimal | ✓ | Giá trị giảm (% hoặc VND tùy type) |
| `maxDiscount` | Decimal? | | Giảm tối đa (dùng khi type=PERCENT để giới hạn) |
| `minOrder` | Decimal? | | Đơn tối thiểu để áp dụng voucher |
| `validFrom` | DateTime | ✓ | Thời điểm bắt đầu hiệu lực |
| `validTo` | DateTime | ✓ | Thời điểm hết hiệu lực |
| `usageLimit` | Int? | | Tổng số lần có thể dùng (null = không giới hạn) |
| `perUserLimit` | Int? | | Số lần mỗi người có thể dùng (null = không giới hạn) |
| `scope` | VoucherScope | ✓ | Phạm vi áp dụng, mặc định `GLOBAL` |
| `scopeRefId` | String? | | ID venue/sport khi scope=VENUE hoặc SPORT |
| `isActive` | Boolean | ✓ | Có đang kích hoạt không |
| `createdAt` | DateTime | ✓ | Thời điểm tạo |
| `updatedAt` | DateTime | ✓ | Thời điểm cập nhật gần nhất |

---

## VoucherRedemption

Lịch sử sử dụng voucher của người dùng.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `voucherId` | String | ✓ | ID voucher được dùng |
| `userId` | String | ✓ | ID người dùng |
| `bookingId` | String | ✓ | ID booking áp dụng voucher, duy nhất (1 booking chỉ dùng 1 voucher) |
| `amount` | Decimal | ✓ | Số tiền thực tế được giảm |
| `createdAt` | DateTime | ✓ | Thời điểm sử dụng |

---

## Review

Đánh giá của người dùng sau khi chơi tại sân.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `userId` | String | ✓ | ID người đánh giá |
| `venueId` | String | ✓ | ID sân được đánh giá |
| `bookingId` | String | ✓ | ID booking (unique — 1 booking chỉ được đánh giá 1 lần) |
| `rating` | Int | ✓ | Số sao từ 1 đến 5 |
| `content` | String? | | Nội dung đánh giá chi tiết |
| `ownerReply` | String? | | Phản hồi của chủ sân |
| `ownerRepliedAt` | DateTime? | | Thời điểm chủ sân phản hồi |
| `status` | ReviewStatus | ✓ | VISIBLE (hiển thị) hoặc HIDDEN (ẩn bởi admin) |
| `createdAt` | DateTime | ✓ | Thời điểm tạo đánh giá |
| `updatedAt` | DateTime | ✓ | Thời điểm cập nhật gần nhất |

---

## Favorite

Danh sách sân yêu thích của người dùng.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `userId` | String | ✓ | ID người dùng |
| `venueId` | String | ✓ | ID sân yêu thích |
| `createdAt` | DateTime | ✓ | Thời điểm thêm vào yêu thích |

Khóa chính là tổ hợp `(userId, venueId)`.

---

## Notification

Thông báo gửi đến người dùng.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `userId` | String | ✓ | ID người nhận |
| `type` | String | ✓ | Loại thông báo (VD: `BOOKING_CONFIRMED`, `PAYMENT_SUCCESS`) |
| `title` | String | ✓ | Tiêu đề thông báo |
| `body` | String? | | Nội dung chi tiết |
| `dataJson` | Json? | | Dữ liệu bổ sung (VD: bookingId để deeplink) |
| `readAt` | DateTime? | | Thời điểm đọc. Null = chưa đọc |
| `createdAt` | DateTime | ✓ | Thời điểm gửi |

---

## NotificationPreference

Tùy chỉnh kênh thông báo của từng người dùng.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `userId` | String | ✓ | ID người dùng |
| `type` | String | ✓ | Loại thông báo (VD: `BOOKING_CONFIRMED`) |
| `channel` | NotificationChannel | ✓ | Kênh: PUSH / EMAIL / SMS / IN_APP |
| `enabled` | Boolean | ✓ | Bật/tắt kênh này cho loại thông báo này |

Unique: `(userId, type, channel)`.

---

## MediaAsset

File media (ảnh, video) upload lên S3.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `ownerType` | MediaOwnerType | ✓ | Loại đối tượng sở hữu: USER / VENUE / COURT / REVIEW |
| `ownerId` | String | ✓ | ID đối tượng sở hữu file |
| `key` | String | ✓ | S3 object key, duy nhất |
| `url` | String | ✓ | URL công khai để truy cập file |
| `mimeType` | String | ✓ | Loại file (VD: `image/jpeg`) |
| `sizeBytes` | Int | ✓ | Kích thước file tính bằng byte |
| `width` | Int? | | Chiều rộng (px), chỉ có với ảnh |
| `height` | Int? | | Chiều cao (px), chỉ có với ảnh |
| `createdAt` | DateTime | ✓ | Thời điểm upload |

---

## BankAccount

Tài khoản ngân hàng của chủ sân để nhận tiền thanh toán.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `userId` | String | ✓ | ID chủ sân sở hữu tài khoản |
| `bankCode` | String | ✓ | Mã ngân hàng (VD: `VCB`, `TCB`) |
| `accountNumber` | String | ✓ | Số tài khoản ngân hàng |
| `accountHolder` | String | ✓ | Tên chủ tài khoản (khớp với tên ngân hàng) |
| `isDefault` | Boolean | ✓ | Có phải tài khoản mặc định nhận tiền không |
| `createdAt` | DateTime | ✓ | Thời điểm thêm tài khoản |

---

## OwnerEarning

Thu nhập của chủ sân từ mỗi booking hoàn thành.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `ownerId` | String | ✓ | ID chủ sân |
| `bookingId` | String | ✓ | ID booking tạo ra thu nhập này |
| `paymentId` | String | ✓ | ID payment đã thanh toán thành công |
| `gross` | Decimal | ✓ | Tổng tiền khách trả (VND) |
| `commission` | Decimal | ✓ | Phần trăm hoa hồng platform giữ lại (VND) |
| `netAmount` | Decimal | ✓ | Số tiền thực chủ sân nhận (= gross - commission) |
| `status` | OwnerEarningStatus | ✓ | PENDING (chưa thanh toán) hoặc PAID (đã thanh toán) |
| `payoutId` | String? | | ID đợt thanh toán chứa khoản này (null = chưa được gộp vào đợt nào) |
| `createdAt` | DateTime | ✓ | Thời điểm ghi nhận thu nhập |

---

## Payout

Đợt thanh toán tiền cho chủ sân theo kỳ.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `ownerId` | String | ✓ | ID chủ sân nhận tiền |
| `periodFrom` | DateTime | ✓ | Ngày bắt đầu kỳ tính thu nhập |
| `periodTo` | DateTime | ✓ | Ngày kết thúc kỳ tính thu nhập |
| `amount` | Decimal | ✓ | Tổng số tiền thanh toán trong kỳ |
| `status` | PayoutStatus | ✓ | PENDING / PROCESSING / PAID / FAILED |
| `bankAccountId` | String | ✓ | ID tài khoản ngân hàng nhận tiền |
| `reference` | String? | | Mã tham chiếu giao dịch chuyển khoản |
| `createdAt` | DateTime | ✓ | Thời điểm tạo đợt thanh toán |
| `paidAt` | DateTime? | | Thời điểm chuyển khoản thành công |

---

## AuditLog

Nhật ký ghi lại mọi hành động quan trọng trong hệ thống.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String (cuid) | ✓ | Khóa chính |
| `actorId` | String? | | ID người thực hiện hành động (null nếu hệ thống tự chạy) |
| `actorRole` | String? | | Vai trò của người thực hiện tại thời điểm đó |
| `action` | String | ✓ | Hành động thực hiện (VD: `VENUE_APPROVED`, `USER_SUSPENDED`) |
| `resourceType` | String | ✓ | Loại đối tượng bị tác động (VD: `Venue`, `User`) |
| `resourceId` | String? | | ID đối tượng bị tác động |
| `beforeJson` | Json? | | Trạng thái trước khi thay đổi |
| `afterJson` | Json? | | Trạng thái sau khi thay đổi |
| `ip` | String? | | Địa chỉ IP thực hiện hành động |
| `userAgent` | String? | | Thông tin trình duyệt/app |
| `createdAt` | DateTime | ✓ | Thời điểm xảy ra hành động |

---

## SystemSetting

Cài đặt toàn hệ thống có thể thay đổi runtime mà không cần deploy lại.

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `key` | String | ✓ | Khóa cài đặt (VD: `platform_commission_percent`), là khóa chính |
| `value` | Json | ✓ | Giá trị cài đặt (JSON để hỗ trợ mọi kiểu dữ liệu) |
| `updatedAt` | DateTime | ✓ | Thời điểm cập nhật gần nhất |
| `updatedBy` | String? | | ID admin cập nhật |

---

## FeatureFlag

Bật/tắt tính năng trong hệ thống mà không cần deploy lại (feature toggle).

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `key` | String | ✓ | Tên cờ tính năng (VD: `enable_momo_payment`), là khóa chính |
| `enabled` | Boolean | ✓ | Tính năng có đang bật không, mặc định `false` |
| `description` | String? | | Mô tả tính năng này làm gì |
| `updatedAt` | DateTime | ✓ | Thời điểm cập nhật gần nhất |
| `updatedBy` | String? | | ID admin cập nhật |
