import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/routes/config/route_names.dart';
import 'package:go_router/go_router.dart';

class NotFoundPage extends StatelessWidget {
  const NotFoundPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('404')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 64),
            const SizedBox(height: 12),
            const Text('Trang không tồn tại'),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => context.go(RouteNames.main),
              child: const Text('Về trang chủ'),
            ),
          ],
        ),
      ),
    );
  }
}
