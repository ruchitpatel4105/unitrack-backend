import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Route, RouteStop } from "../types";
import { Plus, Trash2, MapPin, Clock, Navigation, Flag, Milestone, Edit2, X, Check } from "lucide-react";

type StopForm = {
  stop_name: string;
  latitude: number;
  longitude: number;
  estimated_time_offset_mins: number;
};

const BLANK_STOP: StopForm = { stop_name: "", latitude: 22.2887, longitude: 73.3634, estimated_time_offset_mins: 0 };

export const RouteManagementPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const [routeName, setRouteName] = useState("");
  const [routeCode, setRouteCode] = useState("");
  const [description, setDescription] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [duration, setDuration] = useState(35);
  const [distance, setDistance] = useState(15.0);
  const [stops, setStops] = useState<StopForm[]>([{ ...BLANK_STOP }]);

  const fetchRoutes = async () => {
    try {
      const res = await api.get("/routes");
      if (res.data.success) setRoutes(res.data.data);
    } catch (err) {
      console.error("Error fetching routes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRoutes(); }, []);

  const openCreateModal = () => {
    setEditingRoute(null);
    setRouteName(""); setRouteCode(""); setDescription("");
    setStartPoint(""); setEndPoint(""); setDuration(35); setDistance(15.0);
    setStops([{ ...BLANK_STOP }]);
    setIsModalOpen(true);
  };

  const openEditModal = (route: Route) => {
    setEditingRoute(route);
    setRouteName(route.route_name);
    setRouteCode(route.route_code);
    setDescription(route.description || "");
    setStartPoint(route.start_point);
    setEndPoint(route.end_point);
    setDuration(route.estimated_duration_mins);
    setDistance(route.distance_km);
    setStops(
      route.stops && route.stops.length > 0
        ? route.stops.map(s => ({
            stop_name: s.stop_name,
            latitude: s.latitude,
            longitude: s.longitude,
            estimated_time_offset_mins: s.estimated_time_offset_mins
          }))
        : [{ ...BLANK_STOP }]
    );
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingRoute(null); };

  const addStopField = () => {
    const lastOffset = stops.length > 0 ? stops[stops.length - 1].estimated_time_offset_mins : 0;
    setStops([...stops, { ...BLANK_STOP, estimated_time_offset_mins: lastOffset + 8 }]);
  };

  const removeStopField = (index: number) => setStops(stops.filter((_, i) => i !== index));

  const updateStopField = (index: number, field: string, value: any) => {
    const updated = [...stops];
    (updated[index] as any)[field] = value;
    setStops(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      route_name: routeName, route_code: routeCode, description,
      start_point: startPoint, end_point: endPoint,
      estimated_duration_mins: Number(duration), distance_km: Number(distance),
      stops: stops.filter(s => s.stop_name.trim() !== "").map((s, i) => ({ ...s, stop_order: i + 1 }))
    };
    try {
      if (editingRoute) {
        await api.put(`/routes/${editingRoute.id}`, payload);
      } else {
        await api.post("/routes", payload);
      }
      closeModal();
      fetchRoutes();
    } catch (err: any) {
      alert("Error saving route: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this route and all its stops?")) return;
    try {
      await api.delete(`/routes/${id}`);
      fetchRoutes();
    } catch (err: any) {
      alert("Error deleting route: " + (err.response?.data?.message || err.message));
    }
  };

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="flex items-center gap-3 text-slate-500">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading routes...</span>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bus Route Management</h1>
          <p className="text-slate-500 text-xs mt-1">{routes.length} route{routes.length !== 1 ? "s" : ""} configured · Create, edit or delete city transit routes and stops.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/30 transition-all">
          <Plus className="w-4 h-4" /><span>Create New Route</span>
        </button>
      </div>

      {routes.length === 0 && (
        <div className="text-center py-16 text-slate-400 bg-white rounded-3xl border border-slate-200">
          <Navigation className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm">No routes configured yet</p>
          <p className="text-xs mt-1">Create your first route to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map((route) => (
          <div key={route.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase shrink-0">{route.route_code}</span>
                    <h3 className="font-bold text-slate-900 text-base">{route.route_name}</h3>
                  </div>
                  {route.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{route.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEditModal(route)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit route">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(route.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete route">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 py-3 border-y border-slate-100 mt-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /><span>{route.estimated_duration_mins} mins</span></div>
                <div className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-slate-400" /><span>{route.distance_km} km</span></div>
                <div className="flex items-center gap-1.5"><Milestone className="w-3.5 h-3.5 text-slate-400" /><span>{route.stops?.length || 0} stops</span></div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stop Sequence</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {route.stops?.map((stop, idx) => (
                    <div key={stop.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</span>
                        <span className="font-medium text-slate-800">{stop.stop_name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">+{stop.estimated_time_offset_mins}m</span>
                    </div>
                  ))}
                  {(!route.stops || route.stops.length === 0) && (
                    <p className="text-xs text-slate-400 italic pl-2">No stops yet — click Edit to add stops.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 truncate mr-2">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <b className="shrink-0">Origin:</b><span className="truncate">{route.start_point}</span>
              </span>
              <span className="flex items-center gap-1 truncate">
                <Flag className="w-3 h-3 text-amber-600 shrink-0" />
                <b className="shrink-0">End:</b><span className="truncate">{route.end_point}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-slate-900">{editingRoute ? `Edit Route — ${editingRoute.route_code}` : "Create New Route"}</h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              {editingRoute ? "Edit route details and stop sequence. All stops will be replaced on save." : "Define route identity, transit time, and ordered pickup stops."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Route Name *</label>
                  <input type="text" required placeholder="e.g. Vadodara Station Express" value={routeName} onChange={(e) => setRouteName(e.target.value)} className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Route Code *</label>
                  <input type="text" required placeholder="RT-001" value={routeCode} onChange={(e) => setRouteCode(e.target.value)} className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input type="text" placeholder="Brief description of the route" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Point *</label>
                  <input type="text" required placeholder="e.g. Vadodara Railway Station" value={startPoint} onChange={(e) => setStartPoint(e.target.value)} className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Point *</label>
                  <input type="text" required placeholder="e.g. Parul University Main Gate" value={endPoint} onChange={(e) => setEndPoint(e.target.value)} className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (mins)</label>
                  <input type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Distance (km)</label>
                  <input type="number" step="0.1" min={0} value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Pickup Stops ({stops.length}) <span className="font-normal text-slate-400">— city to campus order</span></label>
                  <button type="button" onClick={addStopField} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /><span>Add Stop</span>
                  </button>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {stops.map((stop, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-400 w-5 shrink-0 text-center">{idx + 1}</span>
                      <input type="text" required placeholder="Stop name (e.g. Sayajigunj Circle)" value={stop.stop_name} onChange={(e) => updateStopField(idx, "stop_name", e.target.value)} className="flex-1 text-xs border border-slate-300 rounded-lg p-1.5 outline-none focus:ring-1 focus:ring-emerald-500 min-w-0" />
                      <input type="number" placeholder="+min" title="Minutes from route start" value={stop.estimated_time_offset_mins} onChange={(e) => updateStopField(idx, "estimated_time_offset_mins", Number(e.target.value))} className="w-16 text-xs border border-slate-300 rounded-lg p-1.5 outline-none text-center" />
                      {stops.length > 1 && (
                        <button type="button" onClick={() => removeStopField(idx)} className="text-rose-400 hover:text-rose-600 p-1 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">+min = minutes after route departure when bus reaches this stop.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-md shadow-emerald-600/30">
                  <Check className="w-3.5 h-3.5" />{editingRoute ? "Save Changes" : "Create Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
