'use client';
import Header from '@/components/Header';
import { mockStats, mockOrders, revenueChartData, mockProducts } from '@/lib/mockData';
import {
  ShoppingBag, TrendingUp, Package, Users,
  Clock, ArrowUpRight, ArrowDownRight, IndianRupee,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const StatCard = ({
  label, value, sub, icon: Icon, color, trend, trendUp,
}: {
  label: string; value: string; sub?: string; icon: React.ElementType;
  color: string; trend?: string; trendUp?: boolean;
}) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
    <p className="text-sm text-gray-500 mt-1.5 font-medium">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Today Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Today&apos;s Overview</p>
              <p className="text-3xl font-bold mt-1">₹{mockStats.todayRevenue.toLocaleString('en-IN')}</p>
              <p className="text-blue-100 text-sm mt-1">{mockStats.todayOrders} orders today</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-xl px-4 py-2 inline-block">
                <p className="text-xs text-blue-100">Pending Orders</p>
                <p className="text-2xl font-bold">{mockStats.pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={`₹${(mockStats.totalRevenue / 1000).toFixed(0)}K`}
            sub="All time" icon={IndianRupee} color="bg-blue-500" trend="+12%" trendUp />
          <StatCard label="Total Orders" value={mockStats.totalOrders.toLocaleString()}
            sub="All time" icon={ShoppingBag} color="bg-violet-500" trend="+8%" trendUp />
          <StatCard label="Total Products" value={mockStats.totalProducts.toString()}
            sub="In catalogue" icon={Package} color="bg-emerald-500" trend="+5" trendUp />
          <StatCard label="Total Users" value={mockStats.totalUsers.toLocaleString()}
            sub="Registered" icon={Users} color="bg-orange-500" trend="+3%" trendUp />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Revenue Overview</h2>
                <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-semibold">Monthly</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="revenue" fill="url(#gradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Trend */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="mb-5">
              <h2 className="font-bold text-gray-900">Order Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2.5}
                  dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders + Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Recent Orders</h2>
              <a href="/dashboard/orders" className="text-xs text-blue-600 font-semibold hover:underline">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Order ID</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Items</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">#{order.id.toUpperCase()}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">{order.deliveryAddress.name}</td>
                      <td className="px-5 py-3.5 text-gray-500">{order.products.length} item{order.products.length > 1 ? 's' : ''}</td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">₹{order.totalPrice}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.orderStatus]}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Stock Alerts</h2>
              <Clock size={14} className="text-orange-400" />
            </div>
            <div className="divide-y divide-gray-50">
              {mockProducts.filter(p => p.stock < 60).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.categoryName}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                    {p.stock === 0 ? 'Out' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
