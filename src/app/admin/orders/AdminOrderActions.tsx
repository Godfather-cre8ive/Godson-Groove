'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrderActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [tracking, setTracking] = useState('');

  const nextStatuses = NEXT_STATUSES[currentStatus] || [];

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?orderId=${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(tracking && { trackingNumber: tracking }) }),
      });
      if (res.ok) { router.refresh(); setShowTracking(false); }
      else { const j = await res.json(); alert(j.error || 'Update failed'); }
    } finally {
      setLoading(false);
    }
  };

  if (nextStatuses.length === 0) return <span className="text-xs text-gray-300">—</span>;

  return (
    <div className="flex flex-col gap-1">
      {nextStatuses.map((s) => (
        <div key={s}>
          {s === 'SHIPPED' ? (
            <div>
              {showTracking ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Tracking #"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    className="border rounded-lg px-2 py-1 text-xs w-24"
                  />
                  <button
                    onClick={() => updateStatus('SHIPPED')}
                    disabled={loading}
                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 disabled:opacity-50"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTracking(true)}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-xl text-xs font-medium hover:bg-indigo-200 transition-colors whitespace-nowrap"
                >
                  Ship
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => updateStatus(s)}
              disabled={loading}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap ${
                s === 'CANCELLED'
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : s === 'DELIVERED'
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {loading ? '...' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
