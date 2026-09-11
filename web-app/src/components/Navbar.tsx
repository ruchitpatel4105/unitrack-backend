import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, AlertOctagon, Send } from 'lucide-react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(0);
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRole, setBroadcastRole] = useState('all');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Initial fetch of active alerts
    api.get('/emergency?status=active')
      .then((res) => {
        if (res.data.success) {
          setActiveAlertsCount(res.data.data.length);
        }
      })
      .catch(() => {});

    // Listen for socket real-time emergency alerts
    const socket = getSocket();
    const handleEmergency = () => {
      setActiveAlertsCount((prev) => prev + 1);
    };

    socket.on('emergency:alert', handleEmergency);
    return () => {
      socket.off('emergency:alert', handleEmergency);
    };
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setIsSending(true);
    try {
      await api.post('/notifications/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage,
        role: broadcastRole,
        type: 'general'
      });
      alert('Broadcast dispatched to students and drivers successfully!');
      setBroadcastTitle('');
      setBroadcastMessage('');
      setShowBroadcastModal(false);
    } catch (err: any) {
      alert('Failed to send broadcast: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            Operational • Realtime Sync
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Dispatch Announcement Button */}
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-slate-500" />
            <span>Dispatch Broadcast</span>
          </button>

          {/* Active Emergency Counter Badge */}
          {activeAlertsCount > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-lg text-xs font-bold animate-bounce">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>{activeAlertsCount} Active Emergency</span>
            </div>
          )}

          {/* Admin User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
              alt={user?.name || 'Admin'}
              className="w-9 h-9 rounded-full object-cover border border-slate-300 ring-2 ring-emerald-500/20"
            />
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-[11px] text-slate-500 capitalize">{user?.role} Authority</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Dispatch Campus Broadcast</h3>
            <p className="text-xs text-slate-500 mb-4">Send a high-priority push announcement to Students and Drivers.</p>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
                <select
                  value={broadcastRole}
                  onChange={(e) => setBroadcastRole(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="all">Everyone (Students & Drivers)</option>
                  <option value="student">Students Only</option>
                  <option value="driver">Drivers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Route 101 Delay Announcement"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter broadcast message details..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-md shadow-emerald-600/30"
                >
                  {isSending ? 'Dispatching...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
