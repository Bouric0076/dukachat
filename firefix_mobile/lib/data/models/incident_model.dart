class IncidentModel {
  final String id;
  final String description;
  final String severity;
  final double latitude;
  final double longitude;
  final String address;
  final String reporterPhone;
  final DateTime createdAt;

  IncidentModel({
    required this.id,
    required this.description,
    required this.severity,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.reporterPhone,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'description': description,
        'severity': severity,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'reporterPhone': reporterPhone,
        'createdAt': createdAt.toIso8601String(),
      };
}
