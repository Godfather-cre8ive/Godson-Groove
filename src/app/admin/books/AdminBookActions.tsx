'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminBookActions({ bookId, bookSlug }: { bookId: string; bookSlug: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this book? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
      else {
        const json = await res.json();
        alert(json.error || 'Delete failed');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/books/${bookSlug}`}
        target="_blank"
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-dark transition-colors text-xs"
        title="View"
      >
        👁️
      </Link>
      <Link
        href={`/admin/books/${bookId}/edit`}
        className="p-1.5 rounded-lg hover:bg-brand-yellow-pale text-gray-400 hover:text-brand-dark transition-colors text-xs"
        title="Edit"
      >
        ✏️
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-xs disabled:opacity-50"
        title="Delete"
      >
        🗑️
      </button>
    </div>
  );
}
