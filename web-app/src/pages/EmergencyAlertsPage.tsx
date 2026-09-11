import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { EmergencyAlert } from '../types';
import { AlertOctagon, Phone, CheckCircle, ShieldAlert, Clock, MapPin } from 'lucide-react';

export const EmergencyAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/emergency');
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching emergency alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const socket = getSocket();
    const handleNewAlert = (newAlert: any) => {
      setAlerts((prev) => [newAlert, ...prev]);
    };

    socket.on('emergency:alert', handleNewAlert);
    return () => {
      socket.off('emergency:alert', handleNewAlert);
    };
  }, []);

  const updateStatus = async (id: number, status: 'acknowledged' | 'resolved') => {
    try {
      await api.put(`/emergency/${id}/status`, { status });
      fetchAlerts();
    } catch (err: any) {
      alert('Error updating alert: ' + (err.response?.data?.message || err.message));
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const pastAlerts = alerts.filter(a => a.status !== 'active');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-rose-600" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Emergency Incident Dispatch</h1>
        </div>
        <p className="text-slate-500 text-xs mt-1">
          High-priority driver SOS alarms, vehicle breakdowns, medical incidents, and security dispatches.
        </p>
      </div>

      {/* Active Alerts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>Critical Incidents Requiring Immediate Action</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-800 font-extrabold">
              {activeAlerts.length}
            </span>
          </h2>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="p-8 bg-emerald-50/60 border border-emerald-200 rounded-3xl text-center space-y-1">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="text-sm font-bold text-emerald-900">All Routes Clear • Zero Active Emergencies</div>
            <div className="text-xs text-emerald-700">Driver telemetry is nominal across the campus transit network.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-3xl p-6 border-2 border-rose-500 shadow-xl shadow-rose-500/10 space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-rose-600 text-white animate-pulse">
                      ACTIVE SOS
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 mt-2 capitalize">{alert.alert_type} Emergency</h3>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </div>
                </div>

                {/* Driver & Bus Info */}
                <div className="p-4 bg-rose-50/60 rounded-2xl space-y-2 border border-rose-100 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Vehicle:</span>
                    <span className="font-bold text-slate-900">{alert.bus_number || `Bus #${alert.bus_id}`}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Driver:</span>
                    <span className="font-bold text-slate-900">{alert.driver_name || `Driver #${alert.driver_id}`}</span>
                  </div>
                  {alert.driver_phone && (
                    <div className="flex items-center justify-between">
                      <span>Direct Line:</span>
                      <a href={`tel:${alert.driver_phone}`} className="text-rose-600 font-bold flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {alert.driver_phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-rose-200/50">
                    <span>Coordinates:</span>
                    <span className="font-mono text-slate-600">{alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
                  </div>
                </div>

                {alert.notes && (
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <b>Incident Notes:</b> {alert.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => updateStatus(alert.id, 'acknowledged')}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                  >
                    Acknowledge & Dispatch Help
                  </button>
                  <button
                    onClick={() => updateStatus(alert.id, 'resolved')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incident History Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Past Incident Archive</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Bus / Vehicle</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Reported Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pastAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold capitalize">{alert.alert_type}</td>
                  <td className="py-3 px-4">{alert.bus_number || `Bus #${alert.bus_id}`}</td>
                  <td className="py-3 px-4">{alert.driver_name || `Driver #${alert.driver_id}`}</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(alert.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
