import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../mock/mock_data.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';

class VenueCard extends StatelessWidget {
  final Venue venue;
  final VoidCallback? onTap;
  const VenueCard({super.key, required this.venue, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          color: theme.cardTheme.color,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 10,
                  child: CachedNetworkImage(
                    imageUrl: venue.image,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(color: AppColors.surfaceAlt),
                    errorWidget: (_, __, ___) =>
                        Container(color: AppColors.surfaceAlt, child: const Icon(Icons.image_outlined)),
                  ),
                ),
                Positioned(
                  top: 10,
                  left: 10,
                  child: Wrap(
                    spacing: 4,
                    children: venue.sports.take(2).map((s) {
                      final sp = MockData.sports.firstWhere((sp) => sp.slug == s);
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          sp.name,
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    height: 32,
                    width: 32,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.95),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.favorite_outline, size: 18),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          venue.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.titleMedium?.copyWith(fontSize: 15),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.star_rounded, size: 16, color: Color(0xFFFBBF24)),
                      const SizedBox(width: 2),
                      Text(
                        '${venue.rating}',
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                      Text(
                        ' (${venue.reviewCount})',
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          '${venue.district} · ${venue.distance} km',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        formatVND(venue.priceFrom),
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                      const Text(
                        ' /giờ',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class VenueCardCompact extends StatelessWidget {
  final Venue venue;
  final VoidCallback? onTap;
  const VenueCardCompact({super.key, required this.venue, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: SizedBox(
        width: 240,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: AspectRatio(
                aspectRatio: 16 / 10,
                child: CachedNetworkImage(
                  imageUrl: venue.image,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(color: AppColors.surfaceAlt),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              venue.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                const Icon(Icons.star_rounded, size: 14, color: Color(0xFFFBBF24)),
                const SizedBox(width: 2),
                Text('${venue.rating}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(width: 6),
                const Icon(Icons.location_on_outlined, size: 12, color: AppColors.textMuted),
                const SizedBox(width: 2),
                Expanded(
                  child: Text(
                    '${venue.distance} km',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Text.rich(
              TextSpan(children: [
                TextSpan(
                  text: formatVND(venue.priceFrom),
                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 14),
                ),
                const TextSpan(text: ' /giờ', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}
