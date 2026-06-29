'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Category {
  id: string; name: string; slug: string; description?: string | null;
  icon?: string | null; color?: string | null; order: number;
  bookCount?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', color: '#F5C842', order: '0' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    const json = await res.json();
    if (json.success) setCategories(json.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const genSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', icon: '', color: '#F5C842', order: '0' });
    setShowForm(true); setError('');
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || '', color: cat.color || '#F5C842', order: String(cat.order) });
    setShowForm(true); setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, order: Number(form.order) };
      const res = editing
        ? await fetch(`/api/categories/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{categories.length} categories</p>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5">+ New Category</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-soft-lg p-6 w-full max-w-md">
            <h3 className="font-display font-bold text-brand-dark text-lg mb-4">
              {editing ? `Edit: ${editing.name}` : 'New Category'}
            </h3>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">⚠️ {error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Name *</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: genSlug(e.target.value) })} required />
                </div>
                <div>
                  <label className="label">Icon (emoji)</label>
                  <input className="input text-xl" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="📚" maxLength={2} />
                </div>
              </div>
              <div>
                <label className="label">Slug *</label>
                <input className="input font-mono text-sm" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded-xl cursor-pointer border-2 border-gray-200" />
                    <input className="input flex-1" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#F5C842" />
                  </div>
                </div>
                <div>
                  <label className="label">Display Order</label>
                  <input className="input" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} min="0" />
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

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl shadow-soft p-4 flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: (cat.color || '#F5C842') + '20' }}>
                {cat.icon || '📚'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-dark text-sm truncate">{cat.name}</p>
                <p className="text-xs text-gray-400 font-mono">/{cat.slug}</p>
                {cat.bookCount !== undefined && (
                  <p className="text-xs text-gray-400">{cat.bookCount} books</p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-brand-yellow-pale text-sm">✏️</button>
                <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-sm">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
