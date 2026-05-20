import 'package:flutter/widgets.dart';
import 'package:sports_booking_mobile/gen/l10n/app_localizations.dart';

extension L10nX on BuildContext {
  /// Shortcut: `context.l10n.welcome` thay vì `AppLocalizations.of(context)!.welcome`.
  AppLocalizations get l10n => AppLocalizations.of(this);
}
