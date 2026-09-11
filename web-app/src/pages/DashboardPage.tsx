import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { DashboardMetrics, ActiveTrip, EmergencyAlert } from '../types';
import { MapViewer } from '../components/MapViewer';
import { Bus, MapPin, Search, AlertTriangle, Users, Activity, CheckCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activeTrips, setActiveTrips] = useState<ActiveTrip[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<EmergencyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [mRes, tRes, aRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/trips/active'),
        api.get('/emergency')
      ]);

      if (mRes.data.success) setMetrics(mRes.data.data);
      if (tRes.data.success) setActiveTrips(tRes.data.data);
      if (aRes.data.success) setRecentAlerts(aRes.data.data.slice(0, 4));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to real-time socket events
    const socket = getSocket();

    const handleLocationUpdate = (loc: any) => {
      setActiveTrips((prev) =>
        prev.map((t) => (t.bus_id === loc.bus_id ? { ...t, current_latitude: loc.latitude, current_longitude: loc.longitude, current_speed: loc.speed } : t))
      );
    };

    const handleEmergency = (alertData: any) => {
      setRecentAlerts((prev) => [alertData, ...prev.slice(0, 3)]);
      fetchDashboardData();
    };

    socket.on('bus:location_update', handleLocationUpdate);
    socket.on('emergency:alert', handleEmergency);

    return () => {
      socket.off('bus:location_update', handleLocationUpdate);
      socket.off('emergency:alert', handleEmergency);
    };
  }, []);

  const busMapMarkers = activeTrips.map((t) => ({
    id: t.bus_id,
    bus_number: t.bus_number,
    latitude: t.current_latitude || 12.9782,
    longitude: t.current_longitude || 77.6012,
    speed: t.current_speed || 0,
    heading: t.current_heading || 0,
    driver_name: t.driver_name,
    route_name: t.route_name
  }));

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading Telemetry & Metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Command Overview</h1>
          <p className="text-slate-500 text-xs mt-1">Real-time telemetry, trip status, and university transit analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/live-map"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/30 transition-all"
          >
            <MapPin className="w-4 h-4" />
            <span>Open Full Live Map</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Fleet */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Fleet</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics?.fleet.active_buses || 0}</span>
            <span className="text-xs text-slate-500">/ {metrics?.fleet.total_buses || 0} buses</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{metrics?.fleet.active_trips || 0} trips underway</span>
          </div>
        </div>

        {/* Card 2: Registered Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Commuters</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics?.users.total_students || 0}</span>
            <span className="text-xs text-slate-500">students</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Assigned drivers: <b>{metrics?.users.total_drivers || 0}</b>
          </div>
        </div>

        {/* Card 3: Lost & Found Claims */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Lost & Found</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics?.lost_and_found.pending_claims || 0}</span>
            <span className="text-xs text-slate-500">pending claims</span>
          </div>
          <div className="mt-3 text-xs text-amber-600 font-semibold">
            <span>{metrics?.lost_and_found.estimated_recovery_rate || 75}% AI match accuracy</span>
          </div>
        </div>

        {/* Card 4: Security Emergencies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emergency Alarms</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              (metrics?.security.active_emergencies || 0) > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${
              (metrics?.security.active_emergencies || 0) > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {metrics?.security.active_emergencies || 0}
            </span>
            <span className="text-xs text-slate-500">active alerts</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Emergency protocol: <b>Auto-relayed</b>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Telemetry Map + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Map Preview (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">Live GPS Telemetry</h2>
            </div>
            <Link to="/live-map" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <span>Expand Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <MapViewer buses={busMapMarkers} height="380px" />

          {/* Active Trips Quick Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {activeTrips.slice(0, 2).map((trip) => (
              <div key={trip.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">{trip.bus_number} • {trip.route_name}</div>
                  <div className="text-[11px] text-slate-500">Driver: {trip.driver_name}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {trip.current_speed || 0} km/h
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents & Activity Feed (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-sm">Security & Alert Logs</h2>
              <Link to="/emergencies" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No emergency alarms logged</div>
              ) : (
                recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border text-xs ${
                      alert.status === 'active'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold uppercase tracking-wider">{alert.alert_type}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        alert.status === 'active' ? 'bg-rose-200 text-rose-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Bus #{alert.bus_id} • Driver #{alert.driver_id}
                    </div>
                    {alert.notes && <p className="mt-1.5 text-slate-800 italic">"{alert.notes}"</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <div className="text-xs font-semibold text-slate-500 mb-2">Fleet Readiness</div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Operational: 85%</span>
              <span>Target: 95%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
