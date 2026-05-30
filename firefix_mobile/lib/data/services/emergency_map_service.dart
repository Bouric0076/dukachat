import 'dart:math';

import 'package:dio/dio.dart';
import 'package:latlong2/latlong.dart';

import '../../core/constants/app_constants.dart';
import '../models/emergency_facility.dart';

class EmergencyMapService {
  EmergencyMapService({Dio? dio}) : _dio = dio ?? Dio();

  static const _overpassUrl = 'https://overpass-api.de/api/interpreter';
  static const _openRouteBaseUrl = 'https://api.openrouteservice.org';

  final Dio _dio;
  final Distance _distance = const Distance();

  Future<List<EmergencyFacility>> fetchNearbyFacilities({
    required LatLng center,
    int radiusMeters = 10000,
  }) async {
    if (AppConstants.mapBackendBaseUrl.isNotEmpty) {
      try {
        final response = await _dio.get(
          '${AppConstants.mapBackendBaseUrl}/facilities',
          queryParameters: {
            'lat': center.latitude,
            'lng': center.longitude,
            'radius': radiusMeters,
          },
        );

        final facilities = (response.data['facilities'] as List? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(
              (item) => EmergencyFacility(
                id: item['id'] as String? ?? '',
                name: item['name'] as String? ?? 'Unknown responder',
                type: (item['type'] as String? ?? 'medical') == 'fire'
                    ? EmergencyFacilityType.fireStation
                    : EmergencyFacilityType.medical,
                location: LatLng(
                  (item['lat'] as num).toDouble(),
                  (item['lng'] as num).toDouble(),
                ),
                phone: item['phone'] as String?,
                address: item['address'] as String?,
                distanceMeters: (item['distanceMeters'] as num).toDouble(),
              ),
            )
            .toList()
          ..sort((a, b) => a.distanceMeters.compareTo(b.distanceMeters));

        return facilities;
      } catch (_) {
        // Fall back to direct OSM lookup when the backend is unavailable.
      }
    }

    final query = '''
[out:json][timeout:25];
(
  node["amenity"="fire_station"](around:$radiusMeters,${center.latitude},${center.longitude});
  way["amenity"="fire_station"](around:$radiusMeters,${center.latitude},${center.longitude});
  relation["amenity"="fire_station"](around:$radiusMeters,${center.latitude},${center.longitude});
  node["amenity"~"hospital|clinic|doctors"](around:$radiusMeters,${center.latitude},${center.longitude});
  way["amenity"~"hospital|clinic|doctors"](around:$radiusMeters,${center.latitude},${center.longitude});
  relation["amenity"~"hospital|clinic|doctors"](around:$radiusMeters,${center.latitude},${center.longitude});
  node["healthcare"~"hospital|clinic|doctor"](around:$radiusMeters,${center.latitude},${center.longitude});
  way["healthcare"~"hospital|clinic|doctor"](around:$radiusMeters,${center.latitude},${center.longitude});
  relation["healthcare"~"hospital|clinic|doctor"](around:$radiusMeters,${center.latitude},${center.longitude});
  node["emergency"="ambulance_station"](around:$radiusMeters,${center.latitude},${center.longitude});
  way["emergency"="ambulance_station"](around:$radiusMeters,${center.latitude},${center.longitude});
  relation["emergency"="ambulance_station"](around:$radiusMeters,${center.latitude},${center.longitude});
);
out center tags;
''';

    final response = await _dio.post(
      _overpassUrl,
      data: query,
      options: Options(
        contentType: Headers.textPlainContentType,
        responseType: ResponseType.json,
      ),
    );

    final elements = (response.data['elements'] as List? ?? const [])
        .whereType<Map<String, dynamic>>();

    final facilities = elements
        .map((element) => _facilityFromOverpass(element, center))
        .whereType<EmergencyFacility>()
        .toList()
      ..sort((a, b) => a.distanceMeters.compareTo(b.distanceMeters));

    final seen = <String>{};
    return facilities
        .where((facility) {
          final key = facility.name.toLowerCase().trim();
          if (seen.contains(key)) return false;
          seen.add(key);
          return true;
        })
        .take(30)
        .toList();
  }

  Future<EmergencyRoute> fetchDrivingRoute({
    required LatLng from,
    required LatLng to,
  }) async {
    if (AppConstants.mapBackendBaseUrl.isNotEmpty) {
      try {
        final response = await _dio.post(
          '${AppConstants.mapBackendBaseUrl}/route',
          data: {
            'from': {'lat': from.latitude, 'lng': from.longitude},
            'to': {'lat': to.latitude, 'lng': to.longitude},
          },
        );

        final route = response.data['route'] as Map<String, dynamic>;
        final points = (route['points'] as List)
            .whereType<Map<String, dynamic>>()
            .map(
              (point) => LatLng(
                (point['lat'] as num).toDouble(),
                (point['lng'] as num).toDouble(),
              ),
            )
            .toList();

        return EmergencyRoute(
          points: points,
          distanceMeters: (route['distanceMeters'] as num).toDouble(),
          durationSeconds: (route['durationSeconds'] as num).toDouble(),
          isEstimated: route['isEstimated'] as bool? ?? false,
        );
      } catch (_) {
        // Fall through to direct ORS lookup and the local estimate.
      }
    }

    if (AppConstants.openRouteApiKey.isEmpty) {
      return _estimatedRoute(from, to);
    }

    try {
      final response = await _dio.post(
        '$_openRouteBaseUrl/v2/directions/driving-car/geojson',
        data: {
          'coordinates': [
            [from.longitude, from.latitude],
            [to.longitude, to.latitude],
          ],
        },
        options: Options(
          headers: {'Authorization': AppConstants.openRouteApiKey},
          responseType: ResponseType.json,
        ),
      );

      final feature = (response.data['features'] as List).first;
      final geometry = feature['geometry'] as Map<String, dynamic>;
      final properties = feature['properties'] as Map<String, dynamic>;
      final summary = properties['summary'] as Map<String, dynamic>;
      final coordinates = (geometry['coordinates'] as List)
          .whereType<List>()
          .map((point) => LatLng(
                (point[1] as num).toDouble(),
                (point[0] as num).toDouble(),
              ))
          .toList();

      return EmergencyRoute(
        points: coordinates,
        distanceMeters: (summary['distance'] as num).toDouble(),
        durationSeconds: (summary['duration'] as num).toDouble(),
        isEstimated: false,
      );
    } catch (_) {
      return _estimatedRoute(from, to);
    }
  }

  EmergencyFacility? _facilityFromOverpass(
    Map<String, dynamic> element,
    LatLng center,
  ) {
    final lat = (element['lat'] ?? element['center']?['lat']) as num?;
    final lon = (element['lon'] ?? element['center']?['lon']) as num?;
    if (lat == null || lon == null) return null;

    final tags = (element['tags'] as Map?)?.cast<String, dynamic>() ?? {};
    final location = LatLng(lat.toDouble(), lon.toDouble());
    final type = _typeFromTags(tags);
    final name = (tags['name'] as String?)?.trim();

    return EmergencyFacility(
      id: '${element['type']}-${element['id']}',
      name: name == null || name.isEmpty ? _fallbackName(type) : name,
      type: type,
      location: location,
      phone: tags['phone'] as String?,
      address: _addressFromTags(tags),
      distanceMeters: _distance.as(LengthUnit.Meter, center, location),
    );
  }

  EmergencyFacilityType _typeFromTags(Map<String, dynamic> tags) {
    if (tags['amenity'] == 'fire_station') {
      return EmergencyFacilityType.fireStation;
    }
    return EmergencyFacilityType.medical;
  }

  String _fallbackName(EmergencyFacilityType type) {
    return type == EmergencyFacilityType.fireStation
        ? 'Unnamed fire station'
        : 'Unnamed medical facility';
  }

  String? _addressFromTags(Map<String, dynamic> tags) {
    final parts = [
      tags['addr:street'],
      tags['addr:suburb'],
      tags['addr:city'],
    ].whereType<String>().where((part) => part.trim().isNotEmpty).toList();
    return parts.isEmpty ? null : parts.join(', ');
  }

  EmergencyRoute _estimatedRoute(LatLng from, LatLng to) {
    final distanceMeters = _distance.as(LengthUnit.Meter, from, to);
    final durationSeconds = max(90, distanceMeters / 7.5);
    return EmergencyRoute(
      points: [from, to],
      distanceMeters: distanceMeters,
      durationSeconds: durationSeconds.toDouble(),
      isEstimated: true,
    );
  }
}
