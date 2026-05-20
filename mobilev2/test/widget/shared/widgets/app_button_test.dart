import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/shared/widgets/base/app_button.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../../helpers/pump_app.dart';

void main() {
  group('AppButton', () {
    testWidgets('shows label', (tester) async {
      await pumpApp(
        tester,
        const AppButton(label: 'Tap me', onPressed: null),
      );
      expect(find.text('Tap me'), findsOneWidget);
    });

    testWidgets('fires onPressed', (tester) async {
      var taps = 0;
      await pumpApp(
        tester,
        AppButton(label: 'Tap', onPressed: () => taps++),
      );
      await tester.tap(find.text('Tap'));
      expect(taps, 1);
    });

    testWidgets('shows spinner when isLoading', (tester) async {
      await pumpApp(
        tester,
        const AppButton(
          label: 'Loading',
          onPressed: null,
          isLoading: true,
        ),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });
}
