extension StringX on String {
  // ── State checks ─────────────────────────────────────────────

  /// `true` nếu empty (alias `.isEmpty` cho dễ đọc).
  bool get isNullOrEmpty => isEmpty;

  /// `true` nếu chỉ chứa whitespace.
  bool get isBlank => trim().isEmpty;

  bool get isNotBlank => trim().isNotEmpty;

  // ── Case transforms ──────────────────────────────────────────

  /// Viết hoa ký tự đầu. `'hello'` → `'Hello'`.
  String get capitalize {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Viết hoa chữ cái đầu mỗi từ. `'hello world'` → `'Hello World'`.
  String get titleCase => split(' ').map((w) => w.capitalize).join(' ');

  // ── Validation ───────────────────────────────────────────────

  /// Kiểm tra email cơ bản.
  bool get isEmail {
    final regex = RegExp(r'^[\w.+-]+@([\w-]+\.)+[\w-]{2,}$');
    return regex.hasMatch(this);
  }

  /// Phone hợp lệ generic (8-15 chữ số, optional `+`).
  bool get isValidPhone {
    final regex = RegExp(r'^\+?\d{8,15}$');
    return regex.hasMatch(this);
  }

  /// 🇻🇳 Phone Việt Nam — đầu số 03/05/07/08/09, 10 chữ số (hoặc +84).
  /// ```dart
  /// '0987654321'.isValidPhoneVN  → true
  /// '+84987654321'.isValidPhoneVN → true
  /// ```
  bool get isValidPhoneVN {
    final regex = RegExp(r'^(\+84|84|0)(3|5|7|8|9)\d{8}$');
    return regex.hasMatch(replaceAll(' ', ''));
  }

  // ── Manipulation ─────────────────────────────────────────────

  /// Cắt còn `max` ký tự, thêm suffix nếu cắt.
  String truncate(int max, {String suffix = '...'}) =>
      length <= max ? this : substring(0, max) + suffix;

  /// 🇻🇳 Bỏ dấu tiếng Việt + đổi đ/Đ → d/D.
  /// `'Hà Nội'` → `'Ha Noi'`.
  String removeDiacritics() {
    const accents =
        'àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ';
    const noAccents =
        'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';
    var result = this;
    for (var i = 0; i < accents.length; i++) {
      result = result
          .replaceAll(accents[i], noAccents[i])
          .replaceAll(accents[i].toUpperCase(), noAccents[i].toUpperCase());
    }
    return result;
  }

  /// Mask phone (giữ 3 đầu + 3 cuối, mask giữa).
  /// `'0987654321'` → `'098****321'`.
  String maskPhone({String mask = '*'}) {
    if (length < 7) return this;
    final start = substring(0, 3);
    final end = substring(length - 3);
    return '$start${mask * (length - 6)}$end';
  }

  /// Mask email (giữ 1 ký tự đầu local + domain, mask phần còn lại của local).
  /// `'john.doe@gmail.com'` → `'j*******@gmail.com'`.
  String maskEmail({String mask = '*'}) {
    final at = indexOf('@');
    if (at < 2) return this;
    final start = substring(0, 1);
    final domain = substring(at);
    return '$start${mask * (at - 1)}$domain';
  }

  // ── Parsing ──────────────────────────────────────────────────

  /// Parse int, fallback `defaultValue` nếu fail.
  int toIntOrDefault([int defaultValue = 0]) =>
      int.tryParse(this) ?? defaultValue;

  /// Parse double, fallback `defaultValue` nếu fail.
  double toDoubleOrDefault([double defaultValue = 0.0]) =>
      double.tryParse(this) ?? defaultValue;
}

extension NullableStringX on String? {
  bool get isNullOrEmpty => this == null || this!.isEmpty;
  bool get isNullOrBlank => this == null || this!.trim().isEmpty;

  /// `null` → `''`, ngược lại trả nguyên.
  String orEmpty() => this ?? '';
}
