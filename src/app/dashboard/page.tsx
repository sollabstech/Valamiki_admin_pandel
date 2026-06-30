'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import {
  ShoppingBag, Package, Users, Clock,
  ArrowUpRight, IndianRupee, TrendingUp, AlertTriangle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';

// ── types ──────────────────────────────────────────────────────────────────
interface Order {
  id: string;
  userId: string;
  orderStatus: string;
  totalPrice: number;
  products: { name: string; quantity: number; totalPrice: number }[];
  deliveryAddress: { name: string; phone: string };
  createdAt: Date;
}

interface Product {
  id: string;
  name: string;
  categoryName: string;
  stock: number;
  isAvailable: boolean;
}

// ── helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLast6Months() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: MONTHS[d.getMonth()], year: d.getFullYear(), month: d.getMonth() };
  });
}

function isToday(date: Date) {
  const now = new Date();
  return date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
}

// ── stat card ────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, sub, icon: Icon, color, loading,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; loading?: boolean;
}) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full text-emerald-700 bg-emerald-50">
        <ArrowUpRight size={12} /> Live
      </span>
    </div>
    {loading
      ? <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse mb-1" />
      : <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
    }
    <p className="text-sm text-gray-500 mt-1.5 font-medium">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ── dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Real-time orders
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => {
        const r = d.data();
        return {
          id: d.id,
          userId: r.userId ?? '',
          orderStatus: r.orderStatus ?? 'pending',
          totalPrice: r.totalPrice ?? 0,
          products: r.products ?? [],
          deliveryAddress: r.deliveryAddress ?? {},
          createdAt: r.createdAt instanceof Timestamp ? r.createdAt.toDate() : new Date(),
        };
      }));
      setLoadingOrders(false);
    }, () => setLoadingOrders(false));
  }, []);

  // Real-time products
  useEffect(() => {
    return onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map((d) => {
        const r = d.data();
        return {
          id: d.id,
          name: r.name ?? '',
          categoryName: r.categoryName ?? '',
          stock: r.stock ?? 0,
          isAvailable: r.isAvailable ?? true,
        };
      }));
      setLoadingProducts(false);
    }, () => setLoadingProducts(false));
  }, []);

  // ── derived stats ──────────────────────────────────────────────────────────
  const todayOrders   = orders.filter(o => isToday(o.createdAt));
  const todayRevenue  = todayOrders.reduce((s, o) => s + o.totalPrice, 0);
  const pendingCount  = orders.filter(o => o.orderStatus === 'pending').length;
  const totalRevenue  = orders.reduce((s, o) => s + o.totalPrice, 0);
  const uniqueUsers   = new Set(orders.map(o => o.userId)).size;
  const lowStock      = products.filter(p => p.stock < 20).sort((a, b) => a.stock - b.stock);
  const recentOrders  = orders.slice(0, 6);

  // ── 6-month chart data ─────────────────────────────────────────────────────
  const chartData = getLast6Months().map(({ label, year, month }) => {
    const monthOrders = orders.filter(o =>
      o.createdAt.getFullYear() === year && o.createdAt.getMonth() === month
    );
    return {
      month: label,
      revenue: Math.round(monthOrders.reduce((s, o) => s + o.totalPrice, 0)),
      orders: monthOrders.length,
    };
  });

  const loading = loadingOrders || loadingProducts;

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Today Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">Today&apos;s Overview</p>
              {loadingOrders
                ? <div className="h-9 w-36 bg-white/20 rounded-xl animate-pulse mt-1" />
                : <p className="text-3xl font-bold mt-1">₹{todayRevenue.toLocaleString('en-IN')}</p>
              }
              <p className="text-blue-100 text-sm mt-1">
                {loadingOrders ? '—' : `${todayOrders.length} orders today`}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
                <p className="text-xs text-blue-100 mb-1">Pending</p>
                {loadingOrders
                  ? <div className="h-7 w-10 bg-white/20 rounded animate-pulse mx-auto" />
                  : <p className="text-2xl font-bold">{pendingCount}</p>
                }
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
                <p className="text-xs text-blue-100 mb-1">Products</p>
                {loadingProducts
                  ? <div className="h-7 w-10 bg-white/20 rounded animate-pulse mx-auto" />
                  : <p className="text-2xl font-bold">{products.length}</p>
                }
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
                <p className="text-xs text-blue-100 mb-1">Low Stock</p>
                {loadingProducts
                  ? <div className="h-7 w-10 bg-white/20 rounded animate-pulse mx-auto" />
                  : <p className={`text-2xl font-bold ${lowStock.length > 0 ? 'text-orange-300' : ''}`}>{lowStock.length}</p>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue" sub="All orders combined"
            value={`₹${(totalRevenue / 1000).toFixed(1)}K`}
            icon={IndianRupee} color="bg-blue-500" loading={loadingOrders} />
          <StatCard
            label="Total Orders" sub="All time"
            value={orders.length.toLocaleString()}
            icon={ShoppingBag} color="bg-violet-500" loading={loadingOrders} />
          <StatCard
            label="Total Products" sub="In catalogue"
            value={products.length.toString()}
            icon={Package} color="bg-emerald-500" loading={loadingProducts} />
          <StatCard
            label="Unique Customers" sub="From orders"
            value={uniqueUsers.toLocaleString()}
            icon={Users} color="bg-orange-500" loading={loadingOrders} />
        </div>

        {/* Order Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map(status => {
            const count = orders.filter(o => o.orderStatus === status).length;
            const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
            return (
              <div key={status} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <p className={`text-xl font-bold ${loadingOrders ? 'text-gray-200' : 'text-gray-900'}`}>
                  {loadingOrders ? '—' : count}
                </p>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[status]}`}>
                  {status}
                </span>
                <p className="text-xs text-gray-400 mt-1">{loadingOrders ? '' : `${pct}%`}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Revenue Overview</h2>
                <p className="text-xs text-gray-400 mt-0.5">Last 6 months • live from Firestore</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                <TrendingUp size={12} /> Real-time
              </div>
            </div>
            {loadingOrders ? (
              <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
            ) : orders.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-gray-300">
                <ShoppingBag size={36} className="mb-2 opacity-40" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="revenue" fill="url(#revGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Orders Line Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="mb-5">
              <h2 className="font-bold text-gray-900">Order Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            {loadingOrders ? (
              <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
            ) : orders.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-gray-300">
                <p className="text-sm">No order data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2.5}
                    dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders + Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Recent Orders</h2>
              <a href="/dashboard/orders" className="text-xs text-blue-600 font-semibold hover:underline">View All →</a>
            </div>
            {loadingOrders ? (
              <div className="p-5 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Order ID', 'Customer', 'Items', 'Amount', 'Status'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-500 font-bold">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-800">{order.deliveryAddress?.name || '—'}</p>
                          <p className="text-xs text-gray-400">{order.deliveryAddress?.phone || ''}</p>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {order.products.length} item{order.products.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">₹{order.totalPrice}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.orderStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Stock Alerts</h2>
              {lowStock.length > 0
                ? <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    <AlertTriangle size={11} /> {lowStock.length} items
                  </span>
                : <Clock size={14} className="text-gray-300" />
              }
            </div>
            {loadingProducts ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : lowStock.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">All products well stocked</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.categoryName}</p>
                    </div>
                    <span className={`ml-3 text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                      p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Live indicator footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Dashboard data updates in real-time from Firestore
        </div>

      </div>
    </div>
  );
}
