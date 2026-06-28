'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import { mockProducts, mockCategories } from '@/lib/mockData';
import { Product } from '@/lib/types';
import { Plus, Search, Edit2, Trash2, Eye, Star, Package, X, Check } from 'lucide-react';

const initialForm = {
  name: '', description: '', categoryId: 'grocery', categoryName: 'Grocery',
  price: '', discountPrice: '', unit: '', stock: '',
  isAvailable: true, isFeatured: false, isPopular: false, isFlashDeal: false,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(initialForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.categoryId === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditProduct(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description, categoryId: p.categoryId,
      categoryName: p.categoryName, price: String(p.price),
      discountPrice: String(p.discountPrice), unit: p.unit, stock: String(p.stock),
      isAvailable: p.isAvailable, isFeatured: p.isFeatured,
      isPopular: p.isPopular, isFlashDeal: p.isFlashDeal,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const price = parseFloat(form.price) || 0;
    const discountPrice = parseFloat(form.discountPrice) || 0;
    const discountPercent = price > 0 && discountPrice > 0
      ? Math.round(((price - discountPrice) / price) * 100) : 0;
    const catName = mockCategories.find(c => c.id === form.categoryId)?.name || form.categoryId;

    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id
        ? { ...p, name: form.name, description: form.description, categoryId: form.categoryId,
            categoryName: catName, price, discountPrice, discountPercent, unit: form.unit,
            stock: parseInt(form.stock) || 0, isAvailable: form.isAvailable,
            isFeatured: form.isFeatured, isPopular: form.isPopular, isFlashDeal: form.isFlashDeal }
        : p
      ));
    } else {
      const newProduct: Product = {
        id: `p${Date.now()}`, name: form.name, description: form.description,
        categoryId: form.categoryId, categoryName: catName, price, discountPrice, discountPercent,
        unit: form.unit, stock: parseInt(form.stock) || 0, isAvailable: form.isAvailable,
        isFeatured: form.isFeatured, isPopular: form.isPopular, isFlashDeal: form.isFlashDeal,
        images: [], rating: 0, reviewCount: 0, tags: [], createdAt: new Date(),
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
  };

  const toggleAvailable = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isAvailable: !p.isAvailable } : p));
  };

  return (
    <div>
      <Header title="Products" />
      <div className="p-6 space-y-5">

        {/* Top Bar */}
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
              {mockCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                  <tr key={p.id} className={`border-t border-gray-50 hover:bg-gray-50/50 ${i % 2 === 0 ? '' : 'bg-gray-50/20'}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{p.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{p.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">{p.categoryName}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">₹{p.price}</p>
                    </td>
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
                      <button onClick={() => toggleAvailable(p.id)}
                        className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${p.isAvailable ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.isAvailable ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteId(p.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Product Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Fresh Tomatoes" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} placeholder="Product description..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category *</label>
                  <select value={form.categoryId}
                    onChange={e => setForm({ ...form, categoryId: e.target.value, categoryName: mockCategories.find(c => c.id === e.target.value)?.name || '' })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                    {mockCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Unit *</label>
                  <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                    placeholder="e.g. 500g, 1 piece, 1 kg" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Original Price (₹) *</label>
                  <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    type="number" placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Discount Price (₹)</label>
                  <input value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })}
                    type="number" placeholder="0 (leave empty for no discount)" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Stock Quantity *</label>
                  <input value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    type="number" placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                {/* Price preview */}
                {form.price && form.discountPrice && parseFloat(form.price) > 0 && parseFloat(form.discountPrice) > 0 && (
                  <div className="col-span-2 bg-emerald-50 rounded-xl p-3 flex items-center gap-3">
                    <Check size={16} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-700 font-medium">
                      Discount: <strong>{Math.round(((parseFloat(form.price) - parseFloat(form.discountPrice)) / parseFloat(form.price)) * 100)}% OFF</strong>
                      &nbsp;(Save ₹{(parseFloat(form.price) - parseFloat(form.discountPrice)).toFixed(0)})
                    </p>
                  </div>
                )}
                {/* Toggles */}
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  {[
                    { key: 'isAvailable', label: 'Available', color: 'emerald' },
                    { key: 'isFeatured', label: 'Featured', color: 'violet' },
                    { key: 'isPopular', label: 'Popular', color: 'blue' },
                    { key: 'isFlashDeal', label: '⚡ Flash Deal', color: 'orange' },
                  ].map(({ key, label, color }) => (
                    <label key={key} className={`flex items-center justify-between bg-${color}-50 border border-${color}-100 rounded-xl px-4 py-3 cursor-pointer`}>
                      <span className={`text-sm font-semibold text-${color}-700`}>{label}</span>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                        className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${(form as Record<string, boolean | string>)[key] ? `bg-${color}-500` : 'bg-gray-200'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${(form as Record<string, boolean | string>)[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md">
                  {editProduct ? 'Save Changes' : 'Add Product'}
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
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
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
