'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import {
  collection, onSnapshot, doc, updateDoc,
  query, orderBy, Timestamp,
} from 'firebase/firestore';
import { Search, Eye, X, MapPin, Phone, Package, FileText } from 'lucide-react';

// ── Invoice PDF generator (browser print-to-PDF) ──────────────────────────────
function printInvoice(order: Order) {
  const invoiceNo = `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = order.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const dueDate = new Date(order.createdAt.getTime() + 7 * 86400000)
    .toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const itemRows = order.products.map((p, i) => {
    const unitPrice = Math.round(p.totalPrice / p.quantity);
    return `
      <tr>
        <td class="sno">${i + 1}</td>
        <td>${p.name}</td>
        <td class="center">${p.quantity}</td>
        <td class="right">₹${unitPrice.toLocaleString('en-IN')}</td>
        <td class="right">₹${p.totalPrice.toLocaleString('en-IN')}</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${invoiceNo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #fff; padding: 40px; }
  .page { max-width: 750px; margin: 0 auto; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
  .brand-name { font-size: 26px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
  .brand-tag { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .brand-contact { font-size: 11px; color: #6b7280; line-height: 1.7; text-align: right; }

  /* Invoice meta */
  .meta-bar { background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 8px; padding: 14px 20px; display: flex; gap: 48px; margin-bottom: 28px; }
  .meta-bar .meta-item label { font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #6b7280; display: block; margin-bottom: 3px; }
  .meta-bar .meta-item span { font-size: 13px; font-weight: 700; color: #1e3a8a; }

  /* Addresses */
  .addresses { display: flex; gap: 24px; margin-bottom: 28px; }
  .addr-box { flex: 1; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; }
  .addr-box h4 { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; color: #9ca3af; margin-bottom: 8px; }
  .addr-box p { font-size: 13px; line-height: 1.6; color: #374151; }
  .addr-box .name { font-weight: 700; font-size: 14px; color: #111827; }

  /* Table */
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #2563eb; color: #fff; }
  thead th { padding: 10px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; text-align: left; }
  thead th.center { text-align: center; }
  thead th.right { text-align: right; }
  tbody tr { border-bottom: 1px solid #f3f4f6; }
  tbody tr:hover { background: #f8faff; }
  tbody td { padding: 11px 12px; font-size: 13px; color: #374151; }
  tbody td.sno { color: #9ca3af; font-size: 11px; width: 36px; }
  tbody td.center { text-align: center; }
  tbody td.right { text-align: right; font-weight: 600; }

  /* Totals */
  .totals { width: 280px; margin-left: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
  .totals .row { display: flex; justify-content: space-between; padding: 9px 16px; font-size: 13px; color: #6b7280; border-bottom: 1px solid #f3f4f6; }
  .totals .row.discount { color: #059669; }
  .totals .row.total { background: #2563eb; color: #fff; font-weight: 800; font-size: 15px; border-bottom: none; }

  /* Payment */
  .payment-row { display: flex; align-items: center; gap: 10px; margin-top: 24px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; }
  .payment-row .label { font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: .5px; }
  .payment-row .value { font-weight: 700; font-size: 14px; color: #065f46; margin-top: 2px; }

  /* Footer */
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
  .footer .thanks { font-size: 14px; font-weight: 700; color: #2563eb; }
  .footer .note { font-size: 11px; color: #9ca3af; }

  @media print {
    body { padding: 20px; }
    @page { size: A4; margin: 15mm; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-name">VALAMIKI</div>
      <div class="brand-tag">Grocery &amp; Stationery Store</div>
    </div>
    <div class="brand-contact">
      123, Market Road, Salem — 636001<br/>
      Tamil Nadu, India<br/>
      support@valamiki.com &nbsp;·&nbsp; +91 98765 43210<br/>
      GSTIN: 33XXXXX1234X1ZX (update later)
    </div>
  </div>

  <!-- Invoice meta -->
  <div class="meta-bar">
    <div class="meta-item"><label>Invoice No.</label><span>${invoiceNo}</span></div>
    <div class="meta-item"><label>Invoice Date</label><span>${invoiceDate}</span></div>
    <div class="meta-item"><label>Due Date</label><span>${dueDate}</span></div>
    <div class="meta-item"><label>Status</label><span style="text-transform:capitalize">${order.orderStatus}</span></div>
  </div>

  <!-- Addresses -->
  <div class="addresses">
    <div class="addr-box">
      <h4>From</h4>
      <p class="name">Valamiki Store</p>
      <p>123, Market Road, Salem<br/>Tamil Nadu — 636001<br/>+91 98765 43210</p>
    </div>
    <div class="addr-box">
      <h4>Bill To / Ship To</h4>
      <p class="name">${order.deliveryAddress?.name || '—'}</p>
      <p>
        ${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''} — ${order.deliveryAddress?.pincode || ''}<br/>
        Phone: ${order.deliveryAddress?.phone || '—'}
      </p>
    </div>
  </div>

  <!-- Items table -->
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product Description</th>
        <th class="center">Qty</th>
        <th class="right">Unit Price</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="row"><span>Subtotal</span><span>₹${order.subtotal.toLocaleString('en-IN')}</span></div>
    <div class="row"><span>Delivery Charge</span><span>${order.deliveryCharge === 0 ? 'Free' : '₹' + order.deliveryCharge.toLocaleString('en-IN')}</span></div>
    ${order.discount > 0 ? `<div class="row discount"><span>Discount</span><span>-₹${order.discount.toLocaleString('en-IN')}</span></div>` : ''}
    <div class="row total"><span>Total Due</span><span>₹${order.totalPrice.toLocaleString('en-IN')}</span></div>
  </div>

  <!-- Payment method -->
  <div class="payment-row">
    <div>
      <div class="label">Payment Method</div>
      <div class="value" style="text-transform:capitalize">${order.paymentMethod}</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="thanks">Thank you for shopping with Valamiki! 🛒</div>
    <div class="note">This is a computer-generated invoice.<br/>No signature required.</div>
  </div>

</div>
<script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); }
}

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem { name: string; quantity: number; totalPrice: number; }
interface Address { name: string; phone: string; street: string; city: string; pincode: string; }
interface Order {
  id: string;
  userId: string;
  orderStatus: OrderStatus;
  totalPrice: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  paymentMethod: string;
  products: OrderItem[];
  deliveryAddress: Address;
  createdAt: Date;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];
const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data: Order[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          userId: raw.userId ?? '',
          orderStatus: raw.orderStatus ?? 'pending',
          totalPrice: raw.totalPrice ?? 0,
          subtotal: raw.subtotal ?? 0,
          deliveryCharge: raw.deliveryCharge ?? 0,
          discount: raw.discount ?? 0,
          paymentMethod: raw.paymentMethod ?? 'Cash on Delivery',
          products: (raw.products ?? []) as OrderItem[],
          deliveryAddress: (raw.deliveryAddress ?? {}) as Address,
          createdAt: raw.createdAt instanceof Timestamp
            ? raw.createdAt.toDate()
            : new Date(),
        };
      });
      setOrders(data);
      setLoading(false);
      // Keep drawer in sync
      setSelectedOrder(prev =>
        prev ? data.find(o => o.id === prev.id) ?? null : null
      );
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: status,
        updatedAt: Timestamp.now(),
      });
    } catch (e) {
      console.error('Failed to update order status:', e);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.deliveryAddress?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.products.some(p => p.name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'all' || o.orderStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.orderStatus === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <Header title="Orders" />
      <div className="p-6 space-y-5">

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterStatus === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            All ({orders.length})
          </button>
          {ALL_STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${filterStatus === s ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
              {s} ({statusCounts[s] || 0})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm max-w-sm">
          <Search size={15} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID or customer..."
            className="text-sm outline-none w-full text-gray-700 placeholder-gray-400" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Product(s)', 'Customer', 'Items', 'Amount', 'Payment', 'Date', 'Status', 'Change Status'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => (
                    <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-4 max-w-[180px]">
                        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                          {order.products.map(p => p.name).join(', ') || '—'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{order.deliveryAddress?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{order.deliveryAddress?.phone || ''}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {order.products.length} item{order.products.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900">₹{order.totalPrice}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-lg font-medium capitalize">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {order.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.orderStatus]}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedOrder(order)}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                            title="View details">
                            <Eye size={13} />
                          </button>
                          {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                            <select
                              value={order.orderStatus}
                              disabled={updating === order.id}
                              onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none text-gray-700 bg-white disabled:opacity-50 cursor-pointer">
                              {STATUS_FLOW.map(s => (
                                <option key={s} value={s} className="capitalize">{s}</option>
                              ))}
                              <option value="cancelled">cancelled</option>
                            </select>
                          )}
                          {updating === order.id && (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && !loading && (
                <div className="text-center py-16 text-gray-400">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    {orders.length === 0 ? 'No orders yet — waiting for customers!' : 'No orders match your filter'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedOrder(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <div>
                <h2 className="font-bold text-gray-900">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedOrder.createdAt.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => printInvoice(selectedOrder)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  title="Download Invoice PDF">
                  <FileText size={13} /> Invoice
                </button>
                <button onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-5">

              {/* Status buttons */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3">Change Order Status</p>
                <div className="flex gap-2 flex-wrap">
                  {ALL_STATUSES.map(s => (
                    <button key={s}
                      disabled={updating === selectedOrder.id}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border disabled:opacity-60 ${
                        selectedOrder.orderStatus === s
                          ? STATUS_COLORS[s] + ' border-transparent ring-2 ring-offset-1 ring-current'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      {s === 'pending' && '📦 '}
                      {s === 'confirmed' && '✅ '}
                      {s === 'shipped' && '🚚 '}
                      {s === 'delivered' && '🎉 '}
                      {s === 'cancelled' && '❌ '}
                      {s}
                    </button>
                  ))}
                </div>
                {updating === selectedOrder.id && (
                  <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                    <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </p>
                )}
              </div>

              {/* Customer */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 mb-3">Delivery Address</p>
                <p className="font-bold text-gray-900">{selectedOrder.deliveryAddress?.name}</p>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1.5">
                  <Phone size={12} className="text-gray-400" />
                  {selectedOrder.deliveryAddress?.phone}
                </div>
                <div className="flex items-start gap-1.5 text-sm text-gray-600 mt-1.5">
                  <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>
                    {selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city} — {selectedOrder.deliveryAddress?.pincode}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <p className="text-xs font-semibold text-gray-500 px-4 py-3 border-b border-gray-50">Order Items</p>
                {selectedOrder.products.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 border-t border-gray-50 first:border-t-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package size={14} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">₹{item.totalPrice}</p>
                  </div>
                ))}
                <div className="border-t border-gray-100 px-4 py-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{selectedOrder.subtotal}</span></div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery</span>
                    <span>{selectedOrder.deliveryCharge === 0 ? 'Free' : `₹${selectedOrder.deliveryCharge}`}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>-₹{selectedOrder.discount}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-100">
                    <span>Total</span><span>₹{selectedOrder.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-500">Payment Method</p>
                <span className="text-sm font-bold text-gray-900 capitalize">{selectedOrder.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
