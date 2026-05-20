import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/core/base/riverpod/riverpod_listeners.dart';
import 'package:sports_booking_mobile/features/{{name.snakeCase()}}/data/models/{{name.snakeCase()}}_model.dart';
import 'package:sports_booking_mobile/features/{{name.snakeCase()}}/presentation/providers/{{name.snakeCase()}}_notifier.dart';
import 'package:sports_booking_mobile/shared/widgets/base/app_scaffold.dart';
import 'package:sports_booking_mobile/shared/widgets/base/app_text_field.dart';
import 'package:sports_booking_mobile/shared/widgets/states/empty_widget.dart';
import 'package:sports_booking_mobile/shared/widgets/states/error_widget.dart';
import 'package:sports_booking_mobile/shared/widgets/states/loading_widget.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

class {{name.pascalCase()}}ListPage extends HookConsumerWidget {
  const {{name.pascalCase()}}ListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchCtl = useTextEditingController();
    final state = ref.watch({{name.camelCase()}}Provider);
    final notifier = ref.read({{name.camelCase()}}Provider.notifier);

    useAsyncValueChange(state);

    return AppScaffold(
      appBar: AppBar(title: const Text('{{name.titleCase()}}')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: AppTextField(
              controller: searchCtl,
              hint: 'Tìm kiếm {{name.titleCase()}}...',
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
    AsyncValue<List<{{name.pascalCase()}}Model>> state,
    {{name.pascalCase()}}Notifier notifier,
  ) {
    return switch (state) {
      AsyncValue(:final value?, isLoading: true) => Stack(
          children: [_buildList(value, notifier), const LinearProgressIndicator()],
        ),
      AsyncData(value: final list) when list.isEmpty => const EmptyWidget(),
      AsyncData(:final value) => _buildList(value, notifier),
      AsyncError() => ErrorRetry(onRetry: notifier.refresh),
      _ => const LoadingWidget(),
    };
  }

  Widget _buildList(
    List<{{name.pascalCase()}}Model> items,
    {{name.pascalCase()}}Notifier notifier,
  ) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: items.length + (notifier.hasMore ? 1 : 0),
      separatorBuilder: (_, _) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        if (index >= items.length) {
          notifier.loadMore();
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        return _buildItem(items[index]);
      },
    );
  }

  Widget _buildItem({{name.pascalCase()}}Model item) {
    return Card(
      child: ListTile(
        leading: item.imageUrl != null
            ? CircleAvatar(backgroundImage: NetworkImage(item.imageUrl!))
            : const CircleAvatar(child: Icon(Icons.inventory_2)),
        title: Text(item.name),
        subtitle: item.description != null ? Text(item.description!) : null,
        // TODO: navigate vào detail page
        // onTap: () => context.go('/{{name.snakeCase()}}/${item.id}'),
      ),
    );
  }
}
