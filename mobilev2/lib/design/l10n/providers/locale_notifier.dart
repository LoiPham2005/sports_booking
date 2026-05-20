import 'dart:ui';

import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/core/common/constants/app_constants.dart';
import 'package:sports_booking_mobile/core/data/storage/local_storage_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'locale_notifier.g.dart';

@Riverpod(keepAlive: true)
class LocaleNotifier extends _$LocaleNotifier {
  static const _key = 'app_locale';

  @override
  Locale build() {
    final storage = getIt<LocalStorageService>();
    final raw = storage.getString(_key);
    if (raw != null && raw.isNotEmpty) return Locale(raw);
    return const Locale(AppConstants.defaultLocale);
  }

  Future<void> set(Locale locale) async {
    state = locale;
    final storage = getIt<LocalStorageService>();
    await storage.setString(_key, locale.languageCode);
  }
}
