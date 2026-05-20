import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/core/base/riverpod/riverpod_listeners.dart';
import 'package:sports_booking_mobile/features/_reference/character/data/models/character_model.dart';
import 'package:sports_booking_mobile/features/_reference/character/presentation/providers/character_notifier.dart';
import 'package:sports_booking_mobile/shared/widgets/base/app_scaffold.dart';
import 'package:sports_booking_mobile/shared/widgets/base/app_text_field.dart';
import 'package:sports_booking_mobile/shared/widgets/states/empty_widget.dart';
import 'package:sports_booking_mobile/shared/widgets/states/error_widget.dart';
import 'package:sports_booking_mobile/shared/widgets/states/loading_widget.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// Reference GraphQL list page — pattern chuẩn để follow theo.
class CharacterListPage extends HookConsumerWidget {
  const CharacterListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchCtl = useTextEditingController();
    final state = ref.watch(characterProvider);
    final notifier = ref.read(characterProvider.notifier);

    useAsyncValueChange(state);

    return AppScaffold(
      appBar: AppBar(title: const Text('Characters (GraphQL)')),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: Theme.of(context).colorScheme.primaryContainer.withValues(
                  alpha: 0.4,
                ),
            child: const Text(
              '🛰  graphql_codegen — types sinh từ schema.graphql\n'
              '✓ Variables typed (Variables\$Query\$GetCharacters)\n'
              '✓ Schema đổi → compile error',
              style: TextStyle(fontSize: 12),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: AppTextField(
              controller: searchCtl,
              hint: 'Tìm character...',
              prefixIcon: const Icon(Icons.search),
              onChanged: notifier.search,
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: notifier.refresh,
              child: _buildBody(state, notifier),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(
    AsyncValue<List<CharacterModel>> state,
    CharacterNotifier n,
  ) {
    return switch (state) {
      AsyncValue(:final value?, isLoading: true) =>
        Stack(children: [_List(value), const LinearProgressIndicator()]),
      AsyncData(value: final list) when list.isEmpty =>
        const EmptyWidget(message: 'Không có character nào'),
      AsyncData(:final value) => _List(value),
      AsyncError(:final error) => ErrorRetry(
          message: error.toString(),
          onRetry: n.refresh,
        ),
      _ => const LoadingWidget(),
    };
  }
}

class _List extends StatelessWidget {
  const _List(this.items);
  final List<CharacterModel> items;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (_, i) => _Card(item: items[i]),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.item});
  final CharacterModel item;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: ListTile(
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            item.image,
            width: 48,
            height: 48,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => const Icon(Icons.person, size: 40),
          ),
        ),
        title: Text(
          item.name,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          '${item.species} · ${item.gender}',
          style: const TextStyle(fontSize: 12),
        ),
        trailing: _StatusChip(status: item.status),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status.toLowerCase()) {
      'alive' => Colors.green,
      'dead' => Colors.red,
      _ => Colors.grey,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        status.isEmpty ? '—' : status,
        style: TextStyle(
          fontSize: 10,
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
