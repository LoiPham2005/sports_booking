import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/mock/mock_data.dart';
import '../../../shared/routing/route_paths.dart';
import '../../../shared/routing/safe_pop.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/widgets/venue_card.dart';

class VenuesPage extends StatefulWidget {
  final bool isTab;
  const VenuesPage({super.key, this.isTab = false});

  @override
  State<VenuesPage> createState() => _VenuesPageState();
}

class _VenuesPageState extends State<VenuesPage> {
  String _selectedSport = '';
  String _sort = 'distance';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: widget.isTab
          ? null
          : AppBar(
              title: const Text('Khám phá sân'),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => safePop(context),
              ),
            ),
      body: SafeArea(
        top: !widget.isTab ? false : true,
        child: CustomScrollView(
          slivers: [
            if (widget.isTab)
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                sliver: SliverToBoxAdapter(
                  child: Text('Khám phá sân', style: Theme.of(context).textTheme.displaySmall),
                ),
              ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
              sliver: SliverToBoxAdapter(
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: const TextField(
                          decoration: InputDecoration(
                            hintText: 'Tên sân, địa chỉ...',
                            prefixIcon: Icon(Icons.search, size: 20),
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            filled: false,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Material(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(12),
                      child: InkWell(
                        onTap: () => _showFilterSheet(context),
                        borderRadius: BorderRadius.circular(12),
                        child: const SizedBox(
                          height: 48,
                          width: 48,
                          child: Icon(Icons.tune, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Sport filter chips
            SliverToBoxAdapter(
              child: SizedBox(
                height: 42,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  scrollDirection: Axis.horizontal,
                  itemCount: MockData.sports.length + 1,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) {
                    if (i == 0) {
                      return _Chip(
                        label: 'Tất cả',
                        active: _selectedSport.isEmpty,
                        onTap: () => setState(() => _selectedSport = ''),
                      );
                    }
                    final s = MockData.sports[i - 1];
                    return _Chip(
                      label: '${s.icon} ${s.name}',
                      active: _selectedSport == s.slug,
                      onTap: () => setState(() => _selectedSport = s.slug),
                    );
                  },
                ),
              ),
            ),

            // Toolbar: count + map + sort
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              sliver: SliverToBoxAdapter(
                child: Row(
                  children: [
                    Text(
                      '${MockData.venues.length} sân',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    const Spacer(),
                    InkWell(
                      onTap: () => context.push(RoutePaths.venuesMap),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: AppColors.primary.withValues(alpha: 0.3)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.map_outlined,
                                size: 14, color: AppColors.primary),
                            SizedBox(width: 4),
                            Text(
                              'Bản đồ',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w800,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    InkWell(
                      onTap: _showSortSheet,
                      child: Row(
                        children: [
                          const Icon(Icons.swap_vert, size: 18),
                          const SizedBox(width: 4),
                          Text(
                            _sortLabel(_sort),
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            SliverPadding(
              padding: EdgeInsets.fromLTRB(20, 0, 20, widget.isTab ? 90 : 24),
              sliver: SliverList.separated(
                itemCount: MockData.venues.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (_, i) {
                  final v = MockData.venues[i];
                  return VenueCard(
                    venue: v,
                    onTap: () => context.push(RoutePaths.venueDetail(v.id)),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _sortLabel(String s) {
    return switch (s) {
      'distance' => 'Gần nhất',
      'rating' => 'Đánh giá cao',
      'price_asc' => 'Giá tăng dần',
      'price_desc' => 'Giá giảm dần',
      _ => 'Mặc định',
    };
  }

  void _showSortSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            Container(
              height: 4,
              width: 40,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 12),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Sắp xếp', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),
            const SizedBox(height: 8),
            for (final opt in [
              ('distance', 'Gần nhất'),
              ('rating', 'Đánh giá cao'),
              ('price_asc', 'Giá tăng dần'),
              ('price_desc', 'Giá giảm dần'),
            ])
              ListTile(
                title: Text(opt.$2),
                trailing: _sort == opt.$1 ? const Icon(Icons.check, color: AppColors.primary) : null,
                onTap: () {
                  setState(() => _sort = opt.$1);
                  Navigator.pop(context);
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  void _showFilterSheet(BuildContext ctx) {
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        expand: false,
        builder: (_, scrollCtrl) => _FilterSheet(scrollCtrl: scrollCtrl),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _Chip({required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: active ? AppColors.primary : AppColors.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? Colors.white : AppColors.textPrimary,
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class _FilterSheet extends StatefulWidget {
  final ScrollController scrollCtrl;
  const _FilterSheet({required this.scrollCtrl});

  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  double _priceMin = 50000;
  double _priceMax = 500000;
  final Set<String> _amenities = {};
  int _minRating = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 12),
        Container(
          height: 4,
          width: 40,
          decoration: BoxDecoration(
            color: AppColors.border,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
          child: Row(
            children: [
              Text('Bộ lọc', style: Theme.of(context).textTheme.titleLarge),
              const Spacer(),
              TextButton(
                onPressed: () => setState(() {
                  _amenities.clear();
                  _minRating = 0;
                  _priceMin = 50000;
                  _priceMax = 500000;
                }),
                child: const Text('Xoá hết'),
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: ListView(
            controller: widget.scrollCtrl,
            padding: const EdgeInsets.all(20),
            children: [
              const Text('Khoảng giá / giờ', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 6),
              RangeSlider(
                values: RangeValues(_priceMin, _priceMax),
                min: 50000,
                max: 1000000,
                divisions: 19,
                activeColor: AppColors.primary,
                labels: RangeLabels('${_priceMin ~/ 1000}k', '${_priceMax ~/ 1000}k'),
                onChanged: (v) => setState(() {
                  _priceMin = v.start;
                  _priceMax = v.end;
                }),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${_priceMin ~/ 1000}k₫', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  Text('${_priceMax ~/ 1000}k₫', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                ],
              ),
              const SizedBox(height: 24),

              const Text('Khung giờ', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: ['Sáng', 'Trưa', 'Chiều', 'Tối', 'Khuya', 'Cả ngày'].map((t) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Text(t, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              const Text('Tiện ích', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              ...MockData.amenities.entries.map((e) {
                final selected = _amenities.contains(e.key);
                return CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  controlAffinity: ListTileControlAffinity.leading,
                  activeColor: AppColors.primary,
                  value: selected,
                  onChanged: (v) {
                    setState(() {
                      if (v == true) {
                        _amenities.add(e.key);
                      } else {
                        _amenities.remove(e.key);
                      }
                    });
                  },
                  title: Row(
                    children: [
                      Text(e.value.$2, style: const TextStyle(fontSize: 18)),
                      const SizedBox(width: 10),
                      Text(e.value.$1, style: const TextStyle(fontWeight: FontWeight.w500)),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 16),

              const Text('Đánh giá', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              for (final r in [5, 4, 3])
                RadioListTile<int>(
                  contentPadding: EdgeInsets.zero,
                  activeColor: AppColors.primary,
                  value: r,
                  groupValue: _minRating,
                  onChanged: (v) => setState(() => _minRating = v ?? 0),
                  title: Row(
                    children: [
                      Text('⭐' * r),
                      const SizedBox(width: 6),
                      const Text('trở lên', style: TextStyle(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: FilledButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Áp dụng'),
            ),
          ),
        ),
      ],
    );
  }
}
