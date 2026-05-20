import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/core/base/riverpod/riverpod_listeners.dart';
import 'package:sports_booking_mobile/features/_reference/voucher/data/models/voucher_model.dart';
import 'package:sports_booking_mobile/features/_reference/voucher/presentation/providers/voucher_notifier.dart';
import 'package:sports_booking_mobile/shared/widgets/base/app_scaffold.dart';
import 'package:sports_booking_mobile/shared/widgets/base/app_text_field.dart';
import 'package:sports_booking_mobile/shared/widgets/states/empty_widget.dart';
import 'package:sports_booking_mobile/shared/widgets/states/error_widget.dart';
import 'package:sports_booking_mobile/shared/widgets/states/loading_widget.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// Reference page — pattern chuẩn để follow theo
class VoucherListPage extends HookConsumerWidget {
  const VoucherListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchCtl = useTextEditingController();
    final state = ref.watch(voucherProvider);
    final notifier = ref.read(voucherProvider.notifier);

    useAsyncValueChange(state);

    return AppScaffold(
      appBar: AppBar(title: const Text('Voucher')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: AppTextField(
              controller: searchCtl,
              hint: 'Tìm kiếm voucher...',
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

  Widget _buildBody(AsyncValue<List<VoucherModel>> state, VoucherNotifier n) {
    return switch (state) {
      AsyncValue(:final value?, isLoading: true) =>
        Stack(children: [_VoucherList(value), const LinearProgressIndicator()]),
      AsyncData(value: final list) when list.isEmpty =>
        const EmptyWidget(message: 'Không có voucher nào'),
      AsyncData(:final value) => _VoucherList(value),
      AsyncError(:final error) => ErrorRetry(
          message: error.toString(),
          onRetry: n.refresh,
        ),
      _ => const LoadingWidget(),
    };
  }
}

class _VoucherList extends StatelessWidget {
  const _VoucherList(this.items);
  final List<VoucherModel> items;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (_, i) {
        final v = items[i];
        return Card(
          child: ListTile(
            title: Text(v.title),
            subtitle: v.description == null ? null : Text(v.description!),
            trailing: Text('${v.discountPercent}%'),
          ),
        );
      },
    );
  }
}
