import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bus, Route, User } from '../types';
import { Plus, Edit2, Trash2, Bus as BusIcon, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const BusManagementPage: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [formData, setFormData] = useState({
    bus_number: '',
    license_plate: '',
    capacity: 50,
    status: 'active' as 'active' | 'in_maintenance' | 'inactive',
    assigned_driver_id: '' as string | number,
    current_route_id: '' as string | number
  });

  const fetchData = async () => {
    try {
      const [busRes, routeRes] = await Promise.all([
        api.get('/buses'),
        api.get('/routes')
      ]);

      if (busRes.data.success) setBuses(busRes.data.data);
      if (routeRes.data.success) setRoutes(routeRes.data.data);
    } catch (err) {
      console.error('Error fetching buses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingBus(null);
    setFormData({
      bus_number: '',
      license_plate: '',
      capacity: 50,
      status: 'active',
      assigned_driver_id: '',
      current_route_id: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (bus: Bus) => {
    setEditingBus(bus);
    setFormData({
      bus_number: bus.bus_number,
      license_plate: bus.license_plate,
      capacity: bus.capacity,
      status: bus.status,
      assigned_driver_id: bus.assigned_driver_id || '',
      current_route_id: bus.current_route_id || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        assigned_driver_id: formData.assigned_driver_id ? Number(formData.assigned_driver_id) : null,
        current_route_id: formData.current_route_id ? Number(formData.current_route_id) : null
      };

      if (editingBus) {
        await api.put(`/buses/${editingBus.id}`, payload);
      } else {
        await api.post('/buses', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert('Error saving bus: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to decommission this bus?')) return;
    try {
      await api.delete(`/buses/${id}`);
      fetchData();
    } catch (err: any) {
      alert('Error deleting bus: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bus Fleet Registry</h1>
          <p className="text-slate-500 text-xs mt-1">Manage vehicles, maintenance status, and driver assignments.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Bus</span>
        </button>
      </div>

      {/* Bus Fleet Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Bus Number</th>
                <th className="py-4 px-6">License Plate</th>
                <th className="py-4 px-6">Capacity</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Assigned Driver</th>
                <th className="py-4 px-6">Assigned Route</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                        <BusIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{bus.bus_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono font-semibold text-slate-700">{bus.license_plate}</td>
                  <td className="py-4 px-6 text-slate-600">{bus.capacity} seats</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      bus.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : bus.status === 'in_maintenance'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        bus.status === 'active' ? 'bg-emerald-500' : bus.status === 'in_maintenance' ? 'bg-amber-500' : 'bg-slate-400'
                      }`}></span>
                      {bus.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {bus.driver_name ? (
                      <div className="font-medium text-slate-800">{bus.driver_name}</div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {bus.route_name ? (
                      <div>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] mr-1">
                          {bus.route_code}
                        </span>
                        <span className="text-slate-700">{bus.route_name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(bus)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bus.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingBus ? 'Edit Bus Specifications' : 'Register New Bus'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">Enter vehicle registration, capacity, and operational routing.</p>

             <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bus Number — smart picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bus Number *</label>
                <div className="flex gap-2">
                  {/* Quick select: taken numbers shown in red, available in green */}
                  <select
                    value={formData.bus_number}
                    onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                    className="w-36 text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none shrink-0"
                  >
                    <option value="">Pick #</option>
                    {Array.from({ length: 20 }, (_, i) => String(i + 1)).map((num) => {
                      const takenByOther = buses.some(b => b.bus_number === num && (!editingBus || b.id !== editingBus.id));
                      return (
                        <option key={num} value={num} disabled={takenByOther} style={{ color: takenByOther ? '#ef4444' : '#16a34a' }}>
                          {takenByOther ? `${num} — taken` : `${num} — available`}
                        </option>
                      );
                    })}
                  </select>
                  {/* Or type manually */}
                  <input
                    type="text"
                    required
                    placeholder="or type custom number"
                    value={formData.bus_number}
                    onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                    className={`flex-1 text-xs border rounded-xl p-2.5 outline-none focus:ring-2 ${
                      formData.bus_number && buses.some(b => b.bus_number === formData.bus_number && (!editingBus || b.id !== editingBus.id))
                        ? 'border-red-400 focus:ring-red-400 bg-red-50'
                        : 'border-slate-300 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                {/* Conflict warning */}
                {formData.bus_number && buses.some(b => b.bus_number === formData.bus_number && (!editingBus || b.id !== editingBus.id)) && (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠ Bus number "{formData.bus_number}" is already in use. Please choose a different number.</p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">Numbers 1–20 shown above. Green = available, red = taken. You can also type any custom number.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">License Plate *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GJ-06-PU-0005"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={100}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="active">Active (On Service)</option>
                  <option value="in_maintenance">In Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Route</label>
                <select
                  value={formData.current_route_id}
                  onChange={(e) => setFormData({ ...formData, current_route_id: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- No Route Assigned --</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.route_code} - {r.route_name}
                    </option>
                  ))}
                </select>
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
                  {editingBus ? 'Save Changes' : 'Register Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
