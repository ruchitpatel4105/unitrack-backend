import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LostFoundItem, Claim } from '../types';
import { Search, Sparkles, CheckCircle, XCircle, Eye, Tag, Calendar, MapPin, AlertCircle } from 'lucide-react';

export const LostFoundAdminPage: React.FC = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedTab, setSelectedTab] = useState<'items' | 'claims'>('items');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [itemRes, claimRes] = await Promise.all([
        api.get('/lost-found'),
        api.get('/lost-found/claims')
      ]);

      if (itemRes.data.success) setItems(itemRes.data.data);
      if (claimRes.data.success) setClaims(claimRes.data.data);
    } catch (err) {
      console.error('Error fetching lost & found data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openItemDetail = async (id: number) => {
    try {
      const res = await api.get(`/lost-found/${id}`);
      if (res.data.success) {
        setSelectedItem(res.data.data);
        setIsDetailOpen(true);
      }
    } catch (err: any) {
      alert('Error fetching item details: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleClaimDecision = async (claimId: number, status: 'approved' | 'rejected') => {
    const notes = prompt(`Enter optional admin notes for ${status}:`) || '';
    try {
      await api.put(`/lost-found/claims/${claimId}/status`, { status, admin_notes: notes });
      alert(`Claim marked as ${status}`);
      fetchData();
      if (selectedItem) {
        openItemDetail(selectedItem.id);
      }
    } catch (err: any) {
      alert('Error updating claim: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredItems = filterType === 'all'
    ? items
    : items.filter(i => i.type === filterType);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Lost & Found Administration</h1>
          <p className="text-slate-500 text-xs mt-1">Smart attribute similarity matching, student claim review, and inventory control.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setSelectedTab('items')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              selectedTab === 'items' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Reported Items ({items.length})
          </button>
          <button
            onClick={() => setSelectedTab('claims')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              selectedTab === 'claims' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pending Claims ({claims.length})
          </button>
        </div>
      </div>

      {selectedTab === 'items' ? (
        <>
          {/* Filter Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Item Type:</span>
            <div className="flex items-center gap-2">
              {['all', 'lost', 'found'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`text-xs px-3 py-1.5 rounded-xl capitalize font-semibold transition-colors ${
                    filterType === t
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  {/* Image */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg text-white ${
                        item.type === 'lost' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-black/60 text-white backdrop-blur-sm">
                        {item.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        item.status === 'matched'
                          ? 'bg-amber-500 text-white'
                          : item.status === 'resolved'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/90 text-slate-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.location_name} {item.bus_number && `(${item.bus_number})`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(item.item_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => openItemDetail(item.id)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Item & AI Matches</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Claims View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Item Title</th>
                  <th className="py-4 px-6">Claimant</th>
                  <th className="py-4 px-6">Proof Description</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Review Decisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{claim.item_title}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{claim.category}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800">{claim.claimant_name}</div>
                      <div className="text-[11px] text-slate-400">{claim.claimant_phone || claim.claimant_email}</div>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-slate-600 line-clamp-2">{claim.proof_description}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        claim.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {claim.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleClaimDecision(claim.id, 'approved')}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleClaimDecision(claim.id, 'rejected')}
                            className="flex items-center gap-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Detail & AI Match Breakdown Modal */}
      {isDetailOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md text-white ${
                    selectedItem.type === 'lost' ? 'bg-rose-600' : 'bg-emerald-600'
                  }`}>
                    {selectedItem.type}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedItem.title}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">Reported by {selectedItem.reporter_name} ({selectedItem.reporter_phone})</p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Photo & Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 rounded-2xl overflow-hidden bg-slate-100 h-36">
                <img
                  src={selectedItem.image_url || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:col-span-2 p-3 bg-slate-50 rounded-2xl text-xs space-y-2">
                <div><b>Description:</b> {selectedItem.description}</div>
                <div><b>Location:</b> {selectedItem.location_name}</div>
                <div><b>Category:</b> {selectedItem.category} | <b>Color:</b> {selectedItem.color || 'Not specified'}</div>
                <div><b>Date:</b> {selectedItem.item_date}</div>
              </div>
            </div>

            {/* AI Matches Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI Similarity Engine Matches ({selectedItem.matches?.length || 0})
                </h4>
              </div>

              {selectedItem.matches?.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-400 text-center">
                  No automated AI matches detected yet. The neural engine continues scanning newly reported items.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedItem.matches.map((m: any) => (
                    <div key={m.id} className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{m.matched_title}</span>
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-500 text-white">
                          {m.match_score}% MATCH
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <b>AI Match Explanation:</b> {m.match_reasons}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Claims filed for this item */}
            {selectedItem.claims?.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Submitted Claims ({selectedItem.claims.length})</h4>
                <div className="space-y-2">
                  {selectedItem.claims.map((c: any) => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">{c.claimant_name} ({c.claimant_phone})</div>
                        <div className="text-slate-500 mt-0.5">{c.proof_description}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
