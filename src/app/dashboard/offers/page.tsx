'use client';
import Header from '@/components/Header';
import { Percent } from 'lucide-react';

export default function OffersPage() {
  return (
    <div>
      <Header title="Offers & Discounts" />
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-400">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
          <Percent size={28} className="text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500">Offers & Discounts</p>
        <p className="text-xs text-gray-400 mt-1">Coming soon — coupon management will be available here.</p>
      </div>
    </div>
  );
}
