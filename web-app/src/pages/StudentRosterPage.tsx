import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Search, Key, Trash2, Edit2, CheckCircle2, ShieldCheck, Copy, Check, MapPin, RefreshCw, X } from 'lucide-react';

interface StudentPass {
  id: number;
  name: string;
  email: string;
  phone: string;
  student_id: string;
  dob: string;
  pickup_stop: string;
  assigned_route_id: number | null;
  route_name: string | null;
  route_code: string | null;
  pass_number: string;
  transport_fee_status: string;
  avatar_url: string;
}

interface RouteOption {
  id: number;
  route_name: string;
  route_code: string;
}

export const StudentRosterPage: React.FC = () => {
  const [students, setStudents] = useState<StudentPass[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<string>('');

  // Add / Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentPass | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    phone: '',
    email: '',
    dob: '',
    assigned_route_id: '',
    pickup_stop: '',
    transport_fee_status: 'paid'
  });

  // Password Share Modal State
  const [shareModalStudent, setShareModalStudent] = useState<StudentPass | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchStudents = async () => {
    try {
      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedRoute) params.route_id = selectedRoute;

      const [stuRes, routeRes] = await Promise.all([
        api.get('/students', { params }),
        api.get('/routes')
      ]);

      if (stuRes.data.success) setStudents(stuRes.data.data);
      if (routeRes.data.success) setRoutes(routeRes.data.data);
    } catch (err) {
      console.error('Failed fetching students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, selectedRoute]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      student_id: '',
      phone: '',
      email: '',
      dob: '',
      assigned_route_id: routes.length > 0 ? String(routes[0].id) : '1',
      pickup_stop: '',
      transport_fee_status: 'paid'
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: StudentPass) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      student_id: student.student_id,
      phone: student.phone,
      email: student.email,
      dob: student.dob,
      assigned_route_id: student.assigned_route_id ? String(student.assigned_route_id) : '',
      pickup_stop: student.pickup_stop || '',
      transport_fee_status: student.transport_fee_status || 'paid'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      setIsAddModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      alert('Error saving student pass: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove this student from the active transport roster?')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (err: any) {
      alert('Error removing student: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleResetPassword = async (student: StudentPass) => {
    try {
      const res = await api.post(`/students/${student.id}/reset-password`);
      if (res.data.success) {
        setShareModalStudent({ ...student, dob: res.data.password });
        setCopied(false);
      }
    } catch (err: any) {
      alert('Error resetting password: ' + (err.response?.data?.message || err.message));
    }
  };

  const copyPasswordToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            <span>Student Bus Pass Roster</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Authorized student commuter registry. Only fee-paid students listed here can log in and board buses.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Paid Student</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by 13-digit Enrollment ID, Phone, or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Bus Routes</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.route_code} - {r.route_name}</option>
            ))}
          </select>

          <button
            onClick={fetchStudents}
            className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Student Pass Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Student Details</th>
                <th className="py-4 px-6">Enrollment ID</th>
                <th className="py-4 px-6">Assigned Route</th>
                <th className="py-4 px-6">Pick-up Stop</th>
                <th className="py-4 px-6">Initial Password (DOB)</th>
                <th className="py-4 px-6">Pass Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name & Photo */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar_url}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-400">{student.phone}</div>
                      </div>
                    </div>
                  </td>

                  {/* 13-digit ID */}
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                      {student.student_id}
                    </span>
                  </td>

                  {/* Route */}
                  <td className="py-4 px-6">
                    {student.route_name ? (
                      <div>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] mr-1">
                          {student.route_code || 'BUS'}
                        </span>
                        <span className="text-slate-700">{student.route_name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Pickup Stop */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{student.pickup_stop || 'Main Gate'}</span>
                    </div>
                  </td>

                  {/* Initial Password (DOB) */}
                  <td className="py-4 px-6">
                    <button
                      onClick={() => { setShareModalStudent(student); setCopied(false); }}
                      className="flex items-center gap-1.5 font-mono text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-lg transition-colors"
                      title="View & share password with student"
                    >
                      <Key className="w-3 h-3 text-amber-600" />
                      <span>{student.dob || '15082004'}</span>
                    </button>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Active (Paid)</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => { setShareModalStudent(student); setCopied(false); }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Share / copy password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit pass"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove pass"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No authorized students found. Click "Add Paid Student" to register a pass holder.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStudent ? 'Edit Student Transport Pass' : 'Register Paid Commuter Student'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Enter university enrollment details, pickup point, and Date of Birth as the default password.
            </p>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mavani Ruchit"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">13-digit Enrollment No *</label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    placeholder="2403051057034"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth (DDMMYYYY) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="15082004"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Used as default login password</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Bus Route</label>
                <select
                  value={formData.assigned_route_id}
                  onChange={(e) => setFormData({ ...formData, assigned_route_id: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Select Transit Route --</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.route_code} - {r.route_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designated Pick-up Stop *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sayajigunj Circle, Sama Road BRTS"
                  value={formData.pickup_stop}
                  onChange={(e) => setFormData({ ...formData, pickup_stop: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-md shadow-emerald-600/30"
                >
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share / Copy Password Modal */}
      {shareModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Student Login Credentials</h3>
              </div>
              <button onClick={() => setShareModalStudent(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Student Name:</span>{' '}
                <span className="font-bold text-slate-900">{shareModalStudent.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Enrollment (Login ID):</span>{' '}
                <span className="font-mono font-bold text-slate-900">{shareModalStudent.student_id}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Default Password (DOB):</span>{' '}
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {shareModalStudent.dob || '15082004'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Share these credentials with the student. They can log in to the Uni-Track Android app using their 13-digit Enrollment ID and this Date of Birth password.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => copyPasswordToClipboard(`Enrollment ID: ${shareModalStudent.student_id}\nPassword (DOB): ${shareModalStudent.dob || '15082004'}`)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-xl shadow-md transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                onClick={() => handleResetPassword(shareModalStudent)}
                className="px-3 py-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-xl border border-amber-300 transition-colors"
                title="Reset password back to DOB"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
