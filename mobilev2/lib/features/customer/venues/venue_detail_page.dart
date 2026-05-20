import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../shared/mock/mock_data.dart';
import '../../../shared/routing/safe_pop.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/utils/format.dart';
import 'booking_matrix.dart';
import 'presentation/providers/venue_detail_notifier.dart';

class VenueDetailPage extends ConsumerWidget {
  final String id;
  const VenueDetailPage({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncDetail = ref.watch(venueDetailProvider(id));

    return asyncDetail.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(leading: BackButton(onPressed: () => safePop(context))),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('Lỗi: $e',
                style: const TextStyle(color: AppColors.danger)),
          ),
        ),
      ),
      data: (detail) => _buildContent(context, detail),
    );
  }

  Widget _buildContent(BuildContext context, VenueDetail detail) {
    final venue = detail.venue;
    final sportNames = venue.sports.map((s) {
      return MockData.sports
          .firstWhere(
            (sp) => sp.slug == s,
            orElse: () => Sport(slug: s, name: s, icon: '🏟️', count: 0),
          )
          .name;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Scrollable content
          ListView(
            padding: EdgeInsets.zero,
            children: [
              // Hero image
              SizedBox(
                height: 280,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    CachedNetworkImage(
                      imageUrl: venue.image,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: AppColors.surfaceAlt),
                      errorWidget: (_, __, ___) => Container(
                        color: AppColors.surfaceAlt,
                        alignment: Alignment.center,
                        child: const Icon(Icons.image_outlined,
                            size: 48, color: AppColors.textMuted),
                      ),
                    ),
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Color(0x55000000), Colors.transparent],
                          stops: [0, 0.3],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Title block
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(venue.name,
                        style: const TextStyle(
                            fontSize: 22, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.star_rounded,
                            size: 16, color: Color(0xFFFBBF24)),
                        const SizedBox(width: 2),
                        Text('${venue.rating}',
                            style: const TextStyle(fontWeight: FontWeight.w700)),
                        Text(' (${venue.reviewCount} đánh giá)',
                            style: const TextStyle(
                                color: AppColors.textSecondary)),
                        const SizedBox(width: 8),
                        const Text('·',
                            style: TextStyle(color: AppColors.textMuted)),
                        const SizedBox(width: 8),
                        const Icon(Icons.location_on_outlined,
                            size: 14, color: AppColors.textSecondary),
                        const SizedBox(width: 2),
                        Expanded(
                          child: Text(
                            '${venue.district}, ${venue.city}',
                            style: const TextStyle(
                                color: AppColors.textSecondary, fontSize: 13),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: sportNames
                          .map((s) => Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.primary
                                      .withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  s,
                                  style: const TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12,
                                  ),
                                ),
                              ))
                          .toList(),
                    ),
                  ],
                ),
              ),

              const Divider(height: 24, thickness: 8, color: AppColors.surface),

              // Description
              const _SectionTitle('Giới thiệu'),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                child: Text(
                  venue.description,
                  style: const TextStyle(
                      color: AppColors.textSecondary, height: 1.6),
                ),
              ),

              const Divider(height: 24, thickness: 8, color: AppColors.surface),

              // Courts & prices
              const _SectionTitle('Sân & Giá'),
              ...MockData.courts.map((c) => Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(c.name,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 15)),
                                const SizedBox(height: 4),
                                Text(
                                  '${c.surface} · ${c.indoor ? "Trong nhà" : "Ngoài trời"} · ${c.capacity} người',
                                  style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                formatVND(c.pricePerHour),
                                style: const TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14),
                              ),
                              const Text('mỗi giờ',
                                  style: TextStyle(
                                      color: AppColors.textMuted, fontSize: 11)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  )),

              const SizedBox(height: 8),
              const Divider(height: 24, thickness: 8, color: AppColors.surface),

              // Amenities
              const _SectionTitle('Tiện ích'),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: venue.amenities.map((slug) {
                    final a = MockData.amenities[slug];
                    return Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(a?.$2 ?? '✨',
                              style: const TextStyle(fontSize: 16)),
                          const SizedBox(width: 6),
                          Text(a?.$1 ?? slug,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w500, fontSize: 12)),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),

              const Divider(height: 24, thickness: 8, color: AppColors.surface),

              // Rating summary
              const _SectionTitle('Đánh giá'),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Column(
                        children: [
                          Text('${venue.rating}',
                              style: const TextStyle(
                                  fontSize: 36, fontWeight: FontWeight.w800)),
                          const Text('⭐⭐⭐⭐⭐'),
                          Text('${venue.reviewCount} đánh giá',
                              style: const TextStyle(
                                  color: AppColors.textMuted, fontSize: 11)),
                        ],
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          children: [
                            for (final r in [
                              (5, 70),
                              (4, 20),
                              (3, 6),
                              (2, 2),
                              (1, 2)
                            ])
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 2),
                                child: Row(
                                  children: [
                                    Text('${r.$1}'),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.star_rounded,
                                        size: 12, color: Color(0xFFFBBF24)),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(20),
                                        child: LinearProgressIndicator(
                                          value: r.$2 / 100,
                                          minHeight: 6,
                                          backgroundColor: AppColors.border,
                                          valueColor:
                                              const AlwaysStoppedAnimation(
                                                  Color(0xFFFBBF24)),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              for (final r in const [
                (
                  'Minh Trần',
                  5,
                  '2 ngày trước',
                  'Sân chất lượng, mặt sân êm. Nhân viên nhiệt tình.'
                ),
                (
                  'Hà Nguyễn',
                  5,
                  '1 tuần trước',
                  'Vị trí thuận tiện, bãi gửi xe rộng.'
                ),
                (
                  'Đức Phạm',
                  4,
                  '2 tuần trước',
                  'Sân ổn, giá hợp lý. Buổi tối hơi đông cần đặt sớm.'
                ),
              ])
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              backgroundColor:
                                  AppColors.primary.withValues(alpha: 0.15),
                              child: Text(r.$1[0],
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700)),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(r.$1,
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14)),
                                  Text(
                                    '${'⭐' * r.$2} · ${r.$3}',
                                    style: const TextStyle(
                                        color: AppColors.textMuted,
                                        fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(r.$4, style: const TextStyle(height: 1.5)),
                      ],
                    ),
                  ),
                ),

              const Divider(height: 24, thickness: 8, color: AppColors.surface),

              // Location
              const _SectionTitle('Vị trí'),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
                child: Container(
                  height: 180,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceAlt,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  alignment: Alignment.center,
                  child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.location_on,
                          size: 40, color: AppColors.primary),
                      SizedBox(height: 6),
                      Text('Bản đồ địa điểm',
                          style: TextStyle(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
                child: Text(
                  '${venue.address}, ${venue.district}, ${venue.city}',
                  style: const TextStyle(
                      color: AppColors.textSecondary, height: 1.5),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.directions),
                        label: const Text('Chỉ đường'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.phone),
                        label: const Text('Gọi sân'),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),

          // Floating back button over hero image
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            left: 8,
            child: _RoundIconBtn(
              icon: Icons.arrow_back,
              onTap: () => safePop(context),
            ),
          ),
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            right: 8,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _RoundIconBtn(icon: Icons.share_outlined, onTap: () {}),
                const SizedBox(width: 4),
                _RoundIconBtn(icon: Icons.favorite_outline, onTap: () {}),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _BottomBar(
        priceFrom: venue.priceFrom,
        onBook: () => _openBookingSheet(context, venue),
      ),
    );
  }

  void _openBookingSheet(BuildContext context, Venue venue) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.95,
        maxChildSize: 0.97,
        minChildSize: 0.5,
        builder: (_, scrollCtrl) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 10),
              Container(
                height: 4,
                width: 40,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollCtrl,
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
                  child: BookingMatrix(venue: venue),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 10),
      child: Text(title,
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
    );
  }
}

class _RoundIconBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _RoundIconBtn({required this.icon, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withValues(alpha: 0.92),
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      elevation: 1,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          height: 40,
          width: 40,
          child: Icon(icon, size: 20, color: AppColors.textPrimary),
        ),
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  final int priceFrom;
  final VoidCallback onBook;
  const _BottomBar({required this.priceFrom, required this.onBook});
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      padding: EdgeInsets.fromLTRB(
        20,
        12,
        20,
        12 + MediaQuery.of(context).padding.bottom,
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Từ',
                  style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
              Text(
                '${formatVND(priceFrom)}/h',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: FilledButton(
              onPressed: onBook,
              child: const Text('Đặt sân ngay'),
            ),
          ),
        ],
      ),
    );
  }
}
