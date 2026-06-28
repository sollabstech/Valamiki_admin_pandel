'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (email === 'admin@valamiki.com' && password === 'admin123') {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-xl mb-4">
              <span className="text-white font-black text-2xl">V</span>
            </div>
            <h1 className="text-2xl font-black text-white">VALAMIKI</h1>
            <p className="text-blue-200 text-sm mt-1">Admin Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3 text-red-300 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="text-blue-200 text-xs font-semibold mb-1.5 block">Email Address</label>
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus-within:border-blue-400 focus-within:bg-white/15 transition-all">
                <Mail size={16} className="text-blue-300 flex-shrink-0" />
                <input value={email} onChange={e => setEmail(e.target.value)}
                  type="email" placeholder="admin@valamiki.com"
                  className="bg-transparent text-white placeholder-white/30 text-sm outline-none w-full" />
              </div>
            </div>

            <div>
              <label className="text-blue-200 text-xs font-semibold mb-1.5 block">Password</label>
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus-within:border-blue-400 focus-within:bg-white/15 transition-all">
                <Lock size={16} className="text-blue-300 flex-shrink-0" />
                <input value={password} onChange={e => setPassword(e.target.value)}
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  className="bg-transparent text-white placeholder-white/30 text-sm outline-none w-full" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="text-blue-300 hover:text-white transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-blue-200 cursor-pointer">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <button type="button" className="text-blue-300 hover:text-white font-semibold">Forgot password?</button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-60 mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-300/60 text-xs">Demo: admin@valamiki.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
