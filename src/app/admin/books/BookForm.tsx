'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BookFormProps {
  bookId?: string;
  initialData?: Record<string, unknown>;
}

interface Category { id: string; name: string; slug: string; }
interface Series { id: string; title: string; slug: string; }

export default function BookForm({ bookId, initialData }: BookFormProps) {
  const router = useRouter();
  const isEdit = !!bookId;

  const [form, setForm] = useState({
    title: '', slug: '', description: '', shortDescription: '',
    author: '', illustrator: '', coverImage: '', isbn: '',
    ageMin: '', ageMax: '', pageCount: '', language: 'en',
    tags: '', bookType: 'BOTH', access: 'FREE',
    price: '', digitalPrice: '', seriesId: '', seriesOrder: '',
    featured: false, newRelease: false, popular: false, published: true,
    amazonLink: '', selarLink: '', okadaBooksLink: '',
    categoryIds: [] as string[],
    ...initialData,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [savedBookId, setSavedBookId] = useState(bookId || '');

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/series').then((r) => r.json()),
    ]).then(([cats, series]) => {
      if (cats.success) setCategories(cats.data);
      if (series.success) setSeriesList(series.data);
    });
  }, []);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const fd = new FormData();
    fd.append('file', file);
    if (savedBookId) fd.append('bookId', savedBookId);
    fd.append('fileType', 'IMAGE');
    try {
      const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) setForm((f) => ({ ...f, coverImage: json.data.url }));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleBookFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !savedBookId) { alert('Save the book first before uploading files'); return; }
    setFileUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('bookId', savedBookId);
    const type = file.type === 'application/pdf' ? 'PDF' : file.type === 'application/epub+zip' ? 'EPUB' : 'AUDIO';
    fd.append('fileType', type);
    try {
      const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.success) alert(json.error || 'Upload failed');
      else alert('File uploaded successfully!');
    } finally {
      setFileUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? String(form.tags).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        ageMin: form.ageMin ? Number(form.ageMin) : undefined,
        ageMax: form.ageMax ? Number(form.ageMax) : undefined,
        pageCount: form.pageCount ? Number(form.pageCount) : undefined,
        price: form.price ? Number(form.price) : undefined,
        digitalPrice: form.digitalPrice ? Number(form.digitalPrice) : undefined,
        seriesOrder: form.seriesOrder ? Number(form.seriesOrder) : undefined,
        seriesId: form.seriesId || undefined,
        amazonLink: form.amazonLink || undefined,
        selarLink: form.selarLink || undefined,
        okadaBooksLink: form.okadaBooksLink || undefined,
      };

      const url = isEdit ? `/api/books/${bookId}` : '/api/books';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      if (!isEdit) setSavedBookId(json.data.id);
      router.push('/admin/books');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">⚠️ {error}</div>
      )}

      <div className="bg-white rounded-2xl shadow-soft p-6 space-y-5">
        <h2 className="font-display font-bold text-brand-dark text-lg">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              value={String(form.title)}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="label">Slug *</label>
            <input
              className="input font-mono text-sm"
              value={String(form.slug)}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Author *</label>
            <input className="input" value={String(form.author)} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
          </div>
          <div>
            <label className="label">Illustrator</label>
            <input className="input" value={String(form.illustrator)} onChange={(e) => setForm({ ...form, illustrator: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Description *</label>
          <textarea
            className="input min-h-[100px] resize-y"
            value={String(form.description)}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="label">Short Description</label>
          <input className="input" value={String(form.shortDescription)} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Age Min</label>
            <input type="number" className="input" value={String(form.ageMin)} onChange={(e) => setForm({ ...form, ageMin: e.target.value })} min="0" max="18" />
          </div>
          <div>
            <label className="label">Age Max</label>
            <input type="number" className="input" value={String(form.ageMax)} onChange={(e) => setForm({ ...form, ageMax: e.target.value })} min="0" max="18" />
          </div>
          <div>
            <label className="label">Page Count</label>
            <input type="number" className="input" value={String(form.pageCount)} onChange={(e) => setForm({ ...form, pageCount: e.target.value })} min="1" />
          </div>
          <div>
            <label className="label">ISBN</label>
            <input className="input" value={String(form.isbn)} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Tags (comma-separated)</label>
          <input className="input" value={String(form.tags)} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="adventure, animals, africa" />
        </div>
      </div>

      {/* Cover image */}
      <div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
        <h2 className="font-display font-bold text-brand-dark text-lg">Cover Image</h2>
        <div className="flex gap-6 items-start">
          {form.coverImage && (
            <div className="relative w-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0" style={{ aspectRatio: '2/3' }}>
              <Image src={String(form.coverImage)} alt="Cover" fill className="object-cover" sizes="96px" />
            </div>
          )}
          <div className="flex-1">
            <label className="label">Cover Image URL</label>
            <input className="input mb-3" value={String(form.coverImage)} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." />
            <p className="text-xs text-gray-400 mb-2">or upload:</p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors">
              {uploadingCover ? '⏳ Uploading...' : '📁 Upload Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
            </label>
          </div>
        </div>
      </div>

      {/* Access & Pricing */}
      <div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
        <h2 className="font-display font-bold text-brand-dark text-lg">Access & Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Access</label>
            <select className="input" value={String(form.access)} onChange={(e) => setForm({ ...form, access: e.target.value })}>
              <option value="FREE">Free</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>
          <div>
            <label className="label">Book Type</label>
            <select className="input" value={String(form.bookType)} onChange={(e) => setForm({ ...form, bookType: e.target.value })}>
              <option value="DIGITAL">Digital Only</option>
              <option value="PHYSICAL">Physical Only</option>
              <option value="BOTH">Digital + Physical</option>
            </select>
          </div>
          <div>
            <label className="label">Physical Price (₦)</label>
            <input type="number" className="input" value={String(form.price)} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0" />
          </div>
        </div>
      </div>

      {/* Series & Categories */}
      <div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
        <h2 className="font-display font-bold text-brand-dark text-lg">Series & Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Story World (Series)</label>
            <select className="input" value={String(form.seriesId)} onChange={(e) => setForm({ ...form, seriesId: e.target.value })}>
              <option value="">— None —</option>
              {seriesList.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Order in Series</label>
            <input type="number" className="input" value={String(form.seriesOrder)} onChange={(e) => setForm({ ...form, seriesOrder: e.target.value })} min="1" />
          </div>
        </div>
        <div>
          <label className="label">Categories</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {categories.map((cat) => {
              const checked = (form.categoryIds as string[]).includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    const ids = form.categoryIds as string[];
                    setForm({ ...form, categoryIds: checked ? ids.filter((id) => id !== cat.id) : [...ids, cat.id] });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${checked ? 'bg-brand-yellow text-brand-dark' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* External links */}
      <div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
        <h2 className="font-display font-bold text-brand-dark text-lg">External Marketplace Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'amazonLink', label: 'Amazon Link', placeholder: 'https://amazon.com/...' },
            { key: 'selarLink', label: 'Selar Link', placeholder: 'https://selar.co/...' },
            { key: 'okadaBooksLink', label: 'OkadaBooks Link', placeholder: 'https://okadabooks.com/...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                type="url"
                className="input text-sm"
                value={String((form as Record<string, unknown>)[key] || '')}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <h2 className="font-display font-bold text-brand-dark text-lg mb-4">Visibility & Flags</h2>
        <div className="flex flex-wrap gap-4">
          {[
            { key: 'published', label: '✅ Published' },
            { key: 'featured', label: '⭐ Featured' },
            { key: 'newRelease', label: '🆕 New Release' },
            { key: 'popular', label: '🔥 Popular' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean((form as Record<string, unknown>)[key])}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                className="w-4 h-4 accent-brand-yellow"
              />
              <span className="text-sm font-medium text-brand-dark">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Book files */}
      {savedBookId && (
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h2 className="font-display font-bold text-brand-dark text-lg mb-4">Upload Book Files</h2>
          <p className="text-sm text-gray-500 mb-3">Upload PDF, EPUB, or audio files for this book.</p>
          <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 bg-brand-yellow-pale hover:bg-brand-yellow rounded-2xl text-sm font-medium transition-colors">
            {fileUploading ? '⏳ Uploading...' : '📁 Upload Book File (PDF/EPUB/Audio)'}
            <input
              type="file"
              accept=".pdf,.epub,audio/*"
              className="hidden"
              onChange={handleBookFileUpload}
              disabled={fileUploading}
            />
          </label>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary py-3.5 px-10 text-base disabled:opacity-70">
          {loading ? '⏳ Saving...' : isEdit ? '💾 Update Book' : '🚀 Create Book'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary py-3.5 px-8">
          Cancel
        </button>
      </div>
    </form>
  );
}
