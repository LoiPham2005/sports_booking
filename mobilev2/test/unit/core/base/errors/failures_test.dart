import 'package:sports_booking_mobile/core/base/errors/failures.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Failure', () {
    test('NetworkFailure has default message', () {
      const f = NetworkFailure();
      expect(f.message, 'Không có kết nối mạng');
    });

    test('UnauthorizedFailure has code 401', () {
      const f = UnauthorizedFailure();
      expect(f.code, 401);
    });

    test('ServerFailure equates with same code+message', () {
      const a = ServerFailure('boom', code: 500);
      const b = ServerFailure('boom', code: 500);
      expect(a, equals(b));
    });

    test('ValidationFailure carries errors map', () {
      const f = ValidationFailure(
        'invalid',
        errors: {
          'email': ['required'],
        },
      );
      expect(f.errors['email'], ['required']);
    });
  });
}
