'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { db, storage } from '@/lib/firebase';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Edit2, Trash2, X, Tag, Upload, Info } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;   // now stores image URL (or legacy emoji)
  color: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
}

const initForm = { name: '', icon: '', color: '#1A73E8', isActive: true, sortOrder: 0 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setCategories(snap.docs.map((d) => {
        const r = d.data();
        return {
          id: d.id,
          name: r.name ?? '',
          icon: r.icon ?? '',
          color: r.color ?? '#1A73E8',
          isActive: r.isActive ?? true,
          sortOrder: r.sortOrder ?? 0,
          productCount: r.productCount ?? 0,
        };
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const openAdd = () => {
    setEditId(null); setForm(initForm);
    setImageFile(null); setImagePreview(''); setUploadError('');
    setShowModal(true);
  };

  const openEdit = (c: Category) => {
    setEditId(c.id);
    setForm({ name: c.name, icon: c.icon, color: c.color, isActive: c.isActive, sortOrder: c.sortOrder });
    setImageFile(null);
    setImagePreview(c.icon.startsWith('http') ? c.icon : '');
    setUploadError('');
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setUploadError('');
    try {
      let iconUrl = form.icon;

      if (imageFile) {
        try {
          const catId = editId ?? `cat_${Date.now()}`;
          const ext = imageFile.name.split('.').pop() ?? 'jpg';
          const storageRef = ref(storage, `categories/${catId}/icon_${Date.now()}.${ext}`);
          await uploadBytes(storageRef, imageFile);
          iconUrl = await getDownloadURL(storageRef);
        } catch (imgErr) {
          console.warn('Category image upload failed:', imgErr);
          setUploadError('Image upload failed. Check Firebase Storage rules. You can paste an image URL below instead.');
          setSaving(false);
          return;
        }
      }

      const data = {
        name: form.name.trim(),
        icon: iconUrl,
        color: form.color,
        isActive: form.isActive,
        sortOrder: editId ? form.sortOrder : categories.length + 1,
      };

      if (editId) {
        await updateDoc(doc(db, 'categories', editId), data);
      } else {
        await addDoc(collection(db, 'categories'), { ...data, productCount: 0, createdAt: serverTimestamp() });
      }
      setShowModal(false);
    } catch (e) {
      console.error('Failed to save category:', e);
      alert('Failed to save: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteDoc(doc(db, 'categories', id)); }
    catch (e) { alert('Failed to delete: ' + (e instanceof Error ? e.message : String(e))); }
    setDeleteId(null);
  };

  const toggleActive = async (c: Category) => {
    try { await updateDoc(doc(db, 'categories', c.id), { isActive: !c.isActive }); }
    catch (e) { console.error(e); }
  };

  // Helper: render category icon (image URL or legacy emoji)
  const CategoryIcon = ({ icon, color, size = 'md' }: { icon: string; color: string; size?: 'sm' | 'md' }) => {
    const dim = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14';
    if (icon.startsWith('http')) {
      return (
        <div className={`${dim} rounded-2xl overflow-hidden flex items-center justify-center shadow-sm`}
          style={{ background: `${color}18` }}>
          <img src={icon} alt="" className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className={`${dim} rounded-2xl flex items-center justify-center text-3xl shadow-sm`}
        style={{ background: `${color}18` }}>
        {icon || '📦'}
      </div>
    );
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

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No categories yet — add your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map(c => (
              <div key={c.id} className={`bg-white rounded-2xl shadow-sm border-2 p-5 transition-all ${c.isActive ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
                <div className="flex items-start justify-between mb-4">
                  <CategoryIcon icon={c.icon} color={c.color} />
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"><Edit2 size={12} /></button>
                    <button onClick={() => setDeleteId(c.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"><Trash2 size={12} /></button>
                  </div>
                </div>
                <p className="font-bold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-400 mt-1">{c.productCount} products</p>
                <div className="flex items-center justify-between mt-3">
                  <button onClick={() => toggleActive(c)}
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold cursor-pointer transition-colors ${c.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                    {c.isActive ? 'Active' : 'Hidden'}
                  </button>
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => !saving && setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">

              {/* Category Name */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Grocery"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              </div>

              {/* Category Image */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category Image</label>

                {/* Size guide */}
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-3">
                  <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-semibold">Recommended: 200 × 200 px (1:1 square)</p>
                    <p className="text-blue-600 mt-0.5">Max 1MB · PNG or JPG · Transparent background preferred</p>
                  </div>
                </div>

                {imagePreview ? (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 mx-auto">
                    <img src={imagePreview} alt="Category icon preview" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => { setImageFile(null); setImagePreview(''); setForm(f => ({ ...f, icon: '' })); }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-gray-400 hover:text-blue-500">
                    <Upload size={20} />
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs">200 × 200px recommended</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

                {uploadError && (
                  <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    ⚠️ {uploadError}
                  </div>
                )}

                {/* Paste URL fallback */}
                <div className="mt-2">
                  <label className="text-xs text-gray-400 mb-1 block">Or paste an image URL</label>
                  <input value={form.icon.startsWith('http') ? form.icon : ''}
                    onChange={e => { setForm({ ...form, icon: e.target.value }); if (e.target.value) setImagePreview(e.target.value); }}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                    type="color" className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                  <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                    placeholder="#1A73E8"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-mono" />
                </div>
              </div>

              {/* Preview */}
              {form.name && (
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: `${form.color}22` }}>
                    {imagePreview
                      ? <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                      : <span className="text-xl">📦</span>}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{form.name}</p>
                    <p className="text-xs text-gray-400">Preview</p>
                  </div>
                </div>
              )}

              {/* Visible toggle */}
              <label className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3 cursor-pointer">
                <span className="text-sm font-semibold text-emerald-700">Visible on Website</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>

              <div className="flex gap-3">
                <button onClick={() => !saving && setShowModal(false)} disabled={saving}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {saving ? (imageFile ? 'Uploading…' : 'Saving…') : (editId ? 'Save Changes' : 'Add Category')}
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
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Category?</h3>
            <p className="text-sm text-gray-500 mb-6">Products in this category won&apos;t be deleted, but they will be uncategorized.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
