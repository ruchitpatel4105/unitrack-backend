import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ActiveTrip } from '../types';
import { UserCheck, Phone, Clock } from 'lucide-react';

export const DriverTripsPage: React.FC = () => {
  const [trips, setTrips] = useState<ActiveTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips/active');
      if (res.data.success) {
        setTrips(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching driver trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Operations & Active Trips</h1>
        <p className="text-slate-500 text-xs mt-1">Live driver duty assignments, active trip routes, and on-duty phone logs.</p>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <div className="text-sm font-bold text-slate-700">No Trips Currently Underway</div>
            <div className="text-xs text-slate-400 mt-1">Scheduled trips will appear here once drivers start their route.</div>
          </div>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  In Transit
                </span>
                <span className="text-xs font-semibold text-slate-400 capitalize">{trip.trip_type} shift</span>
              </div>

              {/* Driver info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-lg">
                  {trip.driver_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{trip.driver_name}</h3>
                  <a
                    href={`tel:${trip.driver_phone}`}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 mt-0.5 font-medium"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{trip.driver_phone}</span>
                  </a>
                </div>
              </div>

              {/* Bus & Route info */}
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-bold text-slate-800">{trip.bus_number} ({trip.license_plate})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Route:</span>
                  <span className="font-bold text-emerald-700">{trip.route_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transit Status:</span>
                  <span className="font-bold text-emerald-700">In Transit • Live GPS</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Live GPS Beacon active
                </span>
                <span className="text-slate-500 font-mono">Trip #{trip.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
