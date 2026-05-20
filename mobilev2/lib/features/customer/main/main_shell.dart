import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/routing/route_paths.dart';
import '../../../shared/theme/app_colors.dart';
import '../account/account_tab.dart';
import '../bookings/bookings_tab.dart';
import '../home/home_tab.dart';
import '../venues/venues_tab.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _index = 0;

  final _tabs = const [
    HomeTab(),
    VenuesTab(),
    BookingsTab(),
    AccountTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _tabs),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        elevation: 4,
        onPressed: () => context.push(RoutePaths.venues),
        shape: const CircleBorder(),
        child: const Icon(Icons.search, size: 26),
      ),
      // NOTE: dùng Container thay vì BottomAppBar(shape: CircularNotchedRectangle)
      // vì BottomAppBar có bug khi hit-test gọi Scaffold.geometryOf().value
      // ngoài paint phase → throw. Xem GOTCHAS.md §18.
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          border: const Border(top: BorderSide(color: AppColors.border)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 8,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 64,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home_rounded,
                  label: 'Trang chủ',
                  active: _index == 0,
                  onTap: () => setState(() => _index = 0),
                ),
                _NavItem(
                  icon: Icons.explore_outlined,
                  activeIcon: Icons.explore_rounded,
                  label: 'Khám phá',
                  active: _index == 1,
                  onTap: () => setState(() => _index = 1),
                ),
                const SizedBox(width: 56),
                _NavItem(
                  icon: Icons.event_note_outlined,
                  activeIcon: Icons.event_note_rounded,
                  label: 'Booking',
                  active: _index == 2,
                  onTap: () => setState(() => _index = 2),
                ),
                _NavItem(
                  icon: Icons.person_outline_rounded,
                  activeIcon: Icons.person_rounded,
                  label: 'Tài khoản',
                  active: _index == 3,
                  onTap: () => setState(() => _index = 3),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = active ? AppColors.primary : AppColors.textMuted;
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(active ? activeIcon : icon, color: color, size: 24),
            const SizedBox(height: 2),
            Text(label,
                style: TextStyle(
                    color: color, fontSize: 10.5, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
