import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/core/services/app_version/app_version_service.dart';

/// Dialog hiển thị thông báo cập nhật app.
/// - `isMandatory: true` → user KHÔNG đóng được dialog (PopScope chặn back).
/// - `isMandatory: false` → có nút "Để sau".
class AppUpdateDialog extends StatelessWidget {
  const AppUpdateDialog({
    required this.labels,
    required this.currentVersion,
    required this.latestVersion,
    required this.isMandatory,
    required this.onUpdate,
    required this.onExit,
    super.key,
    this.message,
  });

  final AppVersionLabels labels;
  final String currentVersion;
  final String latestVersion;
  final bool isMandatory;
  final String? message;
  final VoidCallback onUpdate;
  final VoidCallback onExit;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return PopScope(
      canPop: !isMandatory,
      child: AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: Text(
          isMandatory ? labels.forceUpdateTitle : labels.optionalUpdateTitle,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (message != null && message!.isNotEmpty) ...[
              Text(message!, style: theme.textTheme.bodyMedium),
              const SizedBox(height: 12),
            ],
            _VersionRow(
              label: '${labels.versionLabel} hiện tại',
              version: currentVersion,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 4),
            _VersionRow(
              label: '${labels.versionLabel} mới',
              version: latestVersion,
              color: theme.colorScheme.primary,
              bold: true,
            ),
          ],
        ),
        actions: [
          if (isMandatory)
            TextButton(
              onPressed: onExit,
              child: Text(
                labels.exitButton,
                style: TextStyle(color: theme.colorScheme.error),
              ),
            )
          else
            TextButton(
              onPressed: onExit,
              child: Text(labels.laterButton),
            ),
          FilledButton(
            onPressed: onUpdate,
            child: Text(labels.updateButton),
          ),
        ],
      ),
    );
  }
}

class _VersionRow extends StatelessWidget {
  const _VersionRow({
    required this.label,
    required this.version,
    required this.color,
    this.bold = false,
  });

  final String label;
  final String version;
  final Color color;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text('$label: ', style: TextStyle(color: color)),
        Text(
          version,
          style: TextStyle(
            color: color,
            fontWeight: bold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
