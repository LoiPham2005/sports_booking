// CLI script — print() là OK, lint nghiêm không áp dụng.
// ignore_for_file: avoid_print, depend_on_referenced_packages

import 'dart:convert';
import 'dart:io';

import 'package:ansicolor/ansicolor.dart';

// tools/l10n_sync.dart
// ─────────────────────────────────────────────────────────────
// L10n Sync Tool (Synchronize ARB files and auto-translate)
//
// Usage:
//   fvm dart run tools/l10n_sync.dart                  → sync + reuse English values
//   fvm dart run tools/l10n_sync.dart --translate      → sync + auto-translate via Google
//   fvm dart run tools/l10n_sync.dart --dry-run        → preview only
//   fvm dart run tools/l10n_sync.dart --verbose        → show stack on error
// ─────────────────────────────────────────────────────────────

void main(List<String> arguments) async {
  ansiColorDisabled = false;
  final syncer = L10nSyncer();
  await syncer.sync(
    dryRun: arguments.contains('--dry-run'),
    verbose: arguments.contains('--verbose'),
    translate: arguments.contains('--translate'),
  );
}

class L10nSyncer {
  static const _l10nPath = 'lib/design/l10n/translations';
  static const _sourceFile = 'app_en.arb';
  static const _indent = '    ';

  static final _green = AnsiPen()..green();
  static final _yellow = AnsiPen()..yellow();
  static final _red = AnsiPen()..red();
  static final _blue = AnsiPen()..blue();
  static final _cyan = AnsiPen()..cyan();
  static final _gray = AnsiPen()..gray();
  static final _greenBold = AnsiPen()..green(bold: true);
  static final _redBold = AnsiPen()..red(bold: true);
  static final _blueBold = AnsiPen()..blue(bold: true);
  static final _yellowBold = AnsiPen()..yellow(bold: true);

  Future<void> sync({
    bool dryRun = false,
    bool verbose = false,
    bool translate = false,
  }) async {
    _printHeader(dryRun, translate);
    try {
      final l10nDir = Directory(_l10nPath);
      if (!l10nDir.existsSync()) {
        _error('Directory not found: $_l10nPath');
        exit(1);
      }
      final sourceFile = File('$_l10nPath/$_sourceFile');
      if (!sourceFile.existsSync()) {
        _error('Source file not found: $_sourceFile');
        exit(1);
      }
      final sourceContent = _loadArb(sourceFile);
      final sourceKeys = _extractTranslationKeys(sourceContent);

      _info(
        'Source: ${_cyan(_sourceFile)} (${_greenBold('${sourceKeys.length}')} keys)',
      );
      print('');

      final targetFiles = _findTargetFiles(l10nDir);
      if (targetFiles.isEmpty) {
        _warning('No target files found in $_l10nPath');
        exit(0);
      }

      _info('Syncing ${_cyan('${targetFiles.length}')} file(s):\n');
      var totalAdded = 0;
      var totalRemoved = 0;
      var totalUpdated = 0;

      for (final file in targetFiles) {
        final result = await _processFile(
          file,
          sourceContent,
          sourceKeys,
          dryRun: dryRun,
          verbose: verbose,
          translate: translate,
        );
        totalAdded += result.added;
        totalRemoved += result.removed;
        totalUpdated += result.updated;
      }
      _printSummary(totalAdded, totalRemoved, totalUpdated, dryRun, translate);
    } catch (e, stackTrace) {
      _error('Fatal error: $e');
      if (verbose) print(_gray(stackTrace.toString()));
      exit(1);
    }
  }

  Future<SyncResult> _processFile(
    File file,
    Map<String, dynamic> sourceContent,
    Set<String> sourceKeys, {
    required bool dryRun,
    required bool verbose,
    required bool translate,
  }) async {
    final fileName = file.path.split(Platform.pathSeparator).last;
    final targetLocale = fileName.replaceAll('app_', '').replaceAll('.arb', '');
    print(_blueBold('📄 $fileName (${targetLocale.toUpperCase()})'));

    final targetContent = _loadArb(file);
    final targetKeys = _extractTranslationKeys(targetContent);
    final added = <String>[];
    final removed = <String>[];
    final updated = <String>[];

    for (final key in sourceKeys) {
      if (!targetKeys.contains(key)) {
        final sourceValue = sourceContent[key] as String;
        if (translate && targetLocale != 'en') {
          stdout.write('  ${_gray('Translating: ')} $key... ');
          final translated = await _translateText(sourceValue, targetLocale);
          targetContent[key] = translated;
          stdout.writeln(_green('Done'));
        } else {
          targetContent[key] = sourceValue;
        }
        added.add(key);
      } else {
        _fixPlaceholders(
          key,
          sourceContent[key] as String,
          targetContent,
          targetLocale,
        );
      }
    }
    for (final key in targetKeys) {
      if (!sourceKeys.contains(key)) {
        targetContent.remove(key);
        removed.add(key);
      }
    }

    for (final key in sourceContent.keys) {
      if (key.startsWith('@')) {
        final baseKey = key.substring(1);
        if (targetKeys.contains(baseKey) || added.contains(baseKey)) {
          targetContent[key] = sourceContent[key];
        }
      }
    }
    final sortedContent = _sortArbContent(targetContent);
    if (added.isNotEmpty) print('  ${_green('+ Added: ${added.length}')}');
    if (removed.isNotEmpty) print('  ${_red('- Removed: ${removed.length}')}');
    if (added.isEmpty && removed.isEmpty) print('  ${_green('✓ In sync')}');

    if (!dryRun &&
        (added.isNotEmpty ||
            removed.isNotEmpty ||
            targetContent.toString() != _loadArb(file).toString())) {
      _writeArb(file, sortedContent);
      print('  ${_green('✓ Saved')}');
    }
    print('');
    return SyncResult(
      added: added.length,
      removed: removed.length,
      updated: updated.length,
    );
  }

  void _fixPlaceholders(
    String key,
    String sourceValue,
    Map<String, dynamic> targetContent,
    String locale,
  ) {
    final targetValue = targetContent[key] as String;
    final placeholderRegex = RegExp(r'\{[^}]+\}');
    final sourceMatches = placeholderRegex
        .allMatches(sourceValue)
        .map((m) => m.group(0)!)
        .toList();
    final targetMatches = placeholderRegex
        .allMatches(targetValue)
        .map((m) => m.group(0)!)
        .toList();
    if (sourceMatches.length != targetMatches.length) return;
    var fixedValue = targetValue;
    var changed = false;
    for (var i = 0; i < sourceMatches.length; i++) {
      if (sourceMatches[i] != targetMatches[i]) {
        fixedValue = fixedValue.replaceFirst(
          targetMatches[i],
          sourceMatches[i],
        );
        changed = true;
      }
    }
    if (changed) {
      targetContent[key] = fixedValue;
      _info('Fixed placeholders in $key: $targetValue -> $fixedValue');
    }
  }

  Future<String> _translateText(String text, String targetLang) async {
    try {
      final placeholderRegex = RegExp(r'\{[^}]+\}');
      final placeholders = placeholderRegex
          .allMatches(text)
          .map((m) => m.group(0)!)
          .toList();
      var textToTranslate = text;
      for (var i = 0; i < placeholders.length; i++) {
        textToTranslate = textToTranslate.replaceFirst(
          placeholders[i],
          '___${i}___',
        );
      }

      final encodedText = Uri.encodeComponent(textToTranslate);
      final url =
          'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=$targetLang&dt=t&q=$encodedText';
      final client = HttpClient();
      final request = await client.getUrl(Uri.parse(url));
      final response = await request.close();

      if (response.statusCode == 200) {
        final content = await response.transform(utf8.decoder).join();
        final json = jsonDecode(content) as List<dynamic>;
        if (json.isNotEmpty && json[0] is List) {
          final translatedParts = json[0] as List<dynamic>;
          var result = '';
          for (final part in translatedParts) {
            if (part is List && part.isNotEmpty) {
              result += part[0].toString();
            }
          }
          for (var i = 0; i < placeholders.length; i++) {
            final markerRegex = RegExp('_+\\s*$i\\s*_+');
            result = result.replaceFirst(markerRegex, placeholders[i]);
          }
          return result;
        }
      }
      return text;
    } catch (e) {
      return text;
    }
  }

  List<File> _findTargetFiles(Directory dir) {
    return dir
        .listSync()
        .whereType<File>()
        .where((f) => f.path.endsWith('.arb') && !f.path.endsWith(_sourceFile))
        .toList()
      ..sort((a, b) => a.path.compareTo(b.path));
  }

  Map<String, dynamic> _loadArb(File file) {
    try {
      return jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
    } catch (e) {
      _error('Failed to parse ${file.path}: $e');
      exit(1);
    }
  }

  void _writeArb(File file, Map<String, dynamic> content) {
    try {
      final json = const JsonEncoder.withIndent(_indent).convert(content);
      file.writeAsStringSync('$json\n');
    } catch (e) {
      _error('Failed to write ${file.path}: $e');
      exit(1);
    }
  }

  Set<String> _extractTranslationKeys(Map<String, dynamic> content) =>
      content.keys.where((key) => !key.startsWith('@')).toSet();

  Map<String, dynamic> _sortArbContent(Map<String, dynamic> content) {
    final sorted = <String, dynamic>{};
    final translationKeys =
        content.keys.where((k) => !k.startsWith('@')).toList()..sort();
    for (final key in translationKeys) {
      sorted[key] = content[key];
      final metaKey = '@$key';
      if (content.containsKey(metaKey)) sorted[metaKey] = content[metaKey];
    }
    return sorted;
  }

  void _printHeader(bool dryRun, bool translate) {
    final border = '═' * 60;
    print(_blue(border));
    print(
      _blueBold(
        '🌍 L10n Sync Tool${dryRun ? ' (DRY RUN)' : ''}${translate ? ' + Auto-Translate' : ''}',
      ),
    );
    print(_blue(border));
    print('');
  }

  void _printSummary(
    int added,
    int removed,
    int updated,
    bool dryRun,
    bool translate,
  ) {
    final border = '═' * 60;
    print(_blue(border));
    print(_greenBold('✅ Sync completed!'));
    print('  Added:   ${_green('$added')} keys');
    print('  Removed: ${_red('$removed')} keys');
    if (translate && added > 0) {
      print('  ${_cyan('Status: Auto-translated missing keys from English')}');
    }
    if (dryRun) {
      print('\n${_yellowBold('⚠️  DRY RUN: No files were modified')}');
    }
    print(_blue(border));
  }

  void _info(String message) => print(_blue('ℹ️  $message'));
  void _warning(String message) => print(_yellow('⚠️  $message'));
  void _error(String message) => print(_redBold('❌ $message'));
}

class SyncResult {
  const SyncResult({
    required this.added,
    required this.removed,
    required this.updated,
  });

  final int added;
  final int removed;
  final int updated;
}
