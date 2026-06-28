'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import { mockUsers } from '@/lib/mockData';
import { User } from '@/lib/types';
import { Search, Users, UserCheck, ShoppingBag, Eye, X, MapPin, Phone, Mail, Calendar } from 'lucide-react';

export default function UsersPage() {
  const [users] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div>
      <Header title="Users" />
      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Users', val: users.length, icon: Users, color: 'bg-blue-500' },
            { label: 'With Orders', val: users.filter(u => (u.totalOrders || 0) > 0).length, icon: ShoppingBag, color: 'bg-violet-500' },
            { label: 'Active (30d)', val: Math.floor(users.length * 0.7), icon: UserCheck, color: 'bg-emerald-500' },
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

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm max-w-sm">
          <Search size={15} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..." className="text-sm outline-none w-full text-gray-700 placeholder-gray-400" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['User', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-semibold text-gray-900">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-xs">{u.email}</td>
                    <td className="px-5 py-4 text-gray-600 text-xs">{u.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{u.totalOrders || 0}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-900">₹{(u.totalSpent || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {u.createdAt?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelectedUser(u)}
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User detail side drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedUser(null)} />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <h2 className="font-bold text-gray-900">User Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Avatar */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-black mx-auto shadow-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <p className="font-bold text-gray-900 text-lg mt-3">{selectedUser.name}</p>
                <p className="text-xs text-gray-400">{selectedUser.id}</p>
              </div>

              {/* Info */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                {[
                  { icon: Mail, val: selectedUser.email },
                  { icon: Phone, val: selectedUser.phone || 'Not provided' },
                  { icon: Calendar, val: selectedUser.createdAt?.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) || '—' },
                ].map(({ icon: Icon, val }) => (
                  <div key={val} className="flex items-center gap-3 text-sm text-gray-700">
                    <Icon size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{val}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-blue-700">{selectedUser.totalOrders || 0}</p>
                  <p className="text-xs text-blue-500 font-medium mt-0.5">Total Orders</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-700">₹{(selectedUser.totalSpent || 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-emerald-500 font-medium mt-0.5">Total Spent</p>
                </div>
              </div>

              {/* Addresses */}
              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-3">Saved Addresses</p>
                  <div className="space-y-2">
                    {selectedUser.addresses.map((addr, i) => (
                      <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={12} className="text-blue-500" />
                          <span className="text-xs font-bold text-gray-700 capitalize">{addr.type}</span>
                          {addr.isDefault && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold">Default</span>}
                        </div>
                        <p className="text-xs text-gray-600">{addr.street}, {addr.city} - {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
