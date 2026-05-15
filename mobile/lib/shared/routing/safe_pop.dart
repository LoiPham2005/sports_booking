import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

import 'route_paths.dart';

/// Pop nếu có thể, ngược lại go() về fallback (default /main).
/// Dùng cho mọi nút Back để tránh "There is nothing to pop" khi user vào
/// thẳng trang bằng context.go() (vd. từ Login hoặc deep link).
void safePop(BuildContext context, {String fallback = RoutePaths.main}) {
  if (context.canPop()) {
    context.pop();
  } else {
    context.go(fallback);
  }
}
