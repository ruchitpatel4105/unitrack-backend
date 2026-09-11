import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Route, RouteStop } from '../types';
import { Plus, Trash2, MapPin, Clock, Navigation, Flag, Milestone } from 'lucide-react';

export const RouteManagementPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [routeName, setRouteName] = useState('');
  const [routeCode, setRouteCode] = useState('');
  const [description, setDescription] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [duration, setDuration] = useState(35);
  const [distance, setDistance] = useState(12.5);
  const [stops, setStops] = useState<Array<{ stop_name: string; latitude: number; longitude: number; estimated_time_offset_mins: number }>>([
    { stop_name: '', latitude: 12.9715, longitude: 77.5945, estimated_time_offset_mins: 0 }
  ]);

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/routes');
      if (res.data.success) setRoutes(res.data.data);
    } catch (err) {
      console.error('Error fetching routes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const addStopField = () => {
    setStops([...stops, { stop_name: '', latitude: 12.9800, longitude: 77.6000, estimated_time_offset_mins: stops.length * 8 }]);
  };

  const removeStopField = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const updateStopField = (index: number, field: string, value: any) => {
    const updated = [...stops];
    (updated[index] as any)[field] = value;
    setStops(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        route_name: routeName,
        route_code: routeCode,
        description,
        start_point: startPoint,
        end_point: endPoint,
        estimated_duration_mins: Number(duration),
        distance_km: Number(distance),
        stops: stops.filter(s => s.stop_name.trim() !== '')
      };

      await api.post('/routes', payload);
      setIsModalOpen(false);
      setRouteName('');
      setRouteCode('');
      setDescription('');
      setStartPoint('');
      setEndPoint('');
      fetchRoutes();
    } catch (err: any) {
      alert('Error creating route: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this route and all its stops?')) return;
    try {
      await api.delete(`/routes/${id}`);
      fetchRoutes();
    } catch (err: any) {
      alert('Error deleting route: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campus Transit Network</h1>
          <p className="text-slate-500 text-xs mt-1">Configure arterial university routes, sequenced stops, and waypoint coordinates.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Route</span>
        </button>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map((route) => (
          <div key={route.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              {/* Route Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                      {route.route_code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{route.route_name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{route.description}</p>
                </div>
                <button
                  onClick={() => handleDelete(route.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-4 py-3 border-y border-slate-100 mt-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{route.estimated_duration_mins} mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-slate-400" />
                  <span>{route.distance_km} km</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Milestone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{route.stops?.length || 0} stops</span>
                </div>
              </div>

              {/* Stops List */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sequenced Stops</div>
                <div className="space-y-1.5">
                  {route.stops?.map((stop, idx) => (
                    <div key={stop.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-800">{stop.stop_name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        +{stop.estimated_time_offset_mins}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Terminal Points Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <b>Origin:</b> {route.start_point}
              </span>
              <span className="flex items-center gap-1">
                <Flag className="w-3 h-3 text-amber-600" />
                <b>Terminus:</b> {route.end_point}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Route Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Define New Transit Route</h3>
            <p className="text-xs text-slate-500 mb-4">Set route identity, estimated transit times, and ordered waypoints.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Route Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. West Campus Express"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Route Code</label>
                  <input
                    type="text"
                    required
                    placeholder="RT-WEST-404"
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Rapid transit serving West gates and student residences"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Point</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. West Gate Terminal"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Point</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Academic Block 4"
                    value={endPoint}
                    onChange={(e) => setEndPoint(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Stops Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Waypoints / Stops ({stops.length})</label>
                  <button
                    type="button"
                    onClick={addStopField}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Stop</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {stops.map((stop, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        required
                        placeholder="Stop name"
                        value={stop.stop_name}
                        onChange={(e) => updateStopField(idx, 'stop_name', e.target.value)}
                        className="flex-1 text-xs border border-slate-300 rounded-lg p-1.5 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Offset mins"
                        value={stop.estimated_time_offset_mins}
                        onChange={(e) => updateStopField(idx, 'estimated_time_offset_mins', Number(e.target.value))}
                        className="w-20 text-xs border border-slate-300 rounded-lg p-1.5 outline-none"
                      />
                      {stops.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStopField(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-md shadow-emerald-600/30"
                >
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
