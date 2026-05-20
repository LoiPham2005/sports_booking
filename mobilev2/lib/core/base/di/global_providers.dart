import 'package:flutter_riverpod/flutter_riverpod.dart';

/// ProviderContainer toàn cục — dùng cho code không có WidgetRef (interceptor,
/// service, route guard, error zone). Khởi tạo trong `main_common.dart`.
ProviderContainer globalContainer = ProviderContainer();
