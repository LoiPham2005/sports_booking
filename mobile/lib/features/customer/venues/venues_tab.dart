import 'package:flutter/material.dart';
import '../../../shared/routing/route_paths.dart';
import 'venues_page.dart';
import 'package:go_router/go_router.dart';

class VenuesTab extends StatelessWidget {
  const VenuesTab({super.key});

  @override
  Widget build(BuildContext context) {
    // Khi tab dùng trong shell, ta render trực tiếp danh sách search.
    return const VenuesPage(isTab: true);
  }
}

// Helper to push the venues page when used outside shell.
extension VenuesNavigation on BuildContext {
  void pushVenues() => push(RoutePaths.venues);
}
