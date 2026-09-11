import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { ActiveTrip, Route, RouteStop } from '../types';
import { MapViewer } from '../components/MapViewer';
import { Bus, MapPin, Gauge, Radio, RefreshCw } from 'lucide-react';

export const LiveFleetMapPage: React.FC = () => {
  const [activeTrips, setActiveTrips] = useState<ActiveTrip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | 'all'>('all');
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const [tripsRes, routesRes] = await Promise.all([
        api.get('/trips/active'),
        api.get('/routes')
      ]);

      if (tripsRes.data.success) setActiveTrips(tripsRes.data.data);
      if (routesRes.data.success) setRoutes(routesRes.data.data);
      setLastSync(new Date());
    } catch (err) {
      console.error('Error fetching live map data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = getSocket();

    const handleLocation = (loc: any) => {
      setActiveTrips((prev) =>
        prev.map((trip) => {
          if (trip.bus_id === loc.bus_id) {
            return {
              ...trip,
              current_latitude: loc.latitude,
              current_longitude: loc.longitude,
              current_speed: loc.speed,
              current_heading: loc.heading,
              last_updated: loc.recorded_at
            };
          }
          return trip;
        })
      );
      setLastSync(new Date());
    };

    socket.on('bus:location_update', handleLocation);
    return () => {
      socket.off('bus:location_update', handleLocation);
    };
  }, []);

  // Filter trips by route
  const filteredTrips = selectedRouteId === 'all'
    ? activeTrips
    : activeTrips.filter((t) => t.route_id === selectedRouteId);

  // Selected route stops and polyline
  const currentRoute = routes.find((r) => r.id === selectedRouteId);
  const currentStops: RouteStop[] = currentRoute?.stops || [];
  const routePolyline: [number, number][] = currentStops.map((s) => [Number(s.latitude), Number(s.longitude)]);

  const busMarkers = filteredTrips.map((t) => ({
    id: t.bus_id,
    bus_number: t.bus_number,
    latitude: t.current_latitude || 12.9782,
    longitude: t.current_longitude || 77.6012,
    speed: t.current_speed || 0,
    heading: t.current_heading || 0,
    driver_name: t.driver_name,
    route_name: t.route_name
  }));

  // Center coordinate
  const mapCenter: [number, number] = selectedBusId
    ? (() => {
        const b = busMarkers.find((x) => x.id === selectedBusId);
        return b ? [b.latitude, b.longitude] : [12.9782, 77.6012];
      })()
    : [12.9782, 77.6012];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
            <h1 className="text-xl font-bold text-slate-900">Live Campus Fleet Telemetry</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active tracking via native driver GPS beacons and Socket.IO broadcast.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Route Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Filter Route:</span>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="all">All Active Routes</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.route_code} - {r.route_name}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Map & Fleet Strip Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
          <MapViewer
            center={mapCenter}
            zoom={selectedBusId ? 15 : 13}
            buses={busMarkers}
            stops={currentStops}
            routePolyline={routePolyline}
            height="620px"
          />
        </div>

        {/* Live Buses Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Tracked Units ({filteredTrips.length})
            </h2>

            {filteredTrips.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No active buses on selected route
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTrips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedBusId(trip.bus_id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedBusId === trip.bus_id
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-sm text-slate-900">{trip.bus_number}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {trip.current_speed || 0} km/h
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 font-medium">{trip.route_name}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Driver: <b>{trip.driver_name}</b></div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Plate: {trip.license_plate}</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Locate
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
