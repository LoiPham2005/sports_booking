import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('vi_VN');
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const SportsBookingApp());
}
