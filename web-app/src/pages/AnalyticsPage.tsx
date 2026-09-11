import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardMetrics } from '../types';
import { BarChart3, TrendingUp, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then((res) => {
        if (res.data.success) setMetrics(res.data.data);
      })
      .catch(() => {});
  }, []);

  const onTimeRate = metrics?.fleet.on_time_departure_rate ?? 0;
  const fleetUptime = metrics?.fleet.fleet_uptime ?? 0;
  const recoveryRate = metrics?.lost_and_found.estimated_recovery_rate ?? 0;
  const categoryStats = metrics?.lost_and_found.category_distribution || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Analytics & AI Insights</h1>
        <p className="text-slate-500 text-xs mt-1">Operational performance metrics, route reliability, and item recovery rates.</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Punctuality */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">On-Time Departure Rate</span>
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-4xl font-black text-slate-900">{onTimeRate}%</div>
          <p className="text-xs text-slate-500">
            {metrics?.fleet.active_trips || 0} active trips currently dispatched across university routes.
          </p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${onTimeRate}%` }}></div>
          </div>
        </div>

        {/* AI Lost & Found Recovery */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">AI Item Recovery Rate</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-4xl font-black text-slate-900">
            {recoveryRate}%
          </div>
          <p className="text-xs text-slate-500">
            {metrics?.lost_and_found.approved_claims || 0} approved claims from {metrics?.lost_and_found.total_lost || 0} reported lost items.
          </p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${recoveryRate}%` }}></div>
          </div>
        </div>

        {/* Fleet Availability */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Fleet Ratio</span>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-4xl font-black text-slate-900">{fleetUptime}%</div>
          <p className="text-xs text-slate-500">
            {metrics?.fleet.active_buses || 0} of {metrics?.fleet.total_buses || 0} registered fleet buses currently active in service.
          </p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${fleetUptime}%` }}></div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lost & Found Category Distribution</h2>
        {categoryStats.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">No lost & found records in database yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {categoryStats.map((cat) => (
              <div key={cat.label} className="p-4 rounded-2xl border bg-slate-50 border-slate-200 text-center">
                <div className="text-2xl font-black text-slate-900">{cat.percentage}%</div>
                <div className="text-xs font-semibold mt-1 text-slate-600">{cat.label} ({cat.count})</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
