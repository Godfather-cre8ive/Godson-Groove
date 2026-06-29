'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = ['FREE_USER', 'SUBSCRIBER', 'ADMIN'];

export default function AdminUserActions({ userId, currentRole }: { userId: string; currentRole: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const updateRole = async (role: string) => {
    if (role === currentRole) { setOpen(false); return; }
    if (!confirm(`Change role to ${role}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) { router.refresh(); }
      else { const j = await res.json(); alert(j.error || 'Update failed'); }
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
      >
        {loading ? '...' : 'Change Role ▾'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-soft-lg border border-gray-100 py-1 z-20">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => updateRole(r)}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                  r === currentRole ? 'bg-brand-yellow text-brand-dark' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {r === 'ADMIN' ? '👑 ' : r === 'SUBSCRIBER' ? '⭐ ' : ''}
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
