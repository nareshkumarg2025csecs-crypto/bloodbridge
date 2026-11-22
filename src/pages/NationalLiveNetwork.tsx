import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Search, 
  Filter, 
  Layers, 
  RefreshCw, 
  Activity, 
  AlertTriangle,
  Globe,
  Radio,
  Clock,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

// Custom Marker Generator by Facility Type
const createFacilityMarker = (type: string, hasBloodBank: boolean) => {
  let bg = '#1255B5'; // Default Navy/Blue
  let symbol = '🏥';

  if (type === 'MEDICAL_COLLEGE') {
    bg = '#7C3AED'; // Purple
    symbol = '🎓';
  } else if (type === 'LICENSED_BLOOD_BANK' || hasBloodBank) {
    bg = '#E5484D'; // Crimson Red
    symbol = '🩸';
  } else if (type === 'BLOOD_STORAGE_CENTRE') {
    bg = '#F59E0B'; // Amber
    symbol = '📦';
  } else if (type === 'PRIVATE_HOSPITAL') {
    bg = '#0284C7'; // Light Blue
    symbol = '🏥';
  }

  return L.divIcon({
    className: 'custom-national-marker',
    html: `
      <div style="
        background: ${bg};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <div style="transform: rotate(45deg); font-size: 14px;">
          ${symbol}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Map Recenter Helper Component
const ChangeMapView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

interface Facility {
  id: number;
  facilityCode: string;
  name: string;
  type: string;
  ownership: string;
  hasBloodBank: boolean;
  hasComponentFacility: boolean;
  hasRarePhenotypeStorage: boolean;
  hfrId: string | null;
  eraktkoshId: string | null;
  license: string | null;
  address: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  contactEmail: string;
  operatingHours: string;
  verificationStatus: string;
  provenanceSource: string;
  lastSynced: string;
  stock: Array<{
    bloodGroup: string;
    rhFactor: string;
    componentCode: string;
    componentName: string;
    units: number;
    freshness: string;
    provenance: string;
  }>;
  totalStock: number;
}

export const NationalLiveNetwork: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Geographic Scope: 'chennai' (Default) | 'tamilnadu' | 'national'
  const [scope, setScope] = useState<'chennai' | 'tamilnadu' | 'national'>('chennai');

  // Filters
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedComponent, setSelectedComponent] = useState<string>('ALL');
  const [bloodBankOnly, setBloodBankOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map view coordinates based on scope
  const getScopeCenter = (): { center: [number, number]; zoom: number } => {
    if (scope === 'chennai') return { center: [13.0650, 80.2450], zoom: 12 };
    if (scope === 'tamilnadu') return { center: [11.1271, 78.6569], zoom: 8 };
    return { center: [20.5937, 78.9629], zoom: 5 }; // Entire India
  };

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('scope', scope);
      if (selectedType !== 'ALL') params.append('type', selectedType);
      if (bloodBankOnly) params.append('hasBloodBank', 'true');
      if (selectedBloodGroup !== 'ALL') params.append('bloodGroup', selectedBloodGroup);
      if (selectedComponent !== 'ALL') params.append('component', selectedComponent);
      if (searchQuery.trim()) params.append('query', searchQuery.trim());

      const res = await apiClient.get(`/government/facilities?${params.toString()}`);
      const list = res.data.facilities || [];
      setFacilities(list);

      if (list.length > 0 && !selectedFacility) {
        setSelectedFacility(list[0]);
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [scope, selectedType, bloodBankOnly, selectedBloodGroup, selectedComponent]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFacilities();
  };

  const mapConfig = getScopeCenter();

  return (
    <div className="space-y-6">
      {/* Top Banner with Government Emblem & Geographic Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Official Government Datasets Active
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              e-RaktKosh • ABDM HFR • data.gov.in
            </span>
          </div>
          <h1 className="text-2xl font-bold text-navy">National Live Hospital & Blood Bank Network</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Geocoded directory of verified Indian healthcare facilities, licensed transfusion centres, and cold-chain reserves.
          </p>
        </div>

        {/* Scope Toggle: Chennai -> Tamil Nadu -> All India */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-border">
          <button
            onClick={() => setScope('chennai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              scope === 'chennai' ? 'bg-primary text-white shadow-soft' : 'text-text-muted hover:text-navy'
            }`}
          >
            Chennai Hub
          </button>
          <button
            onClick={() => setScope('tamilnadu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              scope === 'tamilnadu' ? 'bg-primary text-white shadow-soft' : 'text-text-muted hover:text-navy'
            }`}
          >
            All Tamil Nadu
          </button>
          <button
            onClick={() => setScope('national')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              scope === 'national' ? 'bg-primary text-white shadow-soft' : 'text-text-muted hover:text-navy'
            }`}
          >
            Entire India
          </button>
        </div>
      </div>

      {/* Safety Notice & Provenance Disclosure */}
      <div className="flex items-start gap-3 p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-950 text-xs">
        <Database className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Dataset Provenance & Clinical Integrity:</span> Healthcare facility directory is synchronized from official data.gov.in and ABDM registries. Transfusion stock quantities reflect confirmed direct laboratory feeds or official portal snapshots. Compatibility, screening, and transfusion release require mandatory medical officer sign-off.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search hospital, district or PIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-border rounded-lg focus:outline-none focus:border-primary font-medium"
          />
        </form>

        {/* Facility Category Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 border border-border rounded-lg text-navy font-semibold focus:outline-none focus:border-primary"
        >
          <option value="ALL">All Facility Types</option>
          <option value="GOVERNMENT_HOSPITAL">Government Hospitals</option>
          <option value="PRIVATE_HOSPITAL">Private Hospitals</option>
          <option value="LICENSED_BLOOD_BANK">Licensed Blood Banks</option>
          <option value="BLOOD_STORAGE_CENTRE">Blood Storage Centres</option>
          <option value="MEDICAL_COLLEGE">Medical Colleges</option>
        </select>

        {/* Blood Group */}
        <select
          value={selectedBloodGroup}
          onChange={(e) => setSelectedBloodGroup(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 border border-border rounded-lg text-navy font-semibold focus:outline-none focus:border-primary"
        >
          <option value="ALL">All Blood Groups</option>
          <option value="O+">O+ (RhD Positive)</option>
          <option value="O-">O- (Universal Red Cells)</option>
          <option value="A+">A+ (RhD Positive)</option>
          <option value="A-">A- (RhD Negative)</option>
          <option value="B+">B+ (RhD Positive)</option>
          <option value="B-">B- (RhD Negative)</option>
          <option value="AB+">AB+ (RhD Positive)</option>
          <option value="AB-">AB- (RhD Negative)</option>
          <option value="Bombay Oh">Bombay Phenotype (Oh)</option>
          <option value="Rh-Null">Rh-Null (Golden Blood)</option>
        </select>

        {/* Component Filter */}
        <select
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 border border-border rounded-lg text-navy font-semibold focus:outline-none focus:border-primary"
        >
          <option value="ALL">All Components</option>
          <option value="PRBC">Packed Red Blood Cells (PRBC)</option>
          <option value="WHOLE_BLOOD">Whole Blood</option>
          <option value="PLATELETS">Single Donor Platelets (SDP)</option>
          <option value="FFP">Fresh Frozen Plasma</option>
        </select>

        {/* Has Blood Bank Only Toggle */}
        <button
          onClick={() => setBloodBankOnly(!bloodBankOnly)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
            bloodBankOnly
              ? 'bg-red-600 text-white border-red-600 shadow-sm'
              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          }`}
        >
          Blood Centres Only (15)
        </button>

        <button
          onClick={fetchFacilities}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Live
        </button>
      </div>

      {/* Main Grid: Interactive Full-Scale Map + Facility Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map Pane (2 Cols) */}
        <div className="lg:col-span-2 h-[680px] rounded-2xl overflow-hidden border border-border shadow-soft relative z-0">
          <MapContainer
            center={mapConfig.center}
            zoom={mapConfig.zoom}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <ChangeMapView center={mapConfig.center} zoom={mapConfig.zoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {facilities.map((fac) => (
              <Marker
                key={fac.facilityCode}
                position={[fac.latitude, fac.longitude]}
                icon={createFacilityMarker(fac.type, fac.hasBloodBank)}
                eventHandlers={{
                  click: () => setSelectedFacility(fac),
                }}
              >
                <Popup className="custom-hospital-popup">
                  <div className="p-1 space-y-1 max-w-[240px]">
                    <div className="font-bold text-navy text-xs leading-tight">{fac.name}</div>
                    <div className="text-[10px] text-text-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> {fac.district}, {fac.state}
                    </div>
                    {fac.hasBloodBank && (
                      <div className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        Licensed Blood Centre • {fac.totalStock} Units
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedFacility(fac)}
                      className="w-full mt-2 py-1 bg-primary text-white text-[11px] font-medium rounded hover:bg-primary-600 transition"
                    >
                      View Government Record
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Selected Facility Details Sidebar (1 Col) */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-soft flex flex-col justify-between h-[680px] overflow-y-auto space-y-5">
          {selectedFacility ? (
            <div className="space-y-4">
              {/* Header Badges */}
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-800">
                    {selectedFacility.type.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedFacility.ownership}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {selectedFacility.verificationStatus}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-navy leading-snug">{selectedFacility.name}</h2>
                <p className="text-xs text-text-muted mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-primary mt-0.5" />
                  <span>{selectedFacility.address}, PIN: {selectedFacility.pincode}</span>
                </p>
              </div>

              {/* Government Registry Identifiers */}
              <div className="p-3 bg-slate-50 rounded-xl border border-border/80 text-xs space-y-1.5">
                <div className="font-semibold text-navy text-[11px] uppercase tracking-wider">
                  Official Registry Metadata
                </div>
                {selectedFacility.hfrId && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">ABDM HFR ID:</span>
                    <span className="font-mono font-bold text-navy">{selectedFacility.hfrId}</span>
                  </div>
                )}
                {selectedFacility.eraktkoshId && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">e-RaktKosh Code:</span>
                    <span className="font-mono font-bold text-red-700">{selectedFacility.eraktkoshId}</span>
                  </div>
                )}
                {selectedFacility.license && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">CDSCO / State License:</span>
                    <span className="font-mono font-medium text-navy">{selectedFacility.license}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Coordinates:</span>
                  <span className="font-mono text-text-muted">
                    {selectedFacility.latitude.toFixed(6)}, {selectedFacility.longitude.toFixed(6)}
                  </span>
                </div>
              </div>

              {/* Stock Snapshot from Official Feed */}
              {selectedFacility.hasBloodBank ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-primary" /> Transfusion Stock Reserves
                    </h3>
                    <span className="text-xs font-bold text-primary">{selectedFacility.totalStock} Units</span>
                  </div>

                  {selectedFacility.stock && selectedFacility.stock.length > 0 ? (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {selectedFacility.stock.map((stk, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl border border-border bg-white flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-navy">{stk.bloodGroup}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                {stk.componentCode}
                              </span>
                            </div>
                            <div className="text-[10px] text-text-muted mt-0.5">
                              {stk.componentName} • {stk.freshness.replace(/_/g, ' ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-extrabold text-primary">{stk.units}</div>
                            <div className="text-[9px] text-text-muted">units</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-dashed border-border rounded-xl text-center text-xs text-text-muted">
                      No stock records listed on current synchronized portal snapshot.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-border rounded-xl text-xs text-text-muted">
                  This facility provides acute inpatient medical care without an independent on-site blood storage centre. Emergency blood units are requisitioned via nearby regional blood hubs.
                </div>
              )}

              {/* Provenance Footer */}
              <div className="p-3 bg-slate-50 border border-border/80 rounded-xl text-xs space-y-1">
                <div className="text-[11px] font-semibold text-navy">Data Source Attribution</div>
                <div className="text-[11px] text-text-muted">{selectedFacility.provenanceSource}</div>
                <div className="text-[10px] text-text-muted">
                  Synchronized: {new Date(selectedFacility.lastSynced).toLocaleString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                {selectedFacility.contactPhone && (
                  <a
                    href={`tel:${selectedFacility.contactPhone}`}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-600 transition shadow-soft"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Hospital ({selectedFacility.contactPhone})
                  </a>
                )}
                {selectedFacility.hasBloodBank && (
                  <a
                    href="/requests"
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 transition"
                  >
                    Initiate Inter-Hospital Requisition
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
              <Building2 className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-navy text-sm">Select a Facility</h3>
              <p className="text-xs mt-1 max-w-[220px]">
                Click any hospital or blood bank pin on the map to inspect official registry metadata, licensed storage, and stock reserves.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
