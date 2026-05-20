import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../shared/routing/route_paths.dart';
import '../../../shared/routing/safe_pop.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/widgets/venue_card.dart';
import '../favorites/presentation/providers/favorites_notifier.dart';

class FavoritesPage extends ConsumerWidget {
  const FavoritesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncFavs = ref.watch(favoritesProvider);
    final notifier = ref.read(favoritesProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Sân yêu thích'),
      ),
      body: asyncFavs.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('Lỗi: $e',
                style: const TextStyle(color: AppColors.danger)),
          ),
        ),
        data: (favs) {
          if (favs.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'Chưa có sân yêu thích.\nNhấn trái tim ở venue để thêm.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textSecondary),
                ),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(20),
            itemCount: favs.length,
            separatorBuilder: (_, __) => const SizedBox(height: 14),
            itemBuilder: (_, i) => Dismissible(
              key: ValueKey(favs[i].id),
              direction: DismissDirection.endToStart,
              background: Container(
                alignment: Alignment.centerRight,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.delete_outline,
                    color: Color(0xFFDC2626)),
              ),
              onDismissed: (_) => notifier.toggle(favs[i].id),
              child: VenueCard(
                venue: favs[i],
                onTap: () =>
                    context.push(RoutePaths.venueDetail(favs[i].id)),
              ),
            ),
          );
        },
      ),
    );
  }
}
