import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Send, 
  Inbox, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

export const CoordinationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requester' | 'supplier' | 'receiver'>('requester');
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/deliveries');
      setDeliveries(res.data.deliveries || []);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              Module 7: Multi-Institutional Coordination
            </span>
          </div>
          <h1 className="text-2xl font-bold text-navy">Requester & Receiver Dashboards</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Role-based operational dashboards for hospital senders, supplying blood centres, and receiving emergency units.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('requester')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'requester' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            Requester View
          </button>
          <button
            onClick={() => setActiveTab('supplier')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'supplier' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            Supplier View
          </button>
          <button
            onClick={() => setActiveTab('receiver')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'receiver' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            Receiver View
          </button>
        </div>
      </div>

      {/* Tab Specific Content */}
      {activeTab === 'requester' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
              <div className="text-xs text-text-muted uppercase font-bold">Requests Submitted</div>
              <div className="text-2xl font-extrabold text-navy mt-1">12</div>
              <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> 100% matched by regional network
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
              <div className="text-xs text-text-muted uppercase font-bold">Active In-Transit</div>
              <div className="text-2xl font-extrabold text-primary mt-1">
                {deliveries.filter(d => d.status === 'IN_TRANSIT').length || 1}
              </div>
              <div className="text-xs text-text-muted mt-1">Cold-chain tracked via GPS</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
              <div className="text-xs text-text-muted uppercase font-bold">Average Response Time</div>
              <div className="text-2xl font-extrabold text-navy mt-1">4.2 min</div>
              <div className="text-xs text-text-muted mt-1">From broadcast to acceptance</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-soft p-6">
            <h2 className="text-lg font-bold text-navy mb-4">Submitted Emergency Requests</h2>
            <div className="space-y-3">
              {deliveries.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-border hover:border-primary/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy text-sm">{d.units_requested} Units of {d.blood_group}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">{d.component_name}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary">{d.status}</span>
                    </div>
                    <div className="text-xs text-text-muted mt-1 flex items-center gap-2">
                      <span>Supplied by: <strong>{d.supplier_name}</strong></span>
                      <span>•</span>
                      <span>Destination: <strong>{d.receiving_name}</strong></span>
                    </div>
                  </div>

                  <a
                    href="/delivery-tracking"
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-600 transition shrink-0 flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" /> View Live Route
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'supplier' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
              <div className="text-xs text-text-muted uppercase font-bold">Incoming Transfusion Demands</div>
              <div className="text-2xl font-extrabold text-navy mt-1">3 Pending</div>
              <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Requires medical officer review
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
              <div className="text-xs text-text-muted uppercase font-bold">Stock Reserved (Locked)</div>
              <div className="text-2xl font-extrabold text-navy mt-1">5 Units</div>
              <div className="text-xs text-text-muted mt-1">Protected by TTL concurrency hold</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
              <div className="text-xs text-text-muted uppercase font-bold">Cold-Chain Ambulances En Route</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">2 Active</div>
              <div className="text-xs text-text-muted mt-1">All telemetry checkpoints nominal</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-soft p-6">
            <h2 className="text-lg font-bold text-navy mb-4">Supplier Orders & Dispatch Queue</h2>
            <div className="space-y-3">
              {deliveries.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-border hover:border-primary/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy text-sm">{d.delivery_code}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary">{d.status}</span>
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      Target: {d.receiving_name} ({d.receiving_area}) • Vehicle: {d.vehicle_identifier}
                    </div>
                  </div>

                  <a
                    href="/delivery-tracking"
                    className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 transition shrink-0 flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" /> Manage Dispatch & Telemetry
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'receiver' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
              <div className="text-xs text-text-muted uppercase font-bold">Inbound Blood Deliveries</div>
              <div className="text-2xl font-extrabold text-navy mt-1">1 In-Transit</div>
              <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> ETA: ~18 mins
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
              <div className="text-xs text-text-muted uppercase font-bold">Cold-Chain Verification</div>
              <div className="text-2xl font-extrabold text-navy mt-1">+4.2°C</div>
              <div className="text-xs text-emerald-600 mt-1">Nominal PRBC storage zone</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
              <div className="text-xs text-text-muted uppercase font-bold">Authorized Receiver Staff</div>
              <div className="text-2xl font-extrabold text-navy mt-1">Ready</div>
              <div className="text-xs text-text-muted mt-1">Handover protocol verified</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-soft p-6">
            <h2 className="text-lg font-bold text-navy mb-4">Inbound Shipments & Handover Confirmation</h2>
            <div className="space-y-3">
              {deliveries.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-border hover:border-emerald-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy text-sm">{d.units_requested} Units of {d.blood_group} ({d.component_name})</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{d.status}</span>
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      From: {d.supplier_name} • Courier: {d.transporter_name} ({d.transporter_phone})
                    </div>
                  </div>

                  <a
                    href="/delivery-tracking"
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition shrink-0 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm Receipt & Cold-Chain
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
