import 'package:flutter/material.dart';
import '../../shared/mock/demo_state.dart';
import '../../shared/theme/app_colors.dart';
import 'staff_account_tab.dart';
import 'staff_revenue_tab.dart';
import 'staff_schedule_tab.dart';
import 'staff_today_tab.dart';

class StaffShell extends StatefulWidget {
  const StaffShell({super.key});

  @override
  State<StaffShell> createState() => _StaffShellState();
}

class _StaffShellState extends State<StaffShell> {
  int _index = 0;

  @override
  void initState() {
    super.initState();
    DemoState.instance.addListener(_onRoleChange);
  }

  @override
  void dispose() {
    DemoState.instance.removeListener(_onRoleChange);
    super.dispose();
  }

  void _onRoleChange() {
    if (mounted) {
      setState(() {
        // Clamp index nếu role chuyển từ manager → staff (4 → 3 tabs)
        if (_index >= _tabsForRole().length) _index = 0;
      });
    }
  }

  List<Widget> _tabsForRole() {
    final isManager = DemoState.instance.isManager;
    return [
      const StaffTodayTab(),
      const StaffScheduleTab(),
      if (isManager) const StaffRevenueTab(),
      const StaffAccountTab(),
    ];
  }

  List<NavigationDestination> _destinationsForRole() {
    final isManager = DemoState.instance.isManager;
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
    final tabs = _tabsForRole();
    return Scaffold(
      body: IndexedStack(index: _index, children: tabs),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        height: 68,
        indicatorColor: AppColors.primary.withValues(alpha: 0.15),
        backgroundColor: Colors.white,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: _destinationsForRole(),
      ),
    );
  }
}
