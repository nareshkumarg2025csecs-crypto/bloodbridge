import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  ArrowUpRight,
  Server
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface SourceConfig {
  id: number;
  source_key: string;
  source_name: string;
  portal_url: string;
  technical_contact_email: string;
  api_base_url: string;
  auth_mechanism: string;
  connection_status: string;
  authorization_status_message: string;
  refresh_schedule: string;
  total_records_imported: number;
  total_records_updated: number;
  last_synced_at: string;
}

interface SyncSummary {
  totalFacilitiesImported: number;
  licensedBloodBanks: number;
  statesCovered: number;
  activeIntegrationsCount: number;
  pendingApprovalsCount: number;
}

export const DataIntegrations: React.FC = () => {
  const [sources, setSources] = useState<SourceConfig[]>([]);
  const [summary, setSummary] = useState<SyncSummary | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingKey, setSyncingKey] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/government/integrations');
      setSources(res.data.sources || []);
      setSummary(res.data.summary || null);
      setRecentLogs(res.data.recentSyncLogs || []);
    } catch (err) {
      console.error('Error fetching integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncTrigger = async (sourceKey: string) => {
    try {
      setSyncingKey(sourceKey);
      setActionNotice(null);
      const res = await apiClient.post(`/government/sync/${sourceKey}`);
      setActionNotice(res.data.message);
      await fetchData();
    } catch (err: any) {
      setActionNotice(err.message || 'Synchronization request failed');
    } finally {
      setSyncingKey(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'PUBLIC_DATASET_AVAILABLE' || status === 'CONNECTED_AND_VERIFIED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {status.replace(/_/g, ' ')}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              National Health Architecture Integration Layer
            </span>
          </div>
          <h1 className="text-2xl font-bold text-navy">Government Health Data Integrations</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Live status of official Indian government portal connectors, dataset imports, and regulatory API approvals.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-text rounded-xl border border-border transition text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Registry
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
            <div className="text-xs font-bold text-text-muted uppercase">Health Facilities Registered</div>
            <div className="text-3xl font-extrabold text-navy mt-1">{summary.totalFacilitiesImported}</div>
            <div className="text-xs text-text-muted mt-1">Sourced from official government records</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
            <div className="text-xs font-bold text-text-muted uppercase">Licensed Blood Banks</div>
            <div className="text-3xl font-extrabold text-red-600 mt-1">{summary.licensedBloodBanks}</div>
            <div className="text-xs text-text-muted mt-1">CDSCO & State Drug Control approved</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
            <div className="text-xs font-bold text-text-muted uppercase">Active Public Datasets</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">{summary.activeIntegrationsCount}</div>
            <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> data.gov.in & State Portals
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-border shadow-soft">
            <div className="text-xs font-bold text-text-muted uppercase">Production API Approvals Pending</div>
            <div className="text-3xl font-extrabold text-amber-600 mt-1">{summary.pendingApprovalsCount}</div>
            <div className="text-xs text-amber-700 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> e-RaktKosh / ABDM Sandbox
            </div>
          </div>
        </div>
      )}

      {/* Source Connectors Table */}
      <div className="bg-white rounded-2xl border border-border shadow-soft p-6">
        <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" /> Official Government Portals & Adapters
        </h2>

        <div className="space-y-4">
          {sources.map((src) => (
            <div
              key={src.source_key}
              className="p-5 rounded-xl border border-border bg-slate-50/50 hover:bg-white transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-navy text-sm">{src.source_name}</h3>
                  {getStatusBadge(src.connection_status)}
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {src.auth_mechanism}
                  </span>
                </div>

                <p className="text-xs text-text-muted">
                  {src.authorization_status_message}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-text-muted pt-1 flex-wrap">
                  <span>Portal: <a href={src.portal_url} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline inline-flex items-center gap-0.5">{src.portal_url} <ArrowUpRight className="w-3 h-3" /></a></span>
                  <span>Contact: <strong>{src.technical_contact_email}</strong></span>
                  <span>Schedule: <strong>{src.refresh_schedule}</strong></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  disabled={syncingKey === src.source_key}
                  onClick={() => handleSyncTrigger(src.source_key)}
                  className="w-full sm:w-auto px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-600 transition shadow-soft flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingKey === src.source_key ? 'animate-spin' : ''}`} />
                  {syncingKey === src.source_key ? 'Validating...' : 'Trigger Sync'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-border shadow-soft p-6">
        <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" /> Synchronization & Integrity Audit Trail
        </h2>

        {recentLogs.length > 0 ? (
          <div className="divide-y divide-border/60">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy">{log.source_key}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-text-muted">{log.sync_type}</span>
                  </div>
                  <p className="text-text-muted text-[11px] mt-0.5">{log.error_summary}</p>
                </div>

                <div className="text-right text-[11px] text-text-muted shrink-0">
                  <div>Duration: {log.execution_duration_ms} ms</div>
                  <div>{new Date(log.started_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-text-muted p-4 text-center">No audit trail records yet.</div>
        )}
      </div>
    </div>
  );
};
