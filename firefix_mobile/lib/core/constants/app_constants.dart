import 'package:flutter/material.dart';

class AppConstants {
  // API
  static const String baseUrl = 'https://your-backend-url.com/api';
  static const String incidentEndpoint = '/incidents';
  static const String mapBackendBaseUrl = String.fromEnvironment(
    'MAP_BACKEND_BASE_URL',
    defaultValue: 'https://karada-map-backend.onrender.com',
  );
  static const String openRouteApiKey = String.fromEnvironment(
    'OPENROUTE_API_KEY',
  );

  // App
  static const String appName = 'Karada';
  static const String emergencyNumber = '0800 723 999';

  // Severity levels
  static const List<Map<String, dynamic>> severityLevels = [
    {
      'label': 'Ndogo',
      'sublabel': 'Small fire, contained',
      'icon': Icons.local_fire_department_rounded,
      'value': 'low'
    },
    {
      'label': 'Wastani',
      'sublabel': 'Spreading, needs response',
      'icon': Icons.local_fire_department_rounded,
      'value': 'medium'
    },
    {
      'label': 'Kubwa',
      'sublabel': 'Large fire, critical',
      'icon': Icons.fire_truck_rounded,
      'value': 'high'
    },
    {
      'label': 'Dharura',
      'sublabel': 'Casualties involved',
      'icon': Icons.emergency_share_rounded,
      'value': 'critical'
    },
  ];
}
