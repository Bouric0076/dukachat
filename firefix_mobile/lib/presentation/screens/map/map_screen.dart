import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

import '../../../core/theme/app_theme.dart';

final List<Map<String, dynamic>> _mockIncidents = [
  {
    'lat': -1.2864,
    'lng': 36.8172,
    'severity': 'critical',
    'address': 'Mathare, Nairobi',
    'time': '10:32 AM',
  },
  {
    'lat': -1.3031,
    'lng': 36.8242,
    'severity': 'high',
    'address': 'Gikomba Market',
    'time': '10:15 AM',
  },
  {
    'lat': -1.2921,
    'lng': 36.8219,
    'severity': 'medium',
    'address': 'Eastleigh, Nairobi',
    'time': '09:48 AM',
  },
];

final List<Map<String, dynamic>> _fireStations = [
  {'lat': -1.2833, 'lng': 36.8167, 'name': 'Nairobi Central'},
  {'lat': -1.3100, 'lng': 36.8300, 'name': 'Eastlands Station'},
];

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> with TickerProviderStateMixin {
  final MapController _mapController = MapController();

  Map<String, dynamic>? _selectedIncident;
  Position? _userPosition;
  StreamSubscription<Position>? _locationSub;

  bool _dispatched = false;
  LatLng? _responderPosition;
  LatLng? _targetPosition;
  LatLng? _dispatchStartPosition;
  Timer? _dispatchTimer;
  int _etaMinutes = 8;

  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _pulseAnimation = CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    );

    _startLocationTracking();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _locationSub?.cancel();
    _dispatchTimer?.cancel();
    super.dispose();
  }

  Future<void> _startLocationTracking() async {
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      if (!mounted) {
        return;
      }

      setState(() => _userPosition = position);

      _locationSub = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 5,
        ),
      ).listen((position) {
        if (mounted) {
          setState(() => _userPosition = position);
        }
      });
    } catch (_) {
      // Location is optional; keep the map usable when GPS is unavailable.
    }
  }

  void _dispatchResponder(Map<String, dynamic> incident) {
    final station = _fireStations.first;
    final start = LatLng(station['lat'] as double, station['lng'] as double);
    final target = LatLng(incident['lat'] as double, incident['lng'] as double);

    _dispatchTimer?.cancel();

    setState(() {
      _selectedIncident = incident;
      _dispatched = true;
      _dispatchStartPosition = start;
      _responderPosition = start;
      _targetPosition = target;
      _etaMinutes = 8;
    });

    const totalSteps = 80;
    var step = 0;

    _dispatchTimer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      step += 1;
      final progress = (step / totalSteps).clamp(0.0, 1.0);
      final easedProgress = Curves.easeInOutCubic.transform(progress);

      final newLatitude =
          start.latitude + (target.latitude - start.latitude) * easedProgress;
      final newLongitude = start.longitude +
          (target.longitude - start.longitude) * easedProgress;

      setState(() {
        _responderPosition = LatLng(newLatitude, newLongitude);
        _etaMinutes = max(1, 8 - (step / 10).floor());
      });

      if (step >= totalSteps) {
        timer.cancel();
        if (mounted) {
          setState(() => _etaMinutes = 1);
        }
      }
    });
  }

  Color _severityColor(String severity) {
    switch (severity) {
      case 'critical':
        return AppColors.primary;
      case 'high':
        return Colors.deepOrange;
      case 'medium':
        return AppColors.tertiary;
      default:
        return Colors.green;
    }
  }

  double _severityRadius(String severity) {
    switch (severity) {
      case 'critical':
        return 45;
      case 'high':
        return 32;
      case 'medium':
        return 24;
      default:
        return 16;
    }
  }

  List<Polyline> _buildDashedRoute(LatLng start, LatLng end) {
    const segments = 18;
    const dashFraction = 0.55;
    final polylines = <Polyline>[];

    for (var index = 0; index < segments; index++) {
      final dashStart = index / segments;
      final dashEnd = min(dashStart + (1 / segments) * dashFraction, 1.0);

      polylines.add(
        Polyline(
          points: [
            LatLng(
              start.latitude + (end.latitude - start.latitude) * dashStart,
              start.longitude + (end.longitude - start.longitude) * dashStart,
            ),
            LatLng(
              start.latitude + (end.latitude - start.latitude) * dashEnd,
              start.longitude + (end.longitude - start.longitude) * dashEnd,
            ),
          ],
          color: AppColors.secondary.withOpacitySafe(0.55),
          strokeWidth: 3,
        ),
      );
    }

    return polylines;
  }

  void _clearSelection() {
    setState(() => _selectedIncident = null);
  }

  @override
  Widget build(BuildContext context) {
    final userCenter = _userPosition != null
        ? LatLng(_userPosition!.latitude, _userPosition!.longitude)
        : const LatLng(-1.2921, 36.8219);

    return Scaffold(
      backgroundColor: AppColors.neutral,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: Stack(
                children: [
                  FlutterMap(
                    mapController: _mapController,
                    options: MapOptions(
                      initialCenter: userCenter,
                      initialZoom: 13,
                      onTap: (_, __) => _clearSelection(),
                    ),
                    children: [
                      TileLayer(
                        urlTemplate:
                            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.firefix.firefix_mobile',
                      ),
                      CircleLayer(
                        circles: _mockIncidents
                            .map(
                              (incident) => CircleMarker(
                                point: LatLng(
                                  incident['lat'] as double,
                                  incident['lng'] as double,
                                ),
                                radius: _severityRadius(
                                  incident['severity'] as String,
                                ),
                                color: _severityColor(
                                  incident['severity'] as String,
                                ).withOpacitySafe(0.24),
                                borderColor: _severityColor(
                                  incident['severity'] as String,
                                ),
                                borderStrokeWidth: 1.5,
                                useRadiusInMeter: false,
                              ),
                            )
                            .toList(),
                      ),
                      if (_dispatched &&
                          _dispatchStartPosition != null &&
                          _targetPosition != null)
                        PolylineLayer(
                          polylines: _buildDashedRoute(
                            _dispatchStartPosition!,
                            _targetPosition!,
                          ),
                        ),
                      MarkerLayer(
                        markers: [
                          ..._mockIncidents.map(
                            (incident) => Marker(
                              point: LatLng(
                                incident['lat'] as double,
                                incident['lng'] as double,
                              ),
                              width: 42,
                              height: 42,
                              child: GestureDetector(
                                onTap: () => setState(
                                  () => _selectedIncident = incident,
                                ),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: _severityColor(
                                      incident['severity'] as String,
                                    ),
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: _severityColor(
                                          incident['severity'] as String,
                                        ).withOpacitySafe(0.35),
                                        blurRadius: 10,
                                        spreadRadius: 1.5,
                                      ),
                                    ],
                                  ),
                                  child: const Center(
                                    child: Icon(
                                      Icons.local_fire_department,
                                      color: Colors.white,
                                      size: 18,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          ..._fireStations.map(
                            (station) => Marker(
                              point: LatLng(
                                station['lat'] as double,
                                station['lng'] as double,
                              ),
                              width: 44,
                              height: 44,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: AppColors.secondary,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 2.5,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.secondary
                                          .withOpacitySafe(0.3),
                                      blurRadius: 10,
                                    ),
                                  ],
                                ),
                                child: const Center(
                                  child: Icon(
                                    Icons.fire_truck,
                                    color: Colors.white,
                                    size: 18,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          if (_dispatched && _responderPosition != null)
                            Marker(
                              point: _responderPosition!,
                              width: 50,
                              height: 50,
                              child: AnimatedBuilder(
                                animation: _pulseAnimation,
                                builder: (context, child) {
                                  return Transform.scale(
                                    scale: 0.95 + (_pulseAnimation.value * 0.1),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: AppColors.success,
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: Colors.white,
                                          width: 2.5,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: AppColors.success
                                                .withOpacitySafe(0.45),
                                            blurRadius: 16,
                                            spreadRadius: 2,
                                          ),
                                        ],
                                      ),
                                      child: const Center(
                                        child: Icon(
                                          Icons.fire_truck,
                                          color: Colors.white,
                                          size: 20,
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          if (_userPosition != null)
                            Marker(
                              point: LatLng(
                                _userPosition!.latitude,
                                _userPosition!.longitude,
                              ),
                              width: 54,
                              height: 54,
                              child: AnimatedBuilder(
                                animation: _pulseAnimation,
                                builder: (context, child) {
                                  return Stack(
                                    alignment: Alignment.center,
                                    children: [
                                      Transform.scale(
                                        scale:
                                            1.5 + (_pulseAnimation.value * 0.4),
                                        child: Container(
                                          width: 18,
                                          height: 18,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: Colors.blue
                                                .withOpacitySafe(0.15),
                                            border: Border.all(
                                              color: Colors.blue
                                                  .withOpacitySafe(0.35),
                                              width: 1,
                                            ),
                                          ),
                                        ),
                                      ),
                                      Container(
                                        width: 14,
                                        height: 14,
                                        decoration: BoxDecoration(
                                          color: Colors.blue,
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: Colors.white,
                                            width: 2.5,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.blue
                                                  .withOpacitySafe(0.45),
                                              blurRadius: 8,
                                              spreadRadius: 1,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: _buildLegend(),
                  ),
                  if (_dispatched)
                    Positioned(
                      top: 12,
                      left: 12,
                      right: 80,
                      child: _buildDispatchBanner(),
                    ),
                  if (_selectedIncident != null)
                    Positioned(
                      bottom: 16,
                      left: 16,
                      right: 16,
                      child: _buildIncidentCard(_selectedIncident!),
                    ),
                  if (_selectedIncident == null && !_dispatched)
                    Positioned(
                      bottom: 16,
                      left: 16,
                      right: 16,
                      child: _buildStatsBar(),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      decoration: const BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(20),
          bottomRight: Radius.circular(20),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.map_outlined, color: Colors.white, size: 22),
          const SizedBox(width: 10),
          const Text(
            'Ramani ya Matukio',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.white.withOpacitySafe(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '${_mockIncidents.length} MATUKIO',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDispatchBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.success,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.success.withOpacitySafe(0.3),
            blurRadius: 10,
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.local_fire_department,
              color: Colors.white, size: 18),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Gari limetumwa',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                'ETA: ~$_etaMinutes dakika',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegend() {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacitySafe(0.1),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _legendItem(
              AppColors.primary, 'Dharura', Icons.local_fire_department),
          _legendItem(Colors.deepOrange, 'Kubwa', Icons.priority_high),
          _legendItem(
              AppColors.tertiary, 'Wastani', Icons.remove_circle_outline),
          _legendItem(Colors.green, 'Ndogo', Icons.circle_outlined),
          const Divider(height: 8),
          _legendItem(AppColors.secondary, 'Kituo', Icons.fire_truck),
          _legendItem(Colors.blue, 'Wewe', Icons.my_location),
        ],
      ),
    );
  }

  Widget _legendItem(Color color, String label, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildIncidentCard(Map<String, dynamic> incident) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacitySafe(0.12),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _severityColor(incident['severity'] as String)
                      .withOpacitySafe(0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  (incident['severity'] as String).toUpperCase(),
                  style: TextStyle(
                    color: _severityColor(incident['severity'] as String),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                incident['time'] as String,
                style: const TextStyle(fontSize: 12, color: AppColors.muted),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.location_on, color: AppColors.primary, size: 18),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  incident['address'] as String,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.dark,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton.icon(
              onPressed:
                  _dispatched ? null : () => _dispatchResponder(incident),
              icon: const Icon(Icons.local_fire_department, size: 18),
              label: Text(
                _dispatched
                    ? 'Gari limetumwa • ~$_etaMinutes min'
                    : 'TUMA GARI',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacitySafe(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _statItem('${_mockIncidents.length}', 'Matukio', AppColors.primary),
          _divider(),
          _statItem('${_fireStations.length}', 'Vituo', AppColors.secondary),
          _divider(),
          _statItem('1', 'Dharura', Colors.deepOrange),
          _divider(),
          _statItem(_userPosition != null ? 'LIVE' : '...', 'GPS', Colors.blue),
        ],
      ),
    );
  }

  Widget _statItem(String value, String label, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.muted,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _divider() => Container(width: 1, height: 30, color: AppColors.border);
}
