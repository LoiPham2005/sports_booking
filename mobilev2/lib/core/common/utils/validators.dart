// ════════════════════════════════════════════════════════════════
// 📁 lib/core/utils/validators.dart (ENHANCED VERSION)
// ════════════════════════════════════════════════════════════════

class Validators {
  Validators._();

  // ═══════════════════════════════════════════════════════════════
  // BASIC VALIDATORS
  // ═══════════════════════════════════════════════════════════════

  /// Required field validator
  static String? required(String? value, {String? fieldName}) {
    if (value == null || value.trim().isEmpty) {
      return '${fieldName ?? "Trường này"} không được để trống';
    }
    return null;
  }

  /// Email validator
  static String? email(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email không được để trống';
    }

    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );

    if (!emailRegex.hasMatch(value)) {
      return 'Email không hợp lệ';
    }

    return null;
  }

  /// Username validator
  static String? username(String? value) {
    if (value == null || value.isEmpty) {
      return 'Tên người dùng không được để trống';
    }

    if (value.length < 3) {
      return 'Tên người dùng phải có ít nhất 3 ký tự';
    }

    if (value.length > 20) {
      return 'Tên người dùng không được quá 20 ký tự';
    }

    final usernameRegex = RegExp(r'^[a-zA-Z0-9_]+$');
    if (!usernameRegex.hasMatch(value)) {
      return 'Tên người dùng chỉ được chứa chữ, số và dấu gạch dưới';
    }

    return null;
  }

  /// Full name validator (Vietnamese)
  static String? name(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Họ tên không được để trống';
    }

    if (value.trim().length < 2) {
      return 'Họ tên quá ngắn';
    }

    // Vietnamese characters support
    final nameRegex = RegExp(r'^[a-zA-ZÀ-ỹ\s]+$', unicode: true);

    if (!nameRegex.hasMatch(value)) {
      return 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // PASSWORD VALIDATORS
  // ═══════════════════════════════════════════════════════════════

  /// Basic password validator
  static String? password(String? value, {int minLength = 6}) {
    if (value == null || value.isEmpty) {
      return 'Mật khẩu không được để trống';
    }

    if (value.length < minLength) {
      return 'Mật khẩu phải có ít nhất $minLength ký tự';
    }

    return null;
  }

  /// Strong password validator
  static String? strongPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Mật khẩu không được để trống';
    }

    if (value.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }

    if (!value.contains(RegExp(r'[a-z]'))) {
      return 'Mật khẩu phải có ít nhất 1 chữ thường';
    }

    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Mật khẩu phải có ít nhất 1 số';
    }

    if (!value.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) {
      return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
    }

    return null;
  }

  /// Password match validator
  static String? confirmPassword(String? value, String? password) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng xác nhận mật khẩu';
    }

    if (value != password) {
      return 'Mật khẩu xác nhận không khớp';
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // PHONE VALIDATORS
  // ═══════════════════════════════════════════════════════════════

  /// Vietnamese phone validator
  static String? phoneVN(String? value) {
    if (value == null || value.isEmpty) {
      return 'Số điện thoại không được để trống';
    }

    // Remove spaces and dashes
    final cleanPhone = value.replaceAll(RegExp(r'[\s-]'), '');

    // Support formats: 0xxxxxxxxx, +84xxxxxxxxx, 84xxxxxxxxx
    final phoneRegex = RegExp(r'^(0|\+?84)[3|5|7|8|9][0-9]{8}$');

    if (!phoneRegex.hasMatch(cleanPhone)) {
      return 'Số điện thoại không hợp lệ';
    }

    return null;
  }

  /// International phone validator
  static String? phoneInternational(String? value) {
    if (value == null || value.isEmpty) {
      return 'Số điện thoại không được để trống';
    }

    final phoneRegex = RegExp(r'^\+?[1-9]\d{1,14}$');

    if (!phoneRegex.hasMatch(value)) {
      return 'Số điện thoại không hợp lệ';
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // LENGTH VALIDATORS
  // ═══════════════════════════════════════════════════════════════

  /// Min length validator
  static String? minLength(String? value, int min, {String? fieldName}) {
    if (value == null || value.isEmpty) {
      return '${fieldName ?? "Trường này"} không được để trống';
    }

    if (value.length < min) {
      return '${fieldName ?? "Trường này"} phải có ít nhất $min ký tự';
    }

    return null;
  }

  /// Max length validator
  static String? maxLength(String? value, int max, {String? fieldName}) {
    if (value != null && value.length > max) {
      return '${fieldName ?? "Trường này"} không được vượt quá $max ký tự';
    }
    return null;
  }

  /// Exact length validator
  static String? exactLength(String? value, int length, {String? fieldName}) {
    if (value == null || value.isEmpty) {
      return '${fieldName ?? "Trường này"} không được để trống';
    }

    if (value.length != length) {
      return '${fieldName ?? "Trường này"} phải có đúng $length ký tự';
    }

    return null;
  }

  /// Length range validator
  static String? lengthRange(
    String? value,
    int min,
    int max, {
    String? fieldName,
  }) {
    if (value == null || value.isEmpty) {
      return '${fieldName ?? "Trường này"} không được để trống';
    }

    if (value.length < min || value.length > max) {
      return '${fieldName ?? "Trường này"} phải có từ $min đến $max ký tự';
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // NUMBER VALIDATORS
  // ═══════════════════════════════════════════════════════════════

  /// Number validator
  static String? number(String? value, {String? fieldName}) {
    if (value == null || value.isEmpty) {
      return '${fieldName ?? "Giá trị"} không được để trống';
    }

    if (double.tryParse(value) == null) {
      return '${fieldName ?? "Giá trị"} phải là số';
    }

    return null;
  }

  /// Integer validator
  static String? integer(String? value, {String? fieldName}) {
    if (value == null || value.isEmpty) {
      return '${fieldName ?? "Giá trị"} không được để trống';
    }

    if (int.tryParse(value) == null) {
      return '${fieldName ?? "Giá trị"} phải là số nguyên';
    }

    return null;
  }

  /// Number range validator
  static String? numberRange(
    String? value, {
    num? min,
    num? max,
    String? fieldName,
  }) {
    if (value == null || value.isEmpty) {
      return '${fieldName ?? "Giá trị"} không được để trống';
    }

    final number = num.tryParse(value);
    if (number == null) {
      return '${fieldName ?? "Giá trị"} phải là số';
    }

    if (min != null && number < min) {
      return '${fieldName ?? "Giá trị"} phải lớn hơn hoặc bằng $min';
    }

    if (max != null && number > max) {
      return '${fieldName ?? "Giá trị"} phải nhỏ hơn hoặc bằng $max';
    }

    return null;
  }

  /// Positive number validator
  static String? positiveNumber(String? value, {String? fieldName}) {
    final error = number(value, fieldName: fieldName);
    if (error != null) return error;

    final num = double.parse(value!);
    if (num <= 0) {
      return '${fieldName ?? "Giá trị"} phải là số dương';
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // SPECIAL VALIDATORS
  // ═══════════════════════════════════════════════════════════════

  /// OTP validator
  static String? otp(String? value, {int length = 6}) {
    if (value == null || value.isEmpty) {
      return 'Mã OTP không được để trống';
    }

    if (!RegExp(r'^[0-9]+$').hasMatch(value)) {
      return 'Mã OTP chỉ được chứa số';
    }

    if (value.length != length) {
      return 'Mã OTP phải gồm $length chữ số';
    }

    return null;
  }

  /// URL validator
  static String? url(String? value) {
    if (value == null || value.isEmpty) {
      return 'URL không được để trống';
    }

    final urlRegex = RegExp(
      r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$',
    );

    if (!urlRegex.hasMatch(value)) {
      return 'URL không hợp lệ';
    }

    return null;
  }

  /// Image URL validator
  static String? imageUrl(String? value) {
    if (value == null || value.isEmpty) {
      return 'Đường dẫn ảnh không được để trống';
    }

    final imageRegex = RegExp(
      r'^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?.*)?$',
      caseSensitive: false,
    );

    if (!imageRegex.hasMatch(value)) {
      return 'Đường dẫn ảnh không hợp lệ';
    }

    return null;
  }

  /// Date validator
  static String? date(String? value) {
    if (value == null || value.isEmpty) {
      return 'Ngày không được để trống';
    }

    try {
      DateTime.parse(value);
      return null;
    } catch (e) {
      return 'Ngày không hợp lệ';
    }
  }

  /// Credit card validator
  static String? creditCard(String? value) {
    if (value == null || value.isEmpty) {
      return 'Số thẻ không được để trống';
    }

    final cleanCard = value.replaceAll(RegExp(r'\s'), '');

    if (!RegExp(r'^[0-9]{13,19}$').hasMatch(cleanCard)) {
      return 'Số thẻ không hợp lệ';
    }

    // Luhn algorithm
    var sum = 0;
    var alternate = false;
    for (var i = cleanCard.length - 1; i >= 0; i--) {
      var n = int.parse(cleanCard[i]);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }

    if (sum % 10 != 0) {
      return 'Số thẻ không hợp lệ';
    }

    return null;
  }

  /// Vietnamese ID card validator
  static String? idCardVN(String? value) {
    if (value == null || value.isEmpty) {
      return 'Số CMND/CCCD không được để trống';
    }

    // Old format: 9 or 12 digits
    // New format: 12 digits
    if (!RegExp(r'^[0-9]{9}$|^[0-9]{12}$').hasMatch(value)) {
      return 'Số CMND/CCCD không hợp lệ';
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // MATCH & CUSTOM VALIDATORS
  // ═══════════════════════════════════════════════════════════════

  /// Match validator (for comparing two fields)
  static String? match(String? value, String? matchValue, {String? fieldName}) {
    if (value != matchValue) {
      return '${fieldName ?? "Giá trị"} không khớp';
    }
    return null;
  }

  /// Regex validator
  static String? regex(String? value, RegExp pattern, String message) {
    if (value == null || value.isEmpty) return message;
    if (!pattern.hasMatch(value)) return message;
    return null;
  }

  /// Custom validator
  static String? custom(
    String? value,
    bool Function(String?) validator,
    String message,
  ) {
    if (!validator(value)) return message;
    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // COMPOSITE VALIDATORS
  // ═══════════════════════════════════════════════════════════════

  /// Combine multiple validators
  static String? Function(String?) combine(
    List<String? Function(String?)> validators,
  ) {
    return (value) {
      for (final validator in validators) {
        final result = validator(value);
        if (result != null) return result;
      }
      return null;
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS LOGIC VALIDATORS
  // ═══════════════════════════════════════════════════════════════

  /// Login form validator
  static Map<String, String?> loginForm({
    required String? email,
    required String? password,
  }) {
    return {
      'email': Validators.email(email),
      'password': Validators.password(password),
    };
  }

  /// Register form validator
  static Map<String, String?> registerForm({
    required String? fullName,
    required String? email,
    required String? password,
    required String? confirmPassword,
  }) {
    return {
      'fullName': Validators.name(fullName),
      'email': Validators.email(email),
      'password': Validators.strongPassword(password),
      'confirmPassword': Validators.confirmPassword(confirmPassword, password),
    };
  }

  /// Change password form validator
  static Map<String, String?> changePasswordForm({
    required String? oldPassword,
    required String? newPassword,
    required String? confirmPassword,
  }) {
    final errors = <String, String?>{
      'oldPassword': Validators.required(
        oldPassword,
        fieldName: 'Mật khẩu hiện tại',
      ),
      'newPassword': Validators.strongPassword(newPassword),
      'confirmPassword': Validators.confirmPassword(
        confirmPassword,
        newPassword,
      ),
    };

    // Check if new password is same as old
    if (oldPassword != null &&
        newPassword != null &&
        oldPassword == newPassword) {
      errors['newPassword'] = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    return errors;
  }

  /// Profile update form validator
  static Map<String, String?> profileForm({
    required String? fullName,
    required String? phone,
    String? email,
  }) {
    final errors = <String, String?>{
      'fullName': Validators.name(fullName),
      'phone': Validators.phoneVN(phone),
    };

    if (email != null && email.isNotEmpty) {
      errors['email'] = Validators.email(email);
    }

    return errors;
  }
}
