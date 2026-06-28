'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import { mockBanners } from '@/lib/mockData';
import { Banner } from '@/lib/types';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, GripVertical } from 'lucide-react';

const initForm = { title: '', subtitle: '', imageUrl: '', linkType: 'category', linkValue: '', isActive: true, sortOrder: 0 };

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>(mockBanners);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setEditId(null); setForm(initForm); setShowModal(true); };
  const openEdit = (b: Banner) => {
    setEditId(b.id);
    setForm({ title: b.title, subtitle: b.subtitle || '', imageUrl: b.imageUrl, linkType: b.linkType || 'category', linkValue: b.linkValue || '', isActive: b.isActive, sortOrder: b.sortOrder || 0 });
    setShowModal(true);
  };
  const handleSave = () => {
    if (editId) {
      setBanners(prev => prev.map(b => b.id === editId ? { ...b, ...form } : b));
    } else {
      setBanners(prev => [...prev, { ...form, id: `ban${Date.now()}` }]);
    }
    setShowModal(false);
  };

  const gradients = [
    'from-blue-600 to-indigo-600', 'from-violet-600 to-purple-600',
    'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500', 'from-cyan-500 to-blue-500',
  ];

  return (
    <div>
      <Header title="Banners" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">{banners.length} banners · {banners.filter(b => b.isActive).length} active</p>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all">
            <Plus size={16} /> Add Banner
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map((b, i) => (
            <div key={b.id} className={`relative rounded-2xl overflow-hidden shadow-md ${!b.isActive ? 'opacity-50' : ''}`}>
              {/* Banner preview */}
              <div className={`h-36 bg-gradient-to-r ${gradients[i % gradients.length]} p-5 flex flex-col justify-between`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">{b.title}</p>
                    {b.subtitle && <p className="text-white/80 text-sm mt-0.5">{b.subtitle}</p>}
                  </div>
                  <div className="flex gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.isActive ? 'bg-white/20 text-white' : 'bg-black/20 text-white/70'}`}>
                      {b.isActive ? '● Live' : '○ Off'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-white/60 text-xs">
                  <GripVertical size={12} />
                  <span>Order: {b.sortOrder || i + 1}</span>
                </div>
              </div>

              {/* Actions bar */}
              <div className="bg-white border border-gray-100 px-4 py-3 flex items-center justify-between">
                <div className="text-xs text-gray-500 font-medium">
                  {b.linkType && <span className="capitalize">{b.linkType}: <span className="text-blue-600 font-bold">{b.linkValue || '—'}</span></span>}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setBanners(prev => prev.map(ban => ban.id === b.id ? { ...ban, isActive: !ban.isActive } : ban))}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${b.isActive ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                    {b.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => openEdit(b)} className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"><Edit2 size={12} /></button>
                  <button onClick={() => setDeleteId(b.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {banners.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center text-gray-400 border border-gray-100 shadow-sm">
            <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No banners yet</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Banner' : 'Add Banner'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Banner Title *', key: 'title', placeholder: 'e.g. Big Weekend Sale' },
                { label: 'Subtitle', key: 'subtitle', placeholder: 'e.g. Up to 50% off on groceries' },
                { label: 'Image URL', key: 'imageUrl', placeholder: 'https://...' },
                { label: 'Link Value', key: 'linkValue', placeholder: 'e.g. grocery, product123' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.label}</label>
                  <input value={(form as Record<string, string | number | boolean>)[f.key] as string}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link Type</label>
                  <select value={form.linkType} onChange={e => setForm({ ...form, linkType: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                    <option value="category">Category</option>
                    <option value="product">Product</option>
                    <option value="offer">Offer Page</option>
                    <option value="external">External URL</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Sort Order</label>
                  <input value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    type="number" placeholder="1" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
              </div>
              <label className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3 cursor-pointer">
                <span className="text-sm font-semibold text-emerald-700">Show in App</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md">
                  {editId ? 'Save Changes' : 'Add Banner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Banner?</h3>
            <p className="text-sm text-gray-500 mb-6">This banner will be removed from the app.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { setBanners(prev => prev.filter(b => b.id !== deleteId)); setDeleteId(null); }} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
