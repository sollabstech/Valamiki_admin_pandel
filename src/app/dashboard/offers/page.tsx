'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import { mockOffers } from '@/lib/mockData';
import { Offer } from '@/lib/types';
import { Plus, Percent, X, Trash2, Tag, Calendar, IndianRupee } from 'lucide-react';

const typeColors: Record<string, string> = {
  percentage: 'bg-blue-50 text-blue-700',
  flat: 'bg-emerald-50 text-emerald-700',
  bogo: 'bg-violet-50 text-violet-700',
  free_delivery: 'bg-orange-50 text-orange-700',
};

const typeLabels: Record<string, string> = {
  percentage: '% Off', flat: '₹ Flat', bogo: 'BOGO', free_delivery: 'Free Delivery',
};

const initForm = {
  code: '', title: '', description: '', type: 'percentage' as Offer['type'],
  value: '', minOrderValue: '', maxDiscount: '',
  startDate: '', endDate: '', usageLimit: '', isActive: true,
};

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const openAdd = () => {
    setEditId(null);
    setForm(initForm);
    setShowModal(true);
  };

  const openEdit = (o: Offer) => {
    setEditId(o.id);
    setForm({
      code: o.code, title: o.title, description: o.description || '', type: o.type,
      value: String(o.value), minOrderValue: String(o.minOrderValue ?? ''),
      maxDiscount: String(o.maxDiscount ?? ''), startDate: o.startDate?.toISOString().split('T')[0] ?? '',
      endDate: o.endDate?.toISOString().split('T')[0] ?? '', usageLimit: String(o.usageLimit ?? ''),
      isActive: o.isActive,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const base = {
      code: form.code.toUpperCase(), title: form.title, description: form.description,
      type: form.type, value: parseFloat(form.value) || 0,
      minOrderValue: parseFloat(form.minOrderValue) || 0,
      maxDiscount: parseFloat(form.maxDiscount) || undefined,
      startDate: form.startDate ? new Date(form.startDate) : undefined,
      endDate: form.endDate ? new Date(form.endDate) : undefined,
      usageLimit: parseInt(form.usageLimit) || undefined,
      isActive: form.isActive, usageCount: 0,
    };
    if (editId) {
      setOffers(prev => prev.map(o => o.id === editId ? { ...o, ...base } : o));
    } else {
      setOffers(prev => [{ ...base, id: `offer${Date.now()}` }, ...prev]);
    }
    setShowModal(false);
  };

  const toggleActive = (id: string) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o));
  };

  const activeCount = offers.filter(o => o.isActive).length;

  return (
    <div>
      <Header title="Offers & Discounts" />
      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Offers', val: offers.length, icon: Tag, color: 'bg-blue-500' },
            { label: 'Active', val: activeCount, icon: Percent, color: 'bg-emerald-500' },
            { label: 'Inactive', val: offers.length - activeCount, icon: X, color: 'bg-gray-400' },
            { label: 'Total Usages', val: offers.reduce((a, o) => a + (o.usageCount || 0), 0), icon: IndianRupee, color: 'bg-violet-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.val}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Coupon Codes</h2>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all">
            <Plus size={16} /> Create Offer
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {offers.map(o => (
            <div key={o.id} className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all ${o.isActive ? 'border-blue-100' : 'border-gray-100 opacity-70'}`}>
              {/* Top */}
              <div className={`px-5 py-4 ${o.isActive ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-lg tracking-wider text-gray-900">{o.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeColors[o.type]}`}>{typeLabels[o.type]}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{o.title}</p>
                    {o.description && <p className="text-xs text-gray-400 mt-0.5">{o.description}</p>}
                  </div>
                  <div className={`text-2xl font-black ${o.isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    {o.type === 'percentage' ? `${o.value}%` : o.type === 'flat' ? `₹${o.value}` : o.type === 'bogo' ? '1+1' : '🚚'}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="px-5 py-3 space-y-2">
                <div className="flex flex-wrap gap-2 text-xs">
                  {(o.minOrderValue ?? 0) > 0 && (
                    <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-lg font-medium">Min ₹{o.minOrderValue}</span>
                  )}
                  {o.maxDiscount && (
                    <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-lg font-medium">Max ₹{o.maxDiscount} off</span>
                  )}
                  {o.usageLimit && (
                    <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-lg font-medium">
                      {o.usageCount}/{o.usageLimit} used
                    </span>
                  )}
                </div>
                {o.endDate && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={11} />
                    <span>Expires {o.endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}

                {/* Progress bar if usageLimit */}
                {o.usageLimit && (
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className="h-1.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"
                      style={{ width: `${Math.min(100, ((o.usageCount || 0) / o.usageLimit) * 100)}%` }} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(o.id)}
                    className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${o.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${o.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className={`text-xs font-semibold ${o.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {o.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(o)}
                    className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => setDeleteId(o.id)}
                    className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {offers.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center text-gray-400 border border-gray-100 shadow-sm">
            <Percent size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No offers yet</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Offer' : 'Create New Offer'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Coupon Code *</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-mono font-bold tracking-wider uppercase" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Offer Type *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Offer['type'] })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                    <option value="percentage">Percentage Off</option>
                    <option value="flat">Flat Discount (₹)</option>
                    <option value="bogo">Buy 1 Get 1</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                {(form.type === 'percentage' || form.type === 'flat') && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      {form.type === 'percentage' ? 'Discount %' : 'Discount Amount (₹)'} *
                    </label>
                    <input value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
                      type="number" placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Offer Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. 20% off on first order" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description</label>
                  <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description of the offer" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Min Order Amount (₹)</label>
                  <input value={form.minOrderValue} onChange={e => setForm({ ...form, minOrderValue: e.target.value })}
                    type="number" placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                {form.type === 'percentage' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Max Discount Cap (₹)</label>
                    <input value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })}
                      type="number" placeholder="Optional" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Start Date</label>
                  <input value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                    type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">End Date</label>
                  <input value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                    type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Usage Limit</label>
                  <input value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                    type="number" placeholder="Unlimited" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <label className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 cursor-pointer">
                  <span className="text-sm font-semibold text-emerald-700">Active Now</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md">
                  {editId ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Offer?</h3>
            <p className="text-sm text-gray-500 mb-6">This coupon code will stop working immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { setOffers(prev => prev.filter(o => o.id !== deleteId)); setDeleteId(null); }}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
