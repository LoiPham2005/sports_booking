import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/routing/safe_pop.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';

class OwnerVenueEditPage extends StatelessWidget {
  final String id;
  const OwnerVenueEditPage({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    final venue = MockData.venues.firstWhere(
      (v) => v.id == id,
      orElse: () => MockData.venues.first,
    );

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => safePop(context),
          ),
          title: const Text('Sửa venue'),
          actions: [
            TextButton(onPressed: () {}, child: const Text('Lưu')),
          ],
          bottom: const TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textSecondary,
            tabs: [
              Tab(text: 'Thông tin'),
              Tab(text: 'Sân con'),
              Tab(text: 'Giá'),
              Tab(text: 'Ảnh'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _InfoTab(venue: venue),
            _CourtsTab(),
            _PricesTab(),
            _PhotosTab(venue: venue),
          ],
        ),
      ),
    );
  }
}

class _InfoTab extends StatelessWidget {
  final Venue venue;
  const _InfoTab({required this.venue});
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(
          controller: TextEditingController(text: venue.name),
          decoration: const InputDecoration(labelText: 'Tên venue'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: TextEditingController(text: venue.description),
          maxLines: 4,
          decoration: const InputDecoration(
            labelText: 'Mô tả',
            alignLabelWithHint: true,
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: TextEditingController(text: venue.address),
          decoration: const InputDecoration(labelText: 'Địa chỉ'),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: TextEditingController(text: venue.district),
                decoration: const InputDecoration(labelText: 'Quận/Huyện'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: TextEditingController(text: venue.city),
                decoration: const InputDecoration(labelText: 'Thành phố'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const Text('Giờ mở cửa',
            style: TextStyle(fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        ..._daysOfWeek.map((d) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  SizedBox(
                    width: 80,
                    child:
                        Text(d, style: const TextStyle(fontWeight: FontWeight.w600)),
                  ),
                  Expanded(
                    child: TextField(
                      controller: TextEditingController(text: '06:00'),
                      decoration: const InputDecoration(isDense: true),
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Text('–'),
                  ),
                  Expanded(
                    child: TextField(
                      controller: TextEditingController(text: '22:00'),
                      decoration: const InputDecoration(isDense: true),
                    ),
                  ),
                ],
              ),
            )),
      ],
    );
  }

  static const _daysOfWeek = [
    'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'
  ];
}

class _CourtsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ...MockData.courts.map((c) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Container(
                    height: 44,
                    width: 44,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.stadium_outlined,
                        color: AppColors.primary),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(c.name,
                            style: const TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 14)),
                        Text(
                          '${c.surface} · ${c.indoor ? "Trong nhà" : "Ngoài trời"}',
                          style: const TextStyle(
                              color: AppColors.textMuted, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '${(c.pricePerHour / 1000).toInt()}k',
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 18),
                    onPressed: () {},
                  ),
                ],
              ),
            )),
        OutlinedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.add),
          label: const Text('Thêm sân con'),
        ),
      ],
    );
  }
}

class _PricesTab extends StatelessWidget {
  static const _rules = [
    ('T2–T6', '06:00–17:00', 80000),
    ('T2–T6', '17:00–22:00', 150000),
    ('T7–CN', '06:00–17:00', 120000),
    ('T7–CN', '17:00–22:00', 180000),
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Quy tắc giá theo khung giờ',
            style: TextStyle(fontWeight: FontWeight.w800)),
        const SizedBox(height: 10),
        ..._rules.map((r) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(r.$1,
                            style: const TextStyle(
                                fontWeight: FontWeight.w700)),
                        Text(r.$2,
                            style: const TextStyle(
                                fontFamily: 'monospace',
                                color: AppColors.textMuted,
                                fontSize: 12)),
                      ],
                    ),
                  ),
                  Text(formatVND(r.$3),
                      style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w800)),
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 18),
                    onPressed: () {},
                  ),
                ],
              ),
            )),
        OutlinedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.add),
          label: const Text('Thêm quy tắc'),
        ),
      ],
    );
  }
}

class _PhotosTab extends StatelessWidget {
  final Venue venue;
  const _PhotosTab({required this.venue});
  @override
  Widget build(BuildContext context) {
    return GridView.count(
      padding: const EdgeInsets.all(16),
      crossAxisCount: 3,
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      children: [
        for (int i = 0; i < 5; i++)
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: CachedNetworkImage(
              imageUrl: venue.image,
              fit: BoxFit.cover,
            ),
          ),
        InkWell(
          onTap: () {},
          borderRadius: BorderRadius.circular(10),
          child: DottedBorderBox(),
        ),
      ],
    );
  }
}

class DottedBorderBox extends StatelessWidget {
  const DottedBorderBox({super.key});
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border, width: 1.5),
      ),
      alignment: Alignment.center,
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.add, color: AppColors.textMuted),
          SizedBox(height: 4),
          Text('Thêm',
              style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
        ],
      ),
    );
  }
}
