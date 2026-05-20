// ════════════════════════════════════════════════════════════════
// 📁 lib/core/services/quick_actions/quick_actions_service.dart
// ════════════════════════════════════════════════════════════════
//
// Wrapper cho `quick_actions` plugin — quản lý App Shortcuts (long-press
// app icon trên home screen).
//
// ── PATTERN GENERIC ──────────────────────────────────────────────
//   v1 hardcode routes + auth state — v2 hoàn toàn generic:
//   - Service không biết về routes / auth → caller tự define
//   - Defer + retry pattern xử lý cold-start race condition
//
// ── SETUP ────────────────────────────────────────────────────────
//   Trong AppInitializer (sau khi router & DI ready):
//
//     final qa = getIt<QuickActionsService>();
//     await qa.initialize(
//       onAction: (type) {
//         switch (type) {
//           case 'search':  appContext.go('/search');
//           case 'logout':  ref.read(appAuthProvider.notifier).logout();
//         }
//       },
//     );
//     await qa.setActions([
//       const QuickActionItem(type: 'search', label: 'Tìm kiếm', icon: 'ic_search'),
//       const QuickActionItem(type: 'logout', label: 'Đăng xuất', icon: 'ic_logout'),
//     ]);
//
// ── ICON ASSETS ──────────────────────────────────────────────────
//   Android: `android/app/src/main/res/drawable/ic_<name>.xml` (vector) or PNG
//   iOS: `ios/Runner/Assets.xcassets/<name>.imageset/` (PNG 35pt = 35/70/105 px)
//
// Tên icon trong `QuickActionItem.icon` KHÔNG chứa extension / prefix.

import 'dart:async';

import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:injectable/injectable.dart';
import 'package:quick_actions/quick_actions.dart';

/// Định nghĩa 1 shortcut.
class QuickActionItem {
  const QuickActionItem({
    required this.type,
    required this.label,
    required this.icon,
  });

  /// ID nội bộ — caller dùng để switch trong `onAction`.
  final String type;

  /// Label hiển thị (đa ngôn ngữ → caller tự truyền).
  final String label;

  /// Tên icon (không extension):
  /// - Android: `res/drawable/<icon>.xml` hoặc `.png`
  /// - iOS: `Assets.xcassets/<icon>.imageset/`
  final String icon;

  ShortcutItem toShortcut() =>
      ShortcutItem(type: type, localizedTitle: label, icon: icon);
}

@LazySingleton()
class QuickActionsService {
  static const _tag = 'QUICK-ACTIONS';
  static const _maxRetryAttempts = 10;
  static const _retryInterval = Duration(milliseconds: 300);

  final QuickActions _quickActions = const QuickActions();

  /// Caller-provided handler.
  void Function(String type)? _onAction;

  /// Action arrived TRƯỚC khi `_onAction` set (cold start) → defer xử lý.
  String? _pendingAction;

  /// 🚀 Setup listener + đăng ký handler.
  /// Gọi 1 lần ở AppInitializer.
  Future<void> initialize({
    required void Function(String type) onAction,
  }) async {
    _onAction = onAction;
    await _quickActions.initialize((type) {
      Logger.info('Quick action triggered: $type', tag: _tag);
      _onAction?.call(type);
    });

    // Có thể có action đã arrived trước (cold start) — chạy ngay.
    final pending = _pendingAction;
    if (pending != null) {
      _pendingAction = null;
      onAction(pending);
    }
  }

  /// 📝 Đặt danh sách shortcuts. Gọi lại bất kỳ lúc nào (vd. khi login state đổi).
  Future<void> setActions(List<QuickActionItem> items) async {
    try {
      await _quickActions.setShortcutItems(
        items.map((e) => e.toShortcut()).toList(),
      );
      Logger.info('Set ${items.length} actions', tag: _tag);
    } catch (e, s) {
      Logger.error('setActions failed', error: e, stackTrace: s, tag: _tag);
    }
  }

  /// 🧹 Xoá toàn bộ shortcuts.
  Future<void> clear() async {
    try {
      await _quickActions.clearShortcutItems();
      Logger.info('Cleared all actions', tag: _tag);
    } catch (e, s) {
      Logger.error('clear failed', error: e, stackTrace: s, tag: _tag);
    }
  }

  /// 🔄 Defer-retry pattern — caller gọi sau khi router build xong.
  /// Nếu listener chưa kịp nhận action (cold start race), retry tối đa
  /// `_maxRetryAttempts` lần x `_retryInterval`.
  ///
  /// Thường gọi trong `MaterialApp.builder` callback hoặc `Splash` page sau
  /// khi router ready.
  Future<void> handlePendingActionWithRetry() async {
    for (var i = 0; i < _maxRetryAttempts; i++) {
      if (_pendingAction == null) return;
      await Future<void>.delayed(_retryInterval);
      final pending = _pendingAction;
      if (pending != null && _onAction != null) {
        _pendingAction = null;
        _onAction!(pending);
        return;
      }
    }
  }
}
