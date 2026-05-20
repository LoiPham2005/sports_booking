import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTextStyles {
  AppTextStyles._();

  static TextTheme textTheme(Color color) {
    return TextTheme(
      displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w800, color: color, height: 1.1),
      displayMedium: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w700, color: color, height: 1.15),
      displaySmall: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w700, color: color, height: 1.2),
      headlineLarge: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: color),
      headlineMedium: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: color),
      headlineSmall: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: color),
      titleLarge: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: color),
      titleMedium: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: color),
      titleSmall: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: color),
      bodyLarge: GoogleFonts.inter(fontSize: 16, color: color, height: 1.4),
      bodyMedium: GoogleFonts.inter(fontSize: 14, color: color, height: 1.4),
      bodySmall: GoogleFonts.inter(fontSize: 12, color: color, height: 1.4),
      labelLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: color),
      labelMedium: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: color),
      labelSmall: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w500, color: color),
    );
  }

  static TextStyle mono({double size = 14, Color? color, FontWeight? weight}) =>
      GoogleFonts.jetBrainsMono(fontSize: size, color: color, fontWeight: weight ?? FontWeight.w600);
}
