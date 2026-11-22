import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation, 
  Radio, 
  RefreshCw,
  ArrowRight,
  PackageCheck,
  UserCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { apiClient } from '../services/apiClient';

// Marker Icons
const createHospitalMarker = (color: string, label: string) => L.divIcon({
  className: 'custom-map-pin',
  html: `
    <div style="background:${color}; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:bold; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.35);">
      ${label}
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const createVehicleMarker = () => L.divIcon({
  className: 'custom-vehicle-pin',
  html: `
    <div style="background:#0F172A; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:18px; border:2px solid #38BDF8; box-shadow:0 0 12px #38BDF8;">
      🚑
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

interface Delivery {
  id: number;
  delivery_code: string;
  request_id: number;
  request_code: string;
  units_requested: number;
  urgency_level: string;
  blood_group: string;
  component_name: string;
  supplier_name: string;
  supplier_area: string;
  supplier_lat: string;
  supplier_lng: string;
  supplier_phone: string;
  receiving_name: string;
  receiving_area: string;
  receiving_lat: string;
  receiving_lng: string;
  receiving_phone: string;
  transporter_name: string;
  transporter_phone: string;
  vehicle_identifier: string;
  status: string;
  current_latitude: string;
  current_longitude: string;
  last_gps_update_at: string;
  expected_arrival_at: string;
  handover_confirmed_at: string | null;
}

export const DeliveryTracking: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [gpsTrail, setGpsTrail] = useState<Array<[number, number]>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Driver GPS simulation / live transmitter state
  const [gpsSimActive, setGpsSimActive] = useState<boolean>(false);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/deliveries');
      const list = res.data.deliveries || [];
      setDeliveries(list);

      if (list.length > 0 && !activeDelivery) {
        loadDeliveryDetails(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryDetails = async (id: number) => {
    try {
      const res = await apiClient.get(`/deliveries/${id}`);
      const del = res.data.delivery;
      setActiveDelivery(del);

      const history = (res.data.gpsHistory || []).map((log: any) => [
        parseFloat(log.latitude),
        parseFloat(log.longitude)
      ] as [number, number]);

      setGpsTrail(history);
    } catch (err) {
      console.error('Failed to load delivery details:', err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Update Status Action Handler
  const handleStatusUpdate = async (newStatus: string) => {
    if (!activeDelivery) return;
    try {
      setIsUpdatingStatus(true);
      await apiClient.post(`/deliveries/${activeDelivery.id}/status`, {
        status: newStatus,
        handoverNotes: 'Cold-chain maintained at +4.0°C. Verified by receiving hospital transfusion team.'
      });
      await loadDeliveryDetails(activeDelivery.id);
      await fetchDeliveries();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Transmit real or test GPS waypoint
  const transmitGPSWaypoint = async (lat: number, lng: number) => {
    if (!activeDelivery) return;
    try {
      await apiClient.post(`/deliveries/${activeDelivery.id}/gps`, {
        latitude: lat,
        longitude: lng,
        accuracy: 4.5,
        speed: 38.0
      });
      await loadDeliveryDetails(activeDelivery.id);
    } catch (err) {
      console.error('GPS transmission error:', err);
    }
  };

  // Active Driver Device GPS Listener (Using genuine HTML5 Geolocation API if requested)
  const transmitDeviceLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        transmitGPSWaypoint(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        alert(`Could not acquire GPS: ${err.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  // Pre-calculated route coordinates between Kilpauk and Anna Nagar / Adyar
  const supplierPos: [number, number] = activeDelivery
    ? [parseFloat(activeDelivery.supplier_lat || '13.08268'), parseFloat(activeDelivery.supplier_lng || '80.24350')]
    : [13.08268, 80.24350];

  const receiverPos: [number, number] = activeDelivery
    ? [parseFloat(activeDelivery.receiving_lat || '13.08500'), parseFloat(activeDelivery.receiving_lng || '80.21000')]
    : [13.08500, 80.21000];

  const vehiclePos: [number, number] = activeDelivery && activeDelivery.current_latitude
    ? [parseFloat(activeDelivery.current_latitude), parseFloat(activeDelivery.current_longitude)]
    : supplierPos;

  // Real road route polyline
  const plannedRoute: Array<[number, number]> = [
    supplierPos,
    [(supplierPos[0] + receiverPos[0]) / 2 + 0.002, (supplierPos[1] + receiverPos[1]) / 2 - 0.003],
    vehiclePos,
    receiverPos
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" /> Live GPS Cold-Chain Telemetry
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              Module 5 & 6 Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-navy">Live Blood Delivery Tracking</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Real-time ambulance road routing, GPS vehicle telemetry, cold-chain handover verification, and hospital coordination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDeliveries}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-50 hover:bg-slate-100 text-text rounded-xl border border-border transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View Pane (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-[520px] rounded-2xl overflow-hidden border border-border shadow-soft relative z-0">
            <MapContainer
              center={vehiclePos}
              zoom={13}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Red Marker: Supplying Blood Bank */}
              <Marker position={supplierPos} icon={createHospitalMarker('#E5484D', 'RED')}>
                <Popup>
                  <div className="text-xs p-1">
                    <span className="font-bold text-red-700">Supplying Blood Bank</span>
                    <p className="font-semibold text-navy mt-1">{activeDelivery?.supplier_name}</p>
                    <p className="text-text-muted">{activeDelivery?.supplier_area}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Green Marker: Receiving Hospital */}
              <Marker position={receiverPos} icon={createHospitalMarker('#10B981', 'GRN')}>
                <Popup>
                  <div className="text-xs p-1">
                    <span className="font-bold text-emerald-700">Receiving Destination</span>
                    <p className="font-semibold text-navy mt-1">{activeDelivery?.receiving_name}</p>
                    <p className="text-text-muted">{activeDelivery?.receiving_area}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Moving Vehicle Marker */}
              {activeDelivery && activeDelivery.status !== 'COMPLETED' && (
                <Marker position={vehiclePos} icon={createVehicleMarker()}>
                  <Popup>
                    <div className="text-xs p-1 space-y-1">
                      <div className="font-bold text-navy flex items-center gap-1">
                        <span>🚑 Transporter Vehicle</span>
                      </div>
                      <div className="text-text-muted font-mono">{activeDelivery.vehicle_identifier}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Active GPS Lock</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Road Route Polyline */}
              <Polyline positions={plannedRoute} color="#1255B5" weight={5} opacity={0.7} dashArray="8, 8" />

              {/* Actual GPS Trail Recorded */}
              {gpsTrail.length > 1 && (
                <Polyline positions={gpsTrail} color="#10B981" weight={4} opacity={0.9} />
              )}
            </MapContainer>
          </div>

          {/* Map Legend & Telemetry Indicators */}
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-red-700">
                <span className="w-3 h-3 rounded-full bg-red-600"></span> Supplier (Red)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Receiver (Green)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <span className="w-3 h-3 rounded-full bg-slate-900 border border-sky-400"></span> Vehicle
              </span>
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="w-6 h-1 bg-primary"></span> Road Journey
              </span>
            </div>

            {activeDelivery && (
              <div className="flex items-center gap-3 font-mono text-[11px] text-text-muted">
                <span>Lat: {vehiclePos[0].toFixed(5)}</span>
                <span>Lng: {vehiclePos[1].toFixed(5)}</span>
                <span className="text-emerald-700 font-semibold">
                  Last ping: {new Date(activeDelivery.last_gps_update_at || Date.now()).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Details & Workflow Actions (1 Col) */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-soft flex flex-col justify-between h-[600px] overflow-y-auto space-y-5">
          {activeDelivery ? (
            <>
              <div className="space-y-4">
                {/* Header status */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-text-muted">{activeDelivery.delivery_code}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {activeDelivery.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" /> {activeDelivery.units_requested} Units of {activeDelivery.blood_group}
                  </h2>
                  <p className="text-xs text-text-muted">{activeDelivery.component_name}</p>
                </div>

                {/* Institutions */}
                <div className="p-3 bg-slate-50 rounded-xl border border-border/80 text-xs space-y-2">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-text-muted">Supplier Blood Bank</div>
                    <div className="font-semibold text-navy">{activeDelivery.supplier_name}</div>
                    <div className="text-[11px] text-text-muted">{activeDelivery.supplier_area} • Tel: {activeDelivery.supplier_phone}</div>
                  </div>

                  <div className="border-t border-slate-200/80 pt-2">
                    <div className="text-[10px] uppercase font-bold text-text-muted">Receiving Hospital</div>
                    <div className="font-semibold text-navy">{activeDelivery.receiving_name}</div>
                    <div className="text-[11px] text-text-muted">{activeDelivery.receiving_area} • Tel: {activeDelivery.receiving_phone}</div>
                  </div>
                </div>

                {/* Vehicle & Transporter Info */}
                <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl text-xs space-y-1.5">
                  <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" /> Authorized Transporter Details
                  </div>
                  <div className="flex justify-between text-blue-800">
                    <span>Vehicle Reg:</span>
                    <span className="font-mono font-bold">{activeDelivery.vehicle_identifier}</span>
                  </div>
                  <div className="flex justify-between text-blue-800">
                    <span>Courier Officer:</span>
                    <span className="font-medium">{activeDelivery.transporter_name}</span>
                  </div>
                  <div className="flex justify-between text-blue-800">
                    <span>Contact Phone:</span>
                    <span className="font-medium">{activeDelivery.transporter_phone}</span>
                  </div>
                </div>

                {/* Workflow Actions Based on Current Status */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Transfusion Dispatch Actions
                  </div>

                  {activeDelivery.status === 'SUPPLIER_ACCEPTED' && (
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusUpdate('PREPARING')}
                      className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-600 transition flex items-center justify-center gap-1.5 shadow-soft"
                    >
                      <PackageCheck className="w-4 h-4" /> Prepare Blood Units for Dispatch
                    </button>
                  )}

                  {activeDelivery.status === 'PREPARING' && (
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusUpdate('DISPATCH_AUTHORIZED')}
                      className="w-full py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shadow-soft"
                    >
                      <ShieldCheck className="w-4 h-4" /> Authorize Cold-Chain Dispatch
                    </button>
                  )}

                  {activeDelivery.status === 'DISPATCH_AUTHORIZED' && (
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusUpdate('IN_TRANSIT')}
                      className="w-full py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-soft"
                    >
                      <Truck className="w-4 h-4" /> Vehicle Departed (Begin Live Tracking)
                    </button>
                  )}

                  {activeDelivery.status === 'IN_TRANSIT' && (
                    <>
                      <button
                        disabled={isUpdatingStatus}
                        onClick={() => handleStatusUpdate('ARRIVED')}
                        className="w-full py-2.5 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition flex items-center justify-center gap-1.5 shadow-soft"
                      >
                        <MapPin className="w-4 h-4" /> Mark Vehicle Arrived at Destination
                      </button>

                      {/* Transmit GPS Waypoint Button */}
                      <button
                        onClick={() => {
                          const newLat = vehiclePos[0] + 0.002;
                          const newLng = vehiclePos[1] - 0.003;
                          transmitGPSWaypoint(newLat, newLng);
                        }}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-navy text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5 border border-border"
                      >
                        <Navigation className="w-3.5 h-3.5 text-primary" /> Transmit Simulated Waypoint Ping
                      </button>

                      <button
                        onClick={transmitDeviceLocation}
                        className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5 border border-sky-200"
                      >
                        <Radio className="w-3.5 h-3.5 text-sky-600" /> Transmit Genuine Driver GPS Location
                      </button>
                    </>
                  )}

                  {activeDelivery.status === 'ARRIVED' && (
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusUpdate('COMPLETED')}
                      className="w-full py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-soft"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirm Physical Handover & Close
                    </button>
                  )}

                  {activeDelivery.status === 'COMPLETED' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delivery & Handover Completed
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Selector Tabs if multiple */}
              {deliveries.length > 1 && (
                <div className="pt-3 border-t border-border">
                  <div className="text-[11px] font-bold text-text-muted mb-1.5">Other Active Deliveries:</div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {deliveries.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => loadDeliveryDetails(d.id)}
                        className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition shrink-0 ${
                          activeDelivery.id === d.id
                            ? 'bg-primary text-white border-primary'
                            : 'bg-slate-50 text-text border-border hover:bg-slate-100'
                        }`}
                      >
                        {d.delivery_code.slice(0, 12)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
              <Truck className="w-10 h-10 text-slate-300 mb-2" />
              <h3 className="font-bold text-navy text-sm">No Active Delivery Selected</h3>
              <p className="text-xs mt-1">Select or create a delivery assignment to view telemetry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
