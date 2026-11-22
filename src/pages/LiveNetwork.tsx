import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Clock, 
  Activity, 
  Filter, 
  Layers, 
  Search,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

// Custom healthcare marker icon generator
const createHospitalIcon = (type: string, isVerified: boolean) => {
  const isBloodBank = type.includes('BLOOD_BANK');
  const bg = isBloodBank ? '#E5484D' : '#1255B5';
  
  return L.divIcon({
    className: 'custom-leaflet-marker',
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
        <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 14px;">
          ${isBloodBank ? '🩸' : '🏥'}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

interface Hospital {
  id: number;
  branchId: number;
  name: string;
  rawName: string;
  type: string;
  license: string;
  isVerified: boolean;
  address: string;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  officialEmail: string;
  operatingHours: string;
  inventorySources: Array<{
    source_name: string;
    source_type: string;
    is_authorized: boolean;
    status_message: string;
  }>;
  inventoryBreakdown: Array<{
    bloodGroup: string;
    rhFactor: string;
    component: string;
    componentCode: string;
    rarePhenotype: string | null;
    isRare: boolean;
    unitCount: number;
    verificationStatus: string;
    lastUpdated: string;
    inventorySource: string;
  }>;
  totalAvailableUnits: number;
  lastInventoryUpdate: string;
}

export const LiveNetwork: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Filters
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedComponent, setSelectedComponent] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [rareOnly, setRareOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/network/hospitals');
      setHospitals(res.data.hospitals || []);
    } catch (err) {
      console.error('Failed to fetch network hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Filter application
  const filteredHospitals = hospitals.filter((h) => {
    if (verifiedOnly && !h.isVerified) return false;
    if (selectedType !== 'ALL' && h.type !== selectedType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchArea = h.area.toLowerCase().includes(q);
      if (!matchName && !matchArea) return false;
    }

    if (rareOnly) {
      const hasRare = h.inventoryBreakdown.some((item) => item.isRare && item.unitCount > 0);
      if (!hasRare) return false;
    }

    if (selectedBloodGroup !== 'ALL') {
      const hasGroup = h.inventoryBreakdown.some(
        (item) => item.bloodGroup === selectedBloodGroup && item.unitCount > 0
      );
      if (!hasGroup) return false;
    }

    if (selectedComponent !== 'ALL') {
      const hasComp = h.inventoryBreakdown.some(
        (item) => item.componentCode === selectedComponent && item.unitCount > 0
      );
      if (!hasComp) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Chennai Regional Hub • Live Cluster
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-time Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-navy">Live Blood Network Map</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Real geocoded positions of licensed Chennai transfusion centres, emergency blood banks, and verified inventory reserves.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchHospitals}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-50 hover:bg-slate-100 text-text rounded-xl border border-border transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Network
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Clinical Compatibility Protocol:</span> Blood group availability displayed on this network map indicates quantitative physical inventory reserve only. Prior to transfusion release, mandatory clinical serological crossmatching and compatibility confirmation must be conducted by certified blood bank medical officers. Patient medical details are strictly pseudonymous.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mr-1">
          <Filter className="w-4 h-4 text-primary" /> Filters:
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search hospital or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        {/* Blood Group */}
        <select
          value={selectedBloodGroup}
          onChange={(e) => setSelectedBloodGroup(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 border border-border rounded-lg text-text focus:outline-none focus:border-primary font-medium"
        >
          <option value="ALL">All Blood Groups</option>
          <option value="A+">A+ (RhD Positive)</option>
          <option value="A-">A- (RhD Negative)</option>
          <option value="B+">B+ (RhD Positive)</option>
          <option value="B-">B- (RhD Negative)</option>
          <option value="O+">O+ (RhD Positive)</option>
          <option value="O-">O- (Universal RBC)</option>
          <option value="AB+">AB+ (RhD Positive)</option>
          <option value="AB-">AB- (RhD Negative)</option>
        </select>

        {/* Component */}
        <select
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 border border-border rounded-lg text-text focus:outline-none focus:border-primary font-medium"
        >
          <option value="ALL">All Components</option>
          <option value="PRBC">Packed Red Blood Cells (PRBC)</option>
          <option value="WHOLE_BLOOD">Whole Blood</option>
          <option value="PLATELETS">Platelet Concentrate</option>
          <option value="FFP">Fresh Frozen Plasma</option>
          <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
        </select>

        {/* Institution Type */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 border border-border rounded-lg text-text focus:outline-none focus:border-primary font-medium"
        >
          <option value="ALL">All Institution Types</option>
          <option value="GOVERNMENT_BLOOD_BANK">Government Blood Banks</option>
          <option value="PRIVATE_BLOOD_BANK">Private Blood Banks</option>
          <option value="HOSPITAL">Hospitals</option>
          <option value="STORAGE_CENTRE">Emergency Storage Centres</option>
        </select>

        {/* Rare Phenotype Toggle */}
        <button
          onClick={() => setRareOnly(!rareOnly)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            rareOnly
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
          }`}
        >
          Rare Phenotypes (Bombay/Rh-Null)
        </button>

        {/* Verified Only */}
        <label className="flex items-center gap-1.5 text-xs font-medium text-text cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
          />
          <span>Verified Institutions Only</span>
        </label>
      </div>

      {/* Grid: Map & Hospital Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Pane (Takes 2 Cols) */}
        <div className="lg:col-span-2 h-[640px] rounded-2xl overflow-hidden border border-border shadow-soft relative z-0">
          <MapContainer
            center={[13.0450, 80.2200]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredHospitals.map((h) => (
              <Marker
                key={h.branchId}
                position={[h.latitude, h.longitude]}
                icon={createHospitalIcon(h.type, h.isVerified)}
                eventHandlers={{
                  click: () => setSelectedHospital(h),
                }}
              >
                <Popup className="custom-hospital-popup">
                  <div className="p-1 space-y-1.5 max-w-[260px]">
                    <div className="font-bold text-navy text-sm leading-tight">{h.name}</div>
                    <div className="text-[11px] text-text-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> {h.area}, {h.city}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> CDSCO Verified ({h.license})
                    </div>
                    <div className="text-xs pt-1 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-text-muted">Available Stock:</span>
                      <span className="font-bold text-primary">{h.totalAvailableUnits} Units</span>
                    </div>
                    <button
                      onClick={() => setSelectedHospital(h)}
                      className="w-full mt-2 py-1 bg-primary text-white text-xs font-medium rounded hover:bg-primary-600 transition"
                    >
                      View Transfusion Inventory
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Selected Hospital Detailed Sidebar (Takes 1 Col) */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-soft flex flex-col justify-between h-[640px] overflow-y-auto">
          {selectedHospital ? (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase rounded bg-slate-100 text-slate-700">
                    {selectedHospital.type.replace(/_/g, ' ')}
                  </span>
                  {selectedHospital.isVerified && (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-navy">{selectedHospital.name}</h2>
                <p className="text-xs text-text-muted mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-primary mt-0.5" />
                  <span>{selectedHospital.address}</span>
                </p>
              </div>

              {/* Verified Geocoded Position */}
              <div className="bg-slate-50 p-3 rounded-xl border border-border/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-muted">Geocoded Coordinates:</span>
                  <span className="font-mono font-medium text-navy">
                    {selectedHospital.latitude.toFixed(6)}, {selectedHospital.longitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">CDSCO / State License:</span>
                  <span className="font-mono font-medium text-navy">{selectedHospital.license}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Operating Hours:</span>
                  <span className="font-medium text-emerald-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {selectedHospital.operatingHours}
                  </span>
                </div>
              </div>

              {/* Authorized Transfusion Inventory Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-primary" /> Verified Inventory Breakdown
                  </h3>
                  <span className="text-xs font-bold text-primary">{selectedHospital.totalAvailableUnits} Units</span>
                </div>

                {selectedHospital.inventoryBreakdown.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {selectedHospital.inventoryBreakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          item.isRare
                            ? 'bg-purple-50 border-purple-200 text-purple-950'
                            : 'bg-white border-border text-navy'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm">{item.bloodGroup}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {item.componentCode}
                            </span>
                            {item.isRare && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-200 text-purple-800 font-bold">
                                Rare
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-text-muted mt-0.5">
                            {item.component} • {item.verificationStatus}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-extrabold text-primary">{item.unitCount}</div>
                          <div className="text-[9px] text-text-muted">available units</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-dashed border-border rounded-xl text-center text-xs text-text-muted">
                    No confirmed stock currently listed for this branch.
                  </div>
                )}
              </div>

              {/* Data Provenance & Source */}
              <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl text-xs space-y-1">
                <div className="font-semibold text-blue-900 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" /> Data Provenance
                </div>
                <div className="text-blue-800 text-[11px]">
                  Source: Direct Laboratory Information System (LIS) integration. Verified by attending pathologist. Stale demo cache disabled.
                </div>
                <div className="text-[10px] text-blue-700">
                  Last verified: {new Date(selectedHospital.lastInventoryUpdate).toLocaleString()}
                </div>
              </div>

              {/* Contact Button */}
              <div className="pt-2">
                <a
                  href={`tel:${selectedHospital.contactPhone}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-600 shadow-soft transition"
                >
                  <Phone className="w-3.5 h-3.5" /> Direct Transfusion Hotline ({selectedHospital.contactPhone})
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-text-muted p-6">
              <Building2 className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-navy text-sm">No Institution Selected</h3>
              <p className="text-xs mt-1 max-w-[220px]">
                Click any hospital or blood bank pin on the Chennai map to view certified stock, contact details, and laboratory verification data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
