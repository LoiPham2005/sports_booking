import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/core/common/extensions/datetime_extensions.dart';
import 'package:sports_booking_mobile/features/_reference/character/presentation/providers/character_notifier.dart';
import 'package:sports_booking_mobile/shared/widgets/base/app_scaffold.dart';
import 'package:sports_booking_mobile/shared/widgets/states/error_widget.dart';
import 'package:sports_booking_mobile/shared/widgets/states/loading_widget.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// Detail page — minh hoạ family provider với `id`.
class CharacterDetailPage extends ConsumerWidget {
  const CharacterDetailPage({super.key, required this.id});

  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(characterDetailProvider(id));

    return AppScaffold(
      appBar: AppBar(title: const Text('Character Detail')),
      body: state.when(
        loading: () => const LoadingWidget(),
        error: (e, _) => ErrorRetry(
          message: e.toString(),
          onRetry: () => ref.invalidate(characterDetailProvider(id)),
        ),
        data: (c) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (c.image.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(
                  c.image,
                  height: 240,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const SizedBox(
                    height: 240,
                    child: Center(child: Icon(Icons.person, size: 80)),
                  ),
                ),
              ),
            const SizedBox(height: 16),
            Text(c.name, style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            _Row(label: 'Status', value: c.status),
            _Row(label: 'Species', value: c.species),
            _Row(label: 'Type', value: c.type.isEmpty ? '—' : c.type),
            _Row(label: 'Gender', value: c.gender),
            if (c.created != null)
              _Row(label: 'Created', value: c.created!.format()),
          ],
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
