import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/features/{{name.snakeCase()}}/data/models/{{name.snakeCase()}}_model.dart';
import 'package:sports_booking_mobile/features/{{name.snakeCase()}}/data/services/{{name.snakeCase()}}_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part '{{name.snakeCase()}}_notifier.g.dart';

/// 🔔 Riverpod notifier cho list {{name.titleCase()}}.
///
/// Pattern: list + search + pagination + refresh.
@riverpod
class {{name.pascalCase()}}Notifier extends _${{name.pascalCase()}}Notifier
    with BaseNotifier<List<{{name.pascalCase()}}Model>> {
  late {{name.pascalCase()}}Service _service;
  String _query = '';
  int _page = 1;
  bool _hasMore = true;

  bool get hasMore => _hasMore;

  @override
  Future<List<{{name.pascalCase()}}Model>> build() async {
    _service = {{name.pascalCase()}}Service(ref.read(dioProvider));
    return _fetchPage(reset: true);
  }

  /// Refresh — kéo dữ liệu trang 1, giữ data cũ trong lúc loading.
  Future<void> refresh() => runAsync(
        action: () => _fetchPage(reset: true),
        keepPreviousOnLoading: true,
        cancelPrevious: true,
        emitEmptyForEmptyList: true,
      );

  /// Tìm kiếm (debounce ở UI layer).
  Future<void> search(String q) => runAsync(
        action: () {
          _query = q;
          return _fetchPage(reset: true);
        },
        cancelPrevious: true,
        keepPreviousOnLoading: true,
      );

  /// Load thêm trang tiếp theo (gọi từ ScrollController).
  Future<void> loadMore() async {
    if (!_hasMore) return;
    await runPagination(
      action: () => _service.getList(page: _page, query: _query.isEmpty ? null : _query),
      mapper: (page) {
        _hasMore = page.hasMore;
        _page++;
        final current = state.value ?? [];
        return [...current, ...page.items];
      },
    );
  }

  Future<List<{{name.pascalCase()}}Model>> _fetchPage({bool reset = false}) async {
    if (reset) {
      _page = 1;
      _hasMore = true;
    }
    final response = await _service.getList(
      page: _page,
      query: _query.isEmpty ? null : _query,
    );
    if (!response.isSuccess || response.data == null) {
      throw Exception(response.message ?? 'Failed to load {{name.snakeCase()}} list');
    }
    final page = response.data!;
    _hasMore = page.hasMore;
    if (!reset) _page++;
    return page.items;
  }
}
