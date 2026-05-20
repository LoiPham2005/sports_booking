// ════════════════════════════════════════════════════════════════
// Functional list operations — distinct, group, aggregate, chunk.
//
// Skip widget-builder helpers từ v1 (`toColumn`, `toRow`, `withSpacing`) —
// dùng `Column(children: [...])` thẳng dễ đọc hơn và giữ const.
// ════════════════════════════════════════════════════════════════

extension ListX<T> on List<T> {
  /// Lọc các phần tử duy nhất theo key custom.
  /// ```dart
  /// users.distinctBy((u) => u.id)
  /// ```
  List<T> distinctBy<K>(K Function(T item) keyOf) {
    final seen = <K>{};
    return where((item) => seen.add(keyOf(item))).toList();
  }

  /// Group thành Map theo key custom.
  /// ```dart
  /// orders.groupBy((o) => o.status)
  /// // → {'paid': [...], 'pending': [...]}
  /// ```
  Map<K, List<T>> groupBy<K>(K Function(T item) keyOf) {
    final result = <K, List<T>>{};
    for (final item in this) {
      result.putIfAbsent(keyOf(item), () => []).add(item);
    }
    return result;
  }

  /// Tìm phần tử có giá trị metric lớn nhất. List rỗng → null.
  T? maxBy<R extends Comparable<R>>(R Function(T item) metric) {
    if (isEmpty) return null;
    var best = first;
    var bestVal = metric(best);
    for (final item in skip(1)) {
      final val = metric(item);
      if (val.compareTo(bestVal) > 0) {
        best = item;
        bestVal = val;
      }
    }
    return best;
  }

  /// Tìm phần tử có giá trị metric nhỏ nhất.
  T? minBy<R extends Comparable<R>>(R Function(T item) metric) {
    if (isEmpty) return null;
    var best = first;
    var bestVal = metric(best);
    for (final item in skip(1)) {
      final val = metric(item);
      if (val.compareTo(bestVal) < 0) {
        best = item;
        bestVal = val;
      }
    }
    return best;
  }

  /// Chia list thành nhiều list nhỏ kích thước [size].
  /// ```dart
  /// [1,2,3,4,5].chunk(2) → [[1,2], [3,4], [5]]
  /// ```
  List<List<T>> chunk(int size) {
    assert(size > 0, 'chunk size must be > 0');
    final result = <List<T>>[];
    for (var i = 0; i < length; i += size) {
      result.add(sublist(i, i + size > length ? length : i + size));
    }
    return result;
  }
}

extension NumericListX on List<num> {
  /// Tổng các phần tử. List rỗng → 0.
  num get sum {
    var s = 0.0;
    for (final n in this) {
      s += n;
    }
    return s;
  }

  /// Trung bình cộng. List rỗng → 0.
  double get average => isEmpty ? 0 : sum / length;
}
