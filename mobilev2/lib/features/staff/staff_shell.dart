import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../../shared/theme/app_colors.dart';
import '../staff_portal/presentation/providers/staff_portal_notifier.dart';
import 'staff_account_tab.dart';
import 'staff_revenue_tab.dart';
import 'staff_schedule_tab.dart';
import 'staff_today_tab.dart';

class StaffShell extends ConsumerStatefulWidget {
  const StaffShell({super.key});

  @override
  ConsumerState<StaffShell> createState() => _StaffShellState();
}

class _StaffShellState extends ConsumerState<StaffShell> {
  int _index = 0;

  List<Widget> _tabsForRole(bool isManager) {
    return [
      const StaffTodayTab(),
      const StaffScheduleTab(),
      if (isManager) const StaffRevenueTab(),
      const StaffAccountTab(),
    ];
  }

  List<NavigationDestination> _destinationsForRole(bool isManager) {
    return [
      const NavigationDestination(
        icon: Icon(Icons.today_outlined),
        selectedIcon: Icon(Icons.today, color: AppColors.primary),
        label: 'Hôm nay',
      ),
      const NavigationDestination(
        icon: Icon(Icons.calendar_month_outlined),
        selectedIcon: Icon(Icons.calendar_month, color: AppColors.primary),
        label: 'Lịch sân',
      ),
      if (isManager)
        const NavigationDestination(
          icon: Icon(Icons.bar_chart_outlined),
          selectedIcon: Icon(Icons.bar_chart, color: AppColors.primary),
          label: 'Doanh thu',
        ),
      const NavigationDestination(
        icon: Icon(Icons.person_outline),
        selectedIcon: Icon(Icons.person, color: AppColors.primary),
        label: 'Tài khoản',
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final isManager = ref.watch(isManagerProvider);
    final tabs = _tabsForRole(isManager);
    // Clamp index nếu role chuyển từ manager → staff (4 → 3 tabs).
    if (_index >= tabs.length) _index = 0;
    return Scaffold(
      body: IndexedStack(index: _index, children: tabs),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        height: 68,
        indicatorColor: AppColors.primary.withValues(alpha: 0.15),
        backgroundColor: Colors.white,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: _destinationsForRole(isManager),
      ),
    );
  }
}
