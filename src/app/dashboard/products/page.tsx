'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { db, storage } from '@/lib/firebase';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Search, Edit2, Trash2, Package, X, Check, ImagePlus, Star } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  discountPrice: number;
  discountPercent: number;
  images: string[];
  unit: string;
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isFlashDeal: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

/** A single image slot: preview = URL shown, file = new upload (undefined = keep existing URL). */
type ImageEntry = { preview: string; file?: File };

const MAX_IMAGES = 7;

const initialForm = {
  name: '', description: '', categoryId: '', categoryName: '',
  price: '', discountPrice: '', unit: '', stock: '',
  isAvailable: true, isFeatured: false, isPopular: false, isFlashDeal: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(initialForm);
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const addImgRef = useRef<HTMLInputElement>(null);

  // ── Real-time Firestore listeners ──────────────────────────────────────────

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => {
        const r = d.data();
        return {
          id: d.id, name: r.name ?? '', description: r.description ?? '',
          categoryId: r.categoryId ?? '', categoryName: r.categoryName ?? '',
          price: r.price ?? 0, discountPrice: r.discountPrice ?? 0,
          discountPercent: r.discountPercent ?? 0, images: r.images ?? [],
          unit: r.unit ?? '', stock: r.stock ?? 0,
          isAvailable: r.isAvailable ?? true, isFeatured: r.isFeatured ?? false,
          isPopular: r.isPopular ?? false, isFlashDeal: r.isFlashDeal ?? false,
          rating: r.rating ?? 0, reviewCount: r.reviewCount ?? 0, tags: r.tags ?? [],
        };
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  // Load categories from Firestore so the dropdown has real doc IDs.
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'categories'), (snap) => {
      setCategories(snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name ?? '',
        icon: d.data().icon ?? '📦',
      })));
    });
    return () => unsub();
  }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.categoryId === filterCat;
    return matchSearch && matchCat;
  });

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditProduct(null);
    setForm({
      ...initialForm,
      // Default to first available Firestore category
      categoryId: categories[0]?.id ?? '',
      categoryName: categories[0]?.name ?? '',
    });
    setImageEntries([]);
    setUploadError('');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description,
      categoryId: p.categoryId, categoryName: p.categoryName,
      price: String(p.price), discountPrice: String(p.discountPrice || ''),
      unit: p.unit, stock: String(p.stock),
      isAvailable: p.isAvailable, isFeatured: p.isFeatured,
      isPopular: p.isPopular, isFlashDeal: p.isFlashDeal,
    });
    // Populate image entries from existing URLs (no File = keep as-is on save).
    setImageEntries(p.images.map((url) => ({ preview: url })));
    setUploadError('');
    setShowModal(true);
  };

  // ── Image management ───────────────────────────────────────────────────────

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - imageEntries.length;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining).map((file) => ({
      preview: URL.createObjectURL(file),
      file,
    }));
    setImageEntries((prev) => [...prev, ...toAdd]);
    e.target.value = ''; // reset so same file can be re-added
  };

  const removeImage = (index: number) => {
    setImageEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImageToFront = (index: number) => {
    if (index === 0) return;
    setImageEntries((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.unshift(moved);
      return next;
    });
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    setUploadError('');
    try {
      const price = parseFloat(form.price) || 0;
      const discountPrice = parseFloat(form.discountPrice) || 0;
      const discountPercent = price > 0 && discountPrice > 0
        ? Math.round(((price - discountPrice) / price) * 100) : 0;

      // Resolve category name from Firestore categories list.
      const selectedCat = categories.find((c) => c.id === form.categoryId);
      const catName = selectedCat?.name ?? form.categoryName ?? form.categoryId;

      // Pre-generate a stable ID for the Storage path (Firestore addDoc auto-generates its own).
      const storageId = editProduct?.id ?? `p_${Date.now()}`;

      // Upload new images; keep existing URLs as-is.
      const finalImages: string[] = [];
      let hadUploadError = false;
      for (let i = 0; i < imageEntries.length; i++) {
        const entry = imageEntries[i];
        if (entry.file) {
          try {
            const ext = entry.file.name.split('.').pop() ?? 'jpg';
            const storageRef = ref(storage, `products/${storageId}/img_${i}_${Date.now()}.${ext}`);
            await uploadBytes(storageRef, entry.file);
            const url = await getDownloadURL(storageRef);
            finalImages.push(url);
          } catch (imgErr) {
            console.warn('Image upload failed:', imgErr);
            hadUploadError = true;
            // Skip this image slot — don't push a broken URL.
          }
        } else {
          // Existing https: URL — keep it.
          finalImages.push(entry.preview);
        }
      }

      if (hadUploadError) {
        setUploadError('Some images failed to upload. Check Firebase Storage rules (allow write: if true for dev).');
      }

      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        categoryName: catName,
        price, discountPrice, discountPercent,
        images: finalImages,
        unit: form.unit.trim(),
        stock: parseInt(form.stock) || 0,
        isAvailable: form.isAvailable,
        isFeatured: form.isFeatured,
        isPopular: form.isPopular,
        isFlashDeal: form.isFlashDeal,
        rating: editProduct?.rating ?? 0,
        reviewCount: editProduct?.reviewCount ?? 0,
        tags: editProduct?.tags ?? [],
      };

      if (editProduct) {
        await updateDoc(doc(db, 'products', editProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp() });
      }

      // Close modal only when all images uploaded successfully.
      if (!hadUploadError) setShowModal(false);
    } catch (e) {
      console.error('Failed to save product:', e);
      alert('Failed to save product: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteDoc(doc(db, 'products', id)); } catch (e) { console.error(e); }
    setDeleteId(null);
  };

  const toggleAvailable = async (p: Product) => {
    try { await updateDoc(doc(db, 'products', p.id), { isAvailable: !p.isAvailable }); }
    catch (e) { console.error(e); }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <Header title="Products" />
      <div className="p-6 space-y-5">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 flex-1 min-w-48 shadow-sm">
              <Search size={15} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products..." className="text-sm outline-none w-full text-gray-700 placeholder-gray-400" />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 shadow-sm outline-none">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all whitespace-nowrap">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Stats pills */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Total', count: products.length, color: 'bg-blue-50 text-blue-700' },
            { label: 'Available', count: products.filter(p => p.isAvailable).length, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Out of Stock', count: products.filter(p => p.stock === 0).length, color: 'bg-red-50 text-red-600' },
            { label: 'Featured', count: products.filter(p => p.isFeatured).length, color: 'bg-violet-50 text-violet-700' },
            { label: 'Flash Deals', count: products.filter(p => p.isFlashDeal).length, color: 'bg-orange-50 text-orange-600' },
          ].map(s => (
            <span key={s.label} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${s.color}`}>
              {s.label}: {s.count}
            </span>
          ))}
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading products...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Product', 'Category', 'Price', 'Discount', 'Stock', 'Badges', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id} className={`border-t border-gray-50 hover:bg-gray-50/50 ${i % 2 === 1 ? 'bg-gray-50/20' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.images[0]
                              ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                              : <Package size={16} className="text-gray-400" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 leading-tight">{p.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{p.unit} · {p.images.length} photo{p.images.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">{p.categoryName}</span>
                      </td>
                      <td className="px-5 py-4"><p className="font-bold text-gray-900">₹{p.price}</p></td>
                      <td className="px-5 py-4">
                        {p.discountPrice > 0 ? (
                          <div>
                            <p className="font-semibold text-emerald-600">₹{p.discountPrice}</p>
                            <p className="text-xs text-orange-500 font-medium">{p.discountPercent}% off</p>
                          </div>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-semibold text-sm ${p.stock === 0 ? 'text-red-500' : p.stock < 20 ? 'text-orange-500' : 'text-gray-700'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {p.isFeatured && <span className="text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded font-semibold">Featured</span>}
                          {p.isPopular && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold">Popular</span>}
                          {p.isFlashDeal && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-semibold">⚡ Flash</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => toggleAvailable(p)}
                          className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${p.isAvailable ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.isAvailable ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Edit2 size={13} /></button>
                          <button onClick={() => setDeleteId(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    {products.length === 0 ? 'No products yet — add your first product!' : 'No products match your search'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => !saving && setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={16} /></button>
            </div>

            <div className="p-6 space-y-5">

              {/* ── Images grid ───────────────────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">
                    Product Photos <span className="text-gray-400 font-normal">({imageEntries.length}/{MAX_IMAGES}) — first photo is the main thumbnail</span>
                  </label>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {imageEntries.map((entry, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={entry.preview} alt={`img-${i}`} className="w-full h-full object-cover" />
                      {/* Main badge */}
                      {i === 0 && (
                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">MAIN</span>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {i > 0 && (
                          <button type="button" onClick={() => moveImageToFront(i)}
                            title="Set as main photo"
                            className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-blue-600 hover:bg-white">
                            <Star size={12} />
                          </button>
                        )}
                        <button type="button" onClick={() => removeImage(i)}
                          title="Remove photo"
                          className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-white">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add slot */}
                  {imageEntries.length < MAX_IMAGES && (
                    <button type="button" onClick={() => addImgRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-gray-400 hover:text-blue-500">
                      <ImagePlus size={20} />
                      <span className="text-[10px] font-semibold">Add Photo</span>
                    </button>
                  )}
                </div>

                <input ref={addImgRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddImages} />

                {uploadError && (
                  <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    ⚠️ {uploadError}
                  </div>
                )}
              </div>

              {/* ── Fields ─────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Product Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Fresh Tomatoes"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} placeholder="Product description..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category *</label>
                  {categories.length === 0 ? (
                    <div className="w-full border border-dashed border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-400">
                      Loading categories…
                    </div>
                  ) : (
                    <select value={form.categoryId}
                      onChange={e => {
                        const cat = categories.find(c => c.id === e.target.value);
                        setForm({ ...form, categoryId: e.target.value, categoryName: cat?.name ?? '' });
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Unit *</label>
                  <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                    placeholder="e.g. 500g, 1 piece, 1 kg"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Original Price (₹) *</label>
                  <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    type="number" placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Discount Price (₹)</label>
                  <input value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })}
                    type="number" placeholder="Leave empty for no discount"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Stock Quantity *</label>
                  <input value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    type="number" placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>

                {/* Discount preview */}
                {form.price && form.discountPrice && parseFloat(form.price) > 0 && parseFloat(form.discountPrice) > 0 && (
                  <div className="col-span-2 bg-emerald-50 rounded-xl p-3 flex items-center gap-3">
                    <Check size={16} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-700 font-medium">
                      Discount: <strong>{Math.round(((parseFloat(form.price) - parseFloat(form.discountPrice)) / parseFloat(form.price)) * 100)}% OFF</strong>
                      &nbsp;(Save ₹{(parseFloat(form.price) - parseFloat(form.discountPrice)).toFixed(0)})
                    </p>
                  </div>
                )}

                {/* Toggle switches */}
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  {([
                    { key: 'isAvailable', label: 'Available', color: 'emerald' },
                    { key: 'isFeatured', label: 'Featured', color: 'violet' },
                    { key: 'isPopular', label: 'Popular', color: 'blue' },
                    { key: 'isFlashDeal', label: '⚡ Flash Deal', color: 'orange' },
                  ] as const).map(({ key, label, color }) => (
                    <label key={key}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer border ${
                        color === 'emerald' ? 'bg-emerald-50 border-emerald-100' :
                        color === 'violet' ? 'bg-violet-50 border-violet-100' :
                        color === 'orange' ? 'bg-orange-50 border-orange-100' :
                        'bg-blue-50 border-blue-100'
                      }`}>
                      <span className={`text-sm font-semibold ${
                        color === 'emerald' ? 'text-emerald-700' :
                        color === 'violet' ? 'text-violet-700' :
                        color === 'orange' ? 'text-orange-700' :
                        'text-blue-700'
                      }`}>{label}</span>
                      <button type="button"
                        onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                        className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${form[key] ? (
                          color === 'emerald' ? 'bg-emerald-500' :
                          color === 'violet' ? 'bg-violet-500' :
                          color === 'orange' ? 'bg-orange-500' :
                          'bg-blue-500'
                        ) : 'bg-gray-200'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Footer buttons ──────────────────────────────────────────────── */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => !saving && setShowModal(false)} disabled={saving}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.price}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {saving
                    ? (imageEntries.some(e => e.file) ? 'Uploading photos…' : 'Saving…')
                    : (editProduct ? 'Save Changes' : 'Add Product')}
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
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-6">This will remove it from Firestore and the website immediately.</p>
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
