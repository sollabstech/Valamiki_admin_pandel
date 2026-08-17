'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { Mail, Trash2, Download } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: Date;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setSubscribers(snap.docs.map((d) => {
        const r = d.data();
        return {
          id: d.id,
          email: r.email ?? '',
          subscribedAt: r.subscribedAt instanceof Timestamp ? r.subscribedAt.toDate() : new Date(),
        };
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try { await deleteDoc(doc(db, 'subscribers', id)); } catch (e) { console.error(e); }
    setDeleteId(null);
  };

  const exportCSV = () => {
    const rows = ['Email,Subscribed At', ...subscribers.map(s =>
      `${s.email},${s.subscribedAt.toLocaleString('en-IN')}`
    )];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Header title="Subscribers" />
      <div className="p-6 space-y-5">

        {/* Stats + actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <Mail size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
                <p className="text-xs text-gray-500 font-medium">Total Subscribers</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search emails..."
              className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none shadow-sm w-56"
            />
            <button
              onClick={exportCSV}
              disabled={subscribers.length === 0}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-40"
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading subscribers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500">#</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500">Email Address</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500">Subscribed On</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-4 text-xs text-gray-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Mail size={13} className="text-blue-500" />
                          </div>
                          <span className="font-medium text-gray-800">{s.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {s.subscribedAt.toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && !loading && (
                <div className="text-center py-16 text-gray-400">
                  <Mail size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    {subscribers.length === 0 ? 'No subscribers yet' : 'No emails match your search'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Remove Subscriber?</h3>
            <p className="text-sm text-gray-500 mb-6">This will permanently remove this email from your list.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
