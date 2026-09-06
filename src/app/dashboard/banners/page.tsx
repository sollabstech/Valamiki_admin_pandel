'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { db, storage } from '@/lib/firebase';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, GripVertical, Upload, Info } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

const initForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  isActive: true,
  sortOrder: 0,
};

const gradients = [
  'from-blue-600 to-indigo-600',
  'from-violet-600 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
];

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initForm);
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('sortOrder', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setBanners(snap.docs.map((d) => {
        const r = d.data();
        return {
          id: d.id, title: r.title ?? '', subtitle: r.subtitle ?? '',
          imageUrl: r.imageUrl ?? '', isActive: r.isActive ?? true,
          sortOrder: r.sortOrder ?? 0,
        };
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(initForm);
    setImageFile(null);
    setImagePreview('');
    setUploadError('');
    setShowModal(true);
  };

  const openEdit = (b: Banner) => {
    setEditId(b.id);
    setForm({
      title: b.title, subtitle: b.subtitle, imageUrl: b.imageUrl,
      isActive: b.isActive, sortOrder: b.sortOrder,
    });
    setImageFile(null);
    setImagePreview(b.imageUrl); // show existing image
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
    setSaving(true);
    setUploadError('');
    let imageFailed = false;
    try {
      let imageUrl = form.imageUrl.trim();

      // Upload to Firebase Storage if a new file was picked.
      if (imageFile) {
        try {
          const bannerId = editId ?? `banner_${Date.now()}`;
          const ext = imageFile.name.split('.').pop() ?? 'jpg';
          const storageRef = ref(storage, `banners/${bannerId}/image_${Date.now()}.${ext}`);
          await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(storageRef);
        } catch (imgErr) {
          console.warn('Banner image upload failed:', imgErr);
          imageFailed = true;
          setUploadError(
            'Image upload failed — Firebase Storage is not enabled for this project (or its bucket was removed). ' +
            'Paste an image URL below, or enable Storage in the Firebase console and re-upload.'
          );
          // Don't block the save — fall through with the pasted URL (if any).
        }
      }

      const data = {
        title: form.title.trim(),
        subtitle: '',
        imageUrl,
        isActive: form.isActive,
        // Auto-assign sort order for new banners; keep existing order on edit.
        sortOrder: editId ? form.sortOrder : banners.length + 1,
      };

      if (editId) {
        await updateDoc(doc(db, 'banners', editId), data);
      } else {
        await addDoc(collection(db, 'banners'), { ...data, createdAt: serverTimestamp() });
      }
      // Keep the modal open when the image failed so the warning is visible.
      if (!imageFailed) setShowModal(false);
    } catch (e) {
      console.error('Failed to save banner:', e);
      alert('Failed to save: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteDoc(doc(db, 'banners', id)); }
    catch (e) { alert('Failed to delete: ' + (e instanceof Error ? e.message : String(e))); }
    setDeleteId(null);
  };

  const toggleActive = async (b: Banner) => {
    try { await updateDoc(doc(db, 'banners', b.id), { isActive: !b.isActive }); }
    catch (e) { console.error(e); }
  };

  return (
    <div>
      <Header title="Banners" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            {banners.length} banners · {banners.filter(b => b.isActive).length} active
          </p>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all">
            <Plus size={16} /> Add Banner
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center text-gray-400 border border-gray-100 shadow-sm">
            <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No banners yet — add your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {banners.map((b, i) => (
              <div key={b.id} className={`rounded-2xl overflow-hidden shadow-md ${!b.isActive ? 'opacity-50' : ''}`}>
                {/* Banner preview — relative so the bg image stays inside this section only */}
                <div className={`relative h-36 bg-gradient-to-r ${gradients[i % gradients.length]} p-5 flex flex-col justify-between`}>
                  {b.imageUrl && (
                    <div className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
                      style={{ backgroundImage: `url(${b.imageUrl})` }} />
                  )}
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-white font-bold text-lg leading-tight">{b.title}</p>
                      {b.subtitle && <p className="text-white/80 text-sm mt-0.5">{b.subtitle}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.isActive ? 'bg-white/20 text-white' : 'bg-black/20 text-white/70'}`}>
                      {b.isActive ? '● Live' : '○ Off'}
                    </span>
                  </div>
                  <div className="relative flex items-center gap-1 text-white/60 text-xs">
                    <GripVertical size={12} />
                    <span>Order: {b.sortOrder || i + 1}</span>
                  </div>
                </div>

                {/* Actions bar */}
                <div className="bg-white border border-gray-100 px-4 py-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500 font-medium truncate pr-2">
                    {b.title || <span className="italic text-gray-300">No title</span>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleActive(b)}
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
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Banner' : 'Add Banner'}</h2>
              <button onClick={() => !saving && setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={16} /></button>
            </div>

            <div className="p-6 space-y-4">

              {/* ── Banner Image Upload ─────────────────────────────────────────── */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Banner Image</label>

                {/* Dimensions guide */}
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-3">
                  <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-semibold">Recommended: 1440 × 480 px (3:1 ratio)</p>
                    <p className="text-blue-600 mt-0.5">Max 2MB · JPG or PNG · Wide landscape image</p>
                  </div>
                </div>

                {/* Preview / upload area */}
                {imagePreview ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                    <img src={imagePreview} alt="Banner preview" className="w-full h-full object-cover" />
                    {/* Overlay ratio example */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex items-end p-3">
                      <p className="text-white text-xs font-semibold opacity-80">Preview (3:1 crop)</p>
                    </div>
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); setForm(f => ({ ...f, imageUrl: '' })); }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-gray-400 hover:text-blue-500">
                    <Upload size={22} />
                    <span className="text-sm font-medium">Click to upload banner image</span>
                    <span className="text-xs">1440 × 480px recommended</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

                {uploadError && (
                  <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    ⚠️ {uploadError}
                  </div>
                )}

                {/* Fallback: paste URL */}
                <div className="mt-2">
                  <label className="text-xs text-gray-400 mb-1 block">Or paste an image URL</label>
                  <input value={form.imageUrl} onChange={e => { setForm({ ...form, imageUrl: e.target.value }); if (e.target.value) setImagePreview(e.target.value); }}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Banner Title <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Fresh Groceries Sale"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              </div>

              <label className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3 cursor-pointer">
                <span className="text-sm font-semibold text-emerald-700">Show on Website</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>

              <div className="flex gap-3">
                <button onClick={() => !saving && setShowModal(false)} disabled={saving}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {saving ? (imageFile ? 'Uploading image…' : 'Saving…') : (editId ? 'Save Changes' : 'Add Banner')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ──────────────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Banner?</h3>
            <p className="text-sm text-gray-500 mb-6">This banner will be removed from the website immediately.</p>
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
