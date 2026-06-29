'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Series {
  id: string; title: string; slug: string; description: string;
  coverImage?: string | null; order: number; published: boolean;
  _count?: { books: number };
}

export default function AdminSeriesPage() {
  const router = useRouter();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Series | null>(null);
  const [form, setForm] = useState({ title: '', slug: '', description: '', coverImage: '', order: '0', published: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/series?withBooks=false');
    const json = await res.json();
    if (json.success) setSeries(json.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const genSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', description: '', coverImage: '', order: '0', published: true });
    setShowForm(true);
    setError('');
  };

  const openEdit = (s: Series) => {
    setEditing(s);
    setForm({ title: s.title, slug: s.slug, description: s.description, coverImage: s.coverImage || '', order: String(s.order), published: s.published });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { ...form, order: Number(form.order) };
      const res = editing
        ? await fetch(`/api/series/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/series', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? Books in this series will be unlinked.`)) return;
    await fetch(`/api/series/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{series.length} story worlds</p>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5">+ New Story World</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-soft-lg p-6 w-full max-w-lg">
            <h3 className="font-display font-bold text-brand-dark text-lg mb-4">
              {editing ? `Edit: ${editing.title}` : 'New Story World'}
            </h3>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">⚠️ {error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: genSlug(e.target.value) })} required />
              </div>
              <div>
                <label className="label">Slug *</label>
                <input className="input font-mono text-sm" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea className="input resize-none h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div>
                <label className="label">Cover Image URL</label>
                <input className="input" type="url" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Display Order</label>
                  <input className="input" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} min="0" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 accent-brand-yellow" />
                    <span className="text-sm font-medium">Published</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary py-3 px-8 disabled:opacity-70">
                  {saving ? '⏳ Saving...' : editing ? '💾 Update' : '🚀 Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary py-3 px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {series.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-soft p-4 flex items-center gap-4">
              <div className="w-12 h-16 rounded-xl bg-brand-yellow-pale overflow-hidden relative flex-shrink-0">
                {s.coverImage ? (
                  <Image src={s.coverImage} alt={s.title} fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="flex items-center justify-center h-full text-xl">📚</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-brand-dark truncate">{s.title}</h3>
                  {!s.published && <span className="badge bg-gray-100 text-gray-500 text-xs">Draft</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.description}</p>
                <p className="text-xs text-brand-yellow-dark mt-1 font-mono">/{s.slug}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(s)} className="p-2 rounded-xl hover:bg-brand-yellow-pale transition-colors text-sm">✏️</button>
                <button onClick={() => handleDelete(s.id, s.title)} className="p-2 rounded-xl hover:bg-red-50 transition-colors text-sm">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
