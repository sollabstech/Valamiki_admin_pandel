'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import { mockCategories } from '@/lib/mockData';
import { Category } from '@/lib/types';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';

const initForm = { name: '', icon: '', color: '#1A73E8', isActive: true, sortOrder: 0 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setEditId(null); setForm(initForm); setShowModal(true); };
  const openEdit = (c: Category) => {
    setEditId(c.id);
    setForm({ name: c.name, icon: c.icon, color: c.color || '#1A73E8', isActive: c.isActive, sortOrder: c.sortOrder || 0 });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editId) {
      setCategories(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
    } else {
      setCategories(prev => [...prev, { ...form, id: `cat${Date.now()}`, productCount: 0 }]);
    }
    setShowModal(false);
  };

  return (
    <div>
      <Header title="Categories" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">{categories.length} categories total</p>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all">
            <Plus size={16} /> Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(c => (
            <div key={c.id} className={`bg-white rounded-2xl shadow-sm border-2 p-5 transition-all ${c.isActive ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                  style={{ background: `${c.color}18` }}>
                  {c.icon}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"><Edit2 size={12} /></button>
                  <button onClick={() => setDeleteId(c.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"><Trash2 size={12} /></button>
                </div>
              </div>
              <p className="font-bold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-400 mt-1">{c.productCount || 0} products</p>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {c.isActive ? 'Active' : 'Hidden'}
                </span>
                <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Grocery" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Emoji Icon *</label>
                  <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                    placeholder="e.g. 🛒" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-center text-2xl" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Color</label>
                  <div className="flex gap-2 items-center">
                    <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                      type="color" className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                    <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                      placeholder="#1A73E8" className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-mono" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Sort Order</label>
                <input value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  type="number" placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              </div>
              {/* Preview */}
              {form.name && form.icon && (
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${form.color}22` }}>{form.icon}</div>
                  <div>
                    <p className="font-bold text-gray-900">{form.name}</p>
                    <p className="text-xs text-gray-400">Preview</p>
                  </div>
                </div>
              )}
              <label className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3 cursor-pointer">
                <span className="text-sm font-semibold text-emerald-700">Visible in App</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md">
                  {editId ? 'Save Changes' : 'Add Category'}
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
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Category?</h3>
            <p className="text-sm text-gray-500 mb-6">Products in this category won&apos;t be deleted, but they will be uncategorized.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { setCategories(prev => prev.filter(c => c.id !== deleteId)); setDeleteId(null); }} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
