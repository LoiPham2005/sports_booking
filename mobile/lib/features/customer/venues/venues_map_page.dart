import 'dart:ui' as ui;

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../../../shared/mock/mock_data.dart';
import '../../../shared/routing/route_paths.dart';
import '../../../shared/routing/safe_pop.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/utils/format.dart';

class VenuesMapPage extends StatefulWidget {
  const VenuesMapPage({super.key});

  @override
  State<VenuesMapPage> createState() => _VenuesMapPageState();
}

class _VenuesMapPageState extends State<VenuesMapPage> {
  final _mapController = MapController();
  final _searchController = TextEditingController();
  final _sheetController = DraggableScrollableController();

  // Filters
  String _selectedSport = '';
  String _query = '';
  RangeValues _priceRange = const RangeValues(0, 600000);
  bool _indoorOnly = false;
  final Set<String> _amenityFilters = {};

  // State
  String? _selectedVenueId;
  bool _showSearchAreaPill = false;
  LatLng _initialCenter =
      LatLng(MockData.mapCenter.$1, MockData.mapCenter.$2);

  // Sport color/icon mapping
  static const _sportColors = <String, Color>{
    'football_5': AppColors.primary,
    'football_7': AppColors.primary,
    'badminton': AppColors.info,
    'tennis': AppColors.warning,
    'pickleball': AppColors.accent,
    'basketball': AppColors.danger,
    'volleyball': Color(0xFF8B5CF6),
    'table_tennis': Color(0xFF06B6D4),
  };

  static const _sportIcons = <String, IconData>{
    'football_5': Icons.sports_soccer,
    'football_7': Icons.sports_soccer,
    'badminton': Icons.sports_tennis,
    'tennis': Icons.sports_tennis,
    'pickleball': Icons.sports_baseball,
    'basketball': Icons.sports_basketball,
    'volleyball': Icons.sports_volleyball,
    'table_tennis': Icons.sports_tennis,
  };

  @override
  void dispose() {
    _mapController.dispose();
    _searchController.dispose();
    _sheetController.dispose();
    super.dispose();
  }

  List<Venue> get _filteredVenues {
    return MockData.venues.where((v) {
      // Has location
      if (!MockData.venueLocations.containsKey(v.id)) return false;
      // Sport filter
      if (_selectedSport.isNotEmpty && !v.sports.contains(_selectedSport)) {
        return false;
      }
      // Price range
      if (v.priceFrom < _priceRange.start || v.priceFrom > _priceRange.end) {
        return false;
      }
      // Search query
      if (_query.isNotEmpty) {
        final q = _query.toLowerCase();
        if (!v.name.toLowerCase().contains(q) &&
            !v.district.toLowerCase().contains(q) &&
            !v.address.toLowerCase().contains(q)) {
          return false;
        }
      }
      // Amenities (must have ALL selected)
      if (_amenityFilters.isNotEmpty) {
        for (final a in _amenityFilters) {
          if (!v.amenities.contains(a)) return false;
        }
      }
      return true;
    }).toList();
  }

  LatLng _venueLatLng(String id) {
    final loc = MockData.venueLocations[id]!;
    return LatLng(loc.$1, loc.$2);
  }

  void _onMarkerTap(Venue v) {
    setState(() => _selectedVenueId = v.id);
    _mapController.move(_venueLatLng(v.id), 14);
    // Collapse sheet to give space for selected card
    _sheetController.animateTo(0.16,
        duration: const Duration(milliseconds: 200), curve: Curves.easeOut);
  }

  void _onMapEvent(MapEvent event) {
    if (event is MapEventMove || event is MapEventMoveEnd) {
      final dist = const Distance()
          .distance(_initialCenter, event.camera.center);
      // Show "search this area" pill if panned > 1km
      final shouldShow = dist > 1000;
      if (shouldShow != _showSearchAreaPill) {
        setState(() => _showSearchAreaPill = shouldShow);
      }
    }
    if (event is MapEventTap) {
      // Tap on empty map area — deselect
      if (_selectedVenueId != null) {
        setState(() => _selectedVenueId = null);
      }
    }
  }

  void _recenterToMyLocation() {
    // Demo: recenter to Q1 (mock "my location")
    _mapController.move(_initialCenter, MockData.mapInitialZoom);
    _showSnack('Đã quay về vị trí của bạn (demo Q.1, TP.HCM)');
  }

  void _searchThisArea() {
    _initialCenter = _mapController.camera.center;
    setState(() => _showSearchAreaPill = false);
    _showSnack('Đã tìm sân trong khu vực này');
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 200),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final selected = _selectedVenueId == null
        ? null
        : MockData.venues.firstWhere((v) => v.id == _selectedVenueId);

    return Scaffold(
      body: Stack(
        children: [
          // MAP
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _initialCenter,
              initialZoom: MockData.mapInitialZoom,
              minZoom: 9,
              maxZoom: 18,
              onMapEvent: _onMapEvent,
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
              ),
            ),
            children: [
              TileLayer(
                urlTemplate:
                    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.sportsbooking.mobile',
                maxNativeZoom: 19,
                tileProvider: NetworkTileProvider(),
              ),
              // "My location" dot
              MarkerLayer(
                markers: [
                  Marker(
                    point: LatLng(
                        MockData.mapCenter.$1, MockData.mapCenter.$2),
                    width: 22,
                    height: 22,
                    child: const _MyLocationDot(),
                  ),
                ],
              ),
              // Venue markers
              MarkerLayer(
                markers: _filteredVenues.map((v) {
                  return Marker(
                    point: _venueLatLng(v.id),
                    width: 110,
                    height: 78,
                    alignment: Alignment.topCenter,
                    child: _VenueMarker(
                      venue: v,
                      selected: _selectedVenueId == v.id,
                      color: _markerColor(v),
                      icon: _markerIcon(v),
                      onTap: () => _onMarkerTap(v),
                    ),
                  );
                }).toList(),
              ),
              // OSM attribution
              const _OsmAttribution(),
            ],
          ),

          // HEADER OVERLAY (search + filter + sport chips)
          _buildHeader(),

          // "Search this area" pill
          if (_showSearchAreaPill)
            Positioned(
              top: 168,
              left: 0,
              right: 0,
              child: Center(child: _SearchAreaPill(onTap: _searchThisArea)),
            ),

          // RIGHT-SIDE FABS (my location, list view)
          Positioned(
            right: 14,
            top: 180,
            child: Column(
              children: [
                _MapFab(
                  icon: Icons.my_location,
                  onTap: _recenterToMyLocation,
                  tooltip: 'Vị trí của tôi',
                ),
                const SizedBox(height: 10),
                _MapFab(
                  icon: Icons.layers_outlined,
                  onTap: _showMapStyleSheet,
                  tooltip: 'Loại bản đồ',
                ),
                const SizedBox(height: 10),
                _MapFab(
                  icon: Icons.list_alt,
                  onTap: () => safePop(context),
                  tooltip: 'Xem danh sách',
                ),
              ],
            ),
          ),

          // SELECTED VENUE CARD (overlay above bottom sheet)
          if (selected != null)
            Positioned(
              left: 14,
              right: 14,
              bottom: 110,
              child: _SelectedVenueCard(
                venue: selected,
                onClose: () => setState(() => _selectedVenueId = null),
                onDetail: () =>
                    context.push(RoutePaths.venueDetail(selected.id)),
                onDirections: () =>
                    _showSnack('Mở Google Maps chỉ đường tới ${selected.name}'),
              ),
            ),

          // BOTTOM DRAGGABLE SHEET (list of filtered venues)
          DraggableScrollableSheet(
            controller: _sheetController,
            initialChildSize: 0.16,
            minChildSize: 0.08,
            maxChildSize: 0.88,
            snap: true,
            snapSizes: const [0.16, 0.5, 0.88],
            builder: (_, scrollController) {
              return Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  boxShadow: [
                    BoxShadow(
                      color: Color(0x14000000),
                      blurRadius: 20,
                      offset: Offset(0, -4),
                    ),
                  ],
                ),
                child: ListView(
                  controller: scrollController,
                  padding: EdgeInsets.zero,
                  children: [
                    // Handle
                    Center(
                      child: Container(
                        height: 4,
                        width: 40,
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.border,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    // Header
                    Padding(
                      padding:
                          const EdgeInsets.fromLTRB(20, 4, 20, 12),
                      child: Row(
                        children: [
                          Text(
                            '${_filteredVenues.length} sân',
                            style: const TextStyle(
                                fontWeight: FontWeight.w800, fontSize: 16),
                          ),
                          const SizedBox(width: 8),
                          if (_hasActiveFilter)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color:
                                    AppColors.primary.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Text(
                                'Đang lọc',
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          const Spacer(),
                          if (_hasActiveFilter)
                            TextButton(
                              onPressed: _resetFilters,
                              child: const Text('Xoá lọc',
                                  style: TextStyle(fontSize: 12)),
                            ),
                        ],
                      ),
                    ),
                    if (_filteredVenues.isEmpty)
                      _EmptyState(onReset: _resetFilters)
                    else
                      ..._filteredVenues.map((v) => _VenueListTile(
                            venue: v,
                            selected: _selectedVenueId == v.id,
                            onTap: () => _onMarkerTap(v),
                            onDetail: () =>
                                context.push(RoutePaths.venueDetail(v.id)),
                          )),
                    SizedBox(
                        height: MediaQuery.of(context).padding.bottom + 16),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  bool get _hasActiveFilter =>
      _selectedSport.isNotEmpty ||
      _query.isNotEmpty ||
      _priceRange.start > 0 ||
      _priceRange.end < 600000 ||
      _indoorOnly ||
      _amenityFilters.isNotEmpty;

  void _resetFilters() {
    setState(() {
      _selectedSport = '';
      _query = '';
      _searchController.clear();
      _priceRange = const RangeValues(0, 600000);
      _indoorOnly = false;
      _amenityFilters.clear();
    });
  }

  Color _markerColor(Venue v) {
    if (v.sports.isEmpty) return AppColors.primary;
    return _sportColors[v.sports.first] ?? AppColors.primary;
  }

  IconData _markerIcon(Venue v) {
    if (v.sports.isEmpty) return Icons.location_on;
    return _sportIcons[v.sports.first] ?? Icons.location_on;
  }

  Widget _buildHeader() {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.white,
              Colors.white.withValues(alpha: 0.95),
              Colors.white.withValues(alpha: 0),
            ],
            stops: const [0, 0.75, 1],
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: Column(
            children: [
              // Search + back + filter
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
                child: Row(
                  children: [
                    _CircleBtn(
                      icon: Icons.arrow_back,
                      onTap: () => safePop(context),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        height: 46,
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x14000000),
                              blurRadius: 12,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.search,
                                color: AppColors.textMuted, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextField(
                                controller: _searchController,
                                onChanged: (v) => setState(() => _query = v),
                                decoration: const InputDecoration(
                                  hintText: 'Tìm sân, quận, địa chỉ...',
                                  isDense: true,
                                  border: InputBorder.none,
                                ),
                              ),
                            ),
                            if (_query.isNotEmpty)
                              GestureDetector(
                                onTap: () {
                                  _searchController.clear();
                                  setState(() => _query = '');
                                },
                                child: const Icon(Icons.close,
                                    size: 18, color: AppColors.textMuted),
                              ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    _CircleBtn(
                      icon: Icons.tune,
                      onTap: _showFilterSheet,
                      badge: _hasActiveFilter,
                    ),
                  ],
                ),
              ),
              // Sport chips
              SizedBox(
                height: 38,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: MockData.sports.length + 1,
                  separatorBuilder: (_, __) => const SizedBox(width: 6),
                  itemBuilder: (_, i) {
                    if (i == 0) {
                      return _SportChip(
                        label: 'Tất cả',
                        emoji: '🎯',
                        active: _selectedSport.isEmpty,
                        onTap: () => setState(() => _selectedSport = ''),
                      );
                    }
                    final s = MockData.sports[i - 1];
                    return _SportChip(
                      label: s.name,
                      emoji: s.icon,
                      active: _selectedSport == s.slug,
                      onTap: () => setState(
                          () => _selectedSport = _selectedSport == s.slug ? '' : s.slug),
                    );
                  },
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  void _showMapStyleSheet() {
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
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Loại bản đồ',
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w800)),
              ),
            ),
            const SizedBox(height: 8),
            ListTile(
              leading: const Icon(Icons.map, color: AppColors.primary),
              title: const Text('Mặc định (OpenStreetMap)'),
              trailing:
                  const Icon(Icons.check, color: AppColors.primary, size: 20),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.terrain),
              title: const Text('Vệ tinh'),
              subtitle: const Text('Sắp ra mắt'),
              enabled: false,
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.dark_mode_outlined),
              title: const Text('Nền tối'),
              subtitle: const Text('Sắp ra mắt'),
              enabled: false,
              onTap: () {},
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => StatefulBuilder(
        builder: (sheetCtx, setSheet) => DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.7,
          maxChildSize: 0.92,
          builder: (_, scrollController) => ListView(
            controller: scrollController,
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            children: [
              Center(
                child: Container(
                  height: 4,
                  width: 40,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const Text('Bộ lọc',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 20),

              const Text('GIÁ /GIỜ',
                  style: TextStyle(
                      fontSize: 11,
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textMuted)),
              const SizedBox(height: 8),
              Text(
                '${formatVND(_priceRange.start.round())} – ${formatVND(_priceRange.end.round())}',
                style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                    fontSize: 14),
              ),
              RangeSlider(
                values: _priceRange,
                min: 0,
                max: 600000,
                divisions: 12,
                labels: RangeLabels(
                  formatVND(_priceRange.start.round()),
                  formatVND(_priceRange.end.round()),
                ),
                onChanged: (v) {
                  setSheet(() => _priceRange = v);
                  setState(() {});
                },
              ),

              const SizedBox(height: 12),
              const Text('LOẠI SÂN',
                  style: TextStyle(
                      fontSize: 11,
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textMuted)),
              const SizedBox(height: 8),
              SwitchListTile(
                title: const Text('Chỉ sân có mái che / trong nhà'),
                subtitle: const Text('Phù hợp khi trời mưa'),
                value: _indoorOnly,
                onChanged: (v) {
                  setSheet(() => _indoorOnly = v);
                  setState(() {});
                },
                contentPadding: EdgeInsets.zero,
                activeThumbColor: AppColors.primary,
              ),

              const SizedBox(height: 12),
              const Text('TIỆN ÍCH',
                  style: TextStyle(
                      fontSize: 11,
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textMuted)),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: MockData.amenities.entries.map((e) {
                  final selected = _amenityFilters.contains(e.key);
                  return FilterChip(
                    label: Text('${e.value.$2} ${e.value.$1}'),
                    selected: selected,
                    onSelected: (_) {
                      setSheet(() {
                        if (selected) {
                          _amenityFilters.remove(e.key);
                        } else {
                          _amenityFilters.add(e.key);
                        }
                      });
                      setState(() {});
                    },
                    showCheckmark: false,
                    selectedColor: AppColors.primary.withValues(alpha: 0.15),
                    side: BorderSide(
                      color: selected ? AppColors.primary : AppColors.border,
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        setSheet(() {
                          _priceRange = const RangeValues(0, 600000);
                          _indoorOnly = false;
                          _amenityFilters.clear();
                        });
                        setState(() {});
                      },
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                      ),
                      child: const Text('Đặt lại'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: FilledButton(
                      onPressed: () => Navigator.pop(sheetCtx),
                      style: FilledButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                      ),
                      child: Text(
                          'Xem ${_filteredVenues.length} sân'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────── WIDGETS ───────────────────

class _CircleBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool badge;
  const _CircleBtn(
      {required this.icon, required this.onTap, this.badge = false});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Material(
          color: Colors.white,
          shape: const CircleBorder(),
          elevation: 2,
          shadowColor: const Color(0x1A000000),
          child: InkWell(
            onTap: onTap,
            customBorder: const CircleBorder(),
            child: SizedBox(
              height: 46,
              width: 46,
              child: Icon(icon, color: AppColors.textPrimary, size: 20),
            ),
          ),
        ),
        if (badge)
          Positioned(
            right: 6,
            top: 6,
            child: Container(
              height: 10,
              width: 10,
              decoration: BoxDecoration(
                color: AppColors.accent,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
            ),
          ),
      ],
    );
  }
}

class _MapFab extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final String tooltip;
  const _MapFab(
      {required this.icon, required this.onTap, required this.tooltip});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: Colors.white,
        shape: const CircleBorder(),
        elevation: 3,
        shadowColor: const Color(0x1F000000),
        child: InkWell(
          onTap: onTap,
          customBorder: const CircleBorder(),
          child: SizedBox(
            height: 44,
            width: 44,
            child: Icon(icon, color: AppColors.textPrimary, size: 20),
          ),
        ),
      ),
    );
  }
}

class _SportChip extends StatelessWidget {
  final String label;
  final String emoji;
  final bool active;
  final VoidCallback onTap;
  const _SportChip({
    required this.label,
    required this.emoji,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: active ? AppColors.primary : AppColors.border,
          ),
          boxShadow: active
              ? null
              : const [
                  BoxShadow(
                    color: Color(0x0F000000),
                    blurRadius: 6,
                    offset: Offset(0, 1),
                  ),
                ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 14)),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: active ? Colors.white : AppColors.textPrimary,
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MyLocationDot extends StatelessWidget {
  const _MyLocationDot();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.info.withValues(alpha: 0.25),
        shape: BoxShape.circle,
      ),
      padding: const EdgeInsets.all(4),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.info,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
        ),
      ),
    );
  }
}

class _VenueMarker extends StatelessWidget {
  final Venue venue;
  final bool selected;
  final Color color;
  final IconData icon;
  final VoidCallback onTap;
  const _VenueMarker({
    required this.venue,
    required this.selected,
    required this.color,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Price label (only when selected, or always show)
          if (selected)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              margin: const EdgeInsets.only(bottom: 4),
              decoration: BoxDecoration(
                color: AppColors.textPrimary,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${(venue.priceFrom / 1000).round()}k',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 11,
                ),
              ),
            ),
          AnimatedScale(
            scale: selected ? 1.15 : 1.0,
            duration: const Duration(milliseconds: 200),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Pin shape
                CustomPaint(
                  size: const Size(40, 50),
                  painter: _PinPainter(
                    color: color,
                    selected: selected,
                  ),
                ),
                // Icon inside pin
                Positioned(
                  top: 8,
                  child: Container(
                    height: 24,
                    width: 24,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: color, size: 14),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PinPainter extends CustomPainter {
  final Color color;
  final bool selected;
  _PinPainter({required this.color, required this.selected});

  @override
  void paint(Canvas canvas, Size size) {
    final shadowPaint = Paint()
      ..color = const Color(0x33000000)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3);
    final paint = Paint()..color = color;
    final borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final path = ui.Path();
    final radius = size.width / 2;
    final cx = size.width / 2;
    // Circle top
    path.addOval(Rect.fromCircle(center: Offset(cx, radius), radius: radius));
    // Triangle bottom
    path.moveTo(cx - radius * 0.55, radius * 1.6);
    path.lineTo(cx, size.height);
    path.lineTo(cx + radius * 0.55, radius * 1.6);
    path.close();

    // Shadow (offset down)
    canvas.save();
    canvas.translate(0, 1.5);
    canvas.drawPath(path, shadowPaint);
    canvas.restore();
    // Fill
    canvas.drawPath(path, paint);
    // White border when selected
    if (selected) {
      canvas.drawPath(path, borderPaint);
    }
  }

  @override
  bool shouldRepaint(_PinPainter old) =>
      old.color != color || old.selected != selected;
}

class _SearchAreaPill extends StatelessWidget {
  final VoidCallback onTap;
  const _SearchAreaPill({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.textPrimary,
      borderRadius: BorderRadius.circular(20),
      elevation: 4,
      shadowColor: const Color(0x33000000),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: const Padding(
          padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.refresh, color: Colors.white, size: 16),
              SizedBox(width: 6),
              Text(
                'Tìm sân trong khu vực này',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SelectedVenueCard extends StatelessWidget {
  final Venue venue;
  final VoidCallback onClose;
  final VoidCallback onDetail;
  final VoidCallback onDirections;
  const _SelectedVenueCard({
    required this.venue,
    required this.onClose,
    required this.onDetail,
    required this.onDirections,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      elevation: 8,
      shadowColor: const Color(0x33000000),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          onTap: onDetail,
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: SizedBox(
                        height: 70,
                        width: 70,
                        child: CachedNetworkImage(
                          imageUrl: venue.image,
                          fit: BoxFit.cover,
                          placeholder: (_, __) =>
                              Container(color: AppColors.surfaceAlt),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            venue.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                fontWeight: FontWeight.w800, fontSize: 14),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              const Icon(Icons.star_rounded,
                                  size: 14, color: Color(0xFFFBBF24)),
                              const SizedBox(width: 2),
                              Text('${venue.rating}',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 12)),
                              const SizedBox(width: 6),
                              const Icon(Icons.location_on_outlined,
                                  size: 12, color: AppColors.textMuted),
                              const SizedBox(width: 2),
                              Flexible(
                                child: Text(
                                  '${venue.district} · ${venue.distance}km',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                      color: AppColors.textMuted,
                                      fontSize: 11),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text.rich(
                            TextSpan(children: [
                              TextSpan(
                                text: formatVND(venue.priceFrom),
                                style: const TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14),
                              ),
                              const TextSpan(
                                text: ' /giờ',
                                style: TextStyle(
                                    color: AppColors.textMuted,
                                    fontSize: 11),
                              ),
                            ]),
                          ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: onClose,
                      child: Container(
                        height: 28,
                        width: 28,
                        decoration: BoxDecoration(
                          color: AppColors.surfaceAlt,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.close,
                            size: 16, color: AppColors.textSecondary),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onDirections,
                        icon: const Icon(Icons.directions, size: 16),
                        label: const Text('Chỉ đường'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(38),
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: onDetail,
                        icon: const Icon(Icons.arrow_forward, size: 16),
                        label: const Text('Xem chi tiết'),
                        style: FilledButton.styleFrom(
                          minimumSize: const Size.fromHeight(38),
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _VenueListTile extends StatelessWidget {
  final Venue venue;
  final bool selected;
  final VoidCallback onTap;
  final VoidCallback onDetail;
  const _VenueListTile({
    required this.venue,
    required this.selected,
    required this.onTap,
    required this.onDetail,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primary.withValues(alpha: 0.06)
              : Colors.transparent,
          border: Border(
            bottom: BorderSide(color: AppColors.border.withValues(alpha: 0.5)),
          ),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                height: 64,
                width: 64,
                child: CachedNetworkImage(
                  imageUrl: venue.image,
                  fit: BoxFit.cover,
                  placeholder: (_, __) =>
                      Container(color: AppColors.surfaceAlt),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    venue.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 14),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded,
                          size: 13, color: Color(0xFFFBBF24)),
                      const SizedBox(width: 2),
                      Text('${venue.rating}',
                          style: const TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 12)),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          '${venue.district} · ${venue.distance}km',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                              color: AppColors.textMuted, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text.rich(
                    TextSpan(children: [
                      TextSpan(
                        text: formatVND(venue.priceFrom),
                        style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w800,
                            fontSize: 13),
                      ),
                      const TextSpan(
                        text: ' /giờ',
                        style: TextStyle(
                            color: AppColors.textMuted, fontSize: 11),
                      ),
                    ]),
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: onDetail,
              icon: const Icon(Icons.arrow_forward_ios,
                  size: 14, color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final VoidCallback onReset;
  const _EmptyState({required this.onReset});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 30, 20, 30),
      child: Column(
        children: [
          const Icon(Icons.map_outlined,
              size: 60, color: AppColors.textMuted),
          const SizedBox(height: 12),
          const Text('Không có sân nào khớp bộ lọc',
              style:
                  TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
          const SizedBox(height: 4),
          const Text(
            'Thử mở rộng khoảng giá hoặc bỏ bớt tiện ích',
            style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: onReset,
            child: const Text('Xoá toàn bộ bộ lọc'),
          ),
        ],
      ),
    );
  }
}

class _OsmAttribution extends StatelessWidget {
  const _OsmAttribution();

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.bottomLeft,
      child: Padding(
        padding: EdgeInsets.fromLTRB(
            8, 0, 8, MediaQuery.of(context).padding.bottom + 100),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.85),
            borderRadius: BorderRadius.circular(4),
          ),
          child: const Text(
            '© OpenStreetMap',
            style: TextStyle(fontSize: 9, color: AppColors.textMuted),
          ),
        ),
      ),
    );
  }
}
