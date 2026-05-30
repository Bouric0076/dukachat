import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/incident_model.dart';
import '../../../data/services/incident_service.dart';
import '../../../data/services/location_service.dart';
import '../../widgets/sos_button.dart';
import '../../widgets/severity_picker.dart';
import '../../widgets/location_card.dart';

class ReportScreen extends ConsumerStatefulWidget {
  const ReportScreen({super.key});

  @override
  ConsumerState<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends ConsumerState<ReportScreen> {
  final _descriptionController = TextEditingController();
  final _phoneController = TextEditingController();
  final _locationService = LocationService();
  final _incidentService = IncidentService();

  String _severity = 'medium';
  String _address = '';
  Position? _position;
  bool _locationLoading = false;
  bool _submitting = false;
  bool _expanded = false; // SOS tap expands form

  @override
  void initState() {
    super.initState();
    _fetchLocation();
  }

  Future<void> _fetchLocation() async {
    setState(() => _locationLoading = true);
    try {
      final position = await _locationService.getCurrentPosition();
      final address = await _locationService.getAddressFromCoords(
        position.latitude,
        position.longitude,
      );
      setState(() {
        _position = position;
        _address = address;
      });
    } catch (e) {
      setState(() => _address = 'Mahali hakupatikana');
    } finally {
      setState(() => _locationLoading = false);
    }
  }

  Future<void> _submitIncident() async {
    if (_position == null) {
      _showSnack('Subiri mahali kupatikane kwanza');
      return;
    }

    setState(() => _submitting = true);

    final incident = IncidentModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      description: _descriptionController.text.isEmpty
          ? 'Moto unaripotiwa'
          : _descriptionController.text,
      severity: _severity,
      latitude: _position!.latitude,
      longitude: _position!.longitude,
      address: _address,
      reporterPhone: _phoneController.text,
      createdAt: DateTime.now(),
    );

    final success = await _incidentService.reportIncident(incident);

    setState(() => _submitting = false);

    if (success && mounted) {
      context.go('/confirmation/${incident.id}');
    } else {
      _showSnack('Hitilafu imetokea. Jaribu tena.');
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.neutral,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            children: [
              // ── HEADER ──
              _buildHeader(),

              // ── SOS BUTTON ──
              const SizedBox(height: 32),
              SosButton(
                onPressed: () => setState(() => _expanded = true),
                isLoading: _submitting,
              ),

              const SizedBox(height: 12),
              Text(
                _expanded
                    ? 'Jaza maelezo hapa chini'
                    : 'Bonyeza kuripoti dharura',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.muted,
                  fontWeight: FontWeight.w500,
                ),
              ),

              // ── FORM — expands after SOS tap ──
              AnimatedSize(
                duration: const Duration(milliseconds: 400),
                curve: Curves.easeInOut,
                child: _expanded ? _buildForm() : const SizedBox.shrink(),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
      decoration: const BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacitySafe(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.local_fire_department_rounded,
                  color: Colors.white,
                  size: 22,
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'FireFix Kenya',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacitySafe(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.circle, color: Colors.greenAccent, size: 8),
                    SizedBox(width: 5),
                    Text(
                      'LIVE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            'Huduma ya Dharura ya Moto',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 13,
            ),
          ),
          const Text(
            'Ripoti haraka. Msaada unakuja.',
            style: TextStyle(
              color: Colors.white,
              fontSize: 17,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildForm() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Location
          const Text(
            'Mahali Pako',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.dark,
            ),
          ),
          const SizedBox(height: 8),
          LocationCard(
            address: _address,
            isLoading: _locationLoading,
            onRefresh: _fetchLocation,
          ),

          const SizedBox(height: 20),

          // Severity
          SeverityPicker(
            selected: _severity,
            onSelect: (val) => setState(() => _severity = val),
          ),

          const SizedBox(height: 20),

          // Description
          const Text(
            'Maelezo (hiari)',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.dark,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _descriptionController,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText: 'Elezea hali ya moto...',
              hintStyle: TextStyle(color: AppColors.muted),
            ),
          ),

          const SizedBox(height: 16),

          // Phone
          const Text(
            'Nambari yako (hiari)',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.dark,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              hintText: '07XXXXXXXX',
              hintStyle: TextStyle(color: AppColors.muted),
              prefixIcon: Icon(Icons.phone, color: AppColors.muted, size: 20),
            ),
          ),

          const SizedBox(height: 28),

          // Submit
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: _submitting ? null : _submitIncident,
              child: _submitting
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2.5,
                      ),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.fire_truck_rounded, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'TUMA RIPOTI',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1,
                          ),
                        ),
                      ],
                    ),
            ),
          ),

          const SizedBox(height: 16),

          // Emergency contact
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.secondary.withOpacitySafe(0.06),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppColors.secondary.withOpacitySafe(0.15),
              ),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: AppColors.secondary, size: 18),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Piga simu: 0800 723 999 kwa dharura ya haraka',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.secondary,
                      fontWeight: FontWeight.w500,
                    ),
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
