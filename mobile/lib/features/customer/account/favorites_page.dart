import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/mock/mock_data.dart';
import '../../../shared/routing/route_paths.dart';
import '../../../shared/widgets/venue_card.dart';

class FavoritesPage extends StatelessWidget {
  const FavoritesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final favs = MockData.venues.take(4).toList();
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Sân yêu thích'),
      ),
      body: ListView.separated(
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
            child: const Icon(Icons.delete_outline, color: Color(0xFFDC2626)),
          ),
          onDismissed: (_) {},
          child: VenueCard(
            venue: favs[i],
            onTap: () => context.push(RoutePaths.venueDetail(favs[i].id)),
          ),
        ),
      ),
    );
  }
}
