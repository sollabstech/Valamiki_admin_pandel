'use client';
import { Bell, Search, Menu } from 'lucide-react';

export default function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-56 border border-gray-100">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none text-gray-700 w-full placeholder-gray-400"
          />
        </div>
        {/* Notification */}
        <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100">
          <Bell size={16} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <span className="text-white text-sm font-bold">A</span>
        </div>
      </div>
    </header>
  );
}
