'use client';

import { FormEvent, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Product } from '@/types';

const emptyForm = {
  name: '',
  description: '',
  basePrice: '',
  brand: '',
  category: 'Running',
  imageUrl: '',
  size: 'EU 42',
  color: 'Black',
  stock: '10',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  function loadProducts() {
    api.get('/products').then((res) => setProducts(res.data.products));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg('');

    const payload = {
      name: form.name,
      description: form.description,
      basePrice: Number(form.basePrice),
      brand: form.brand,
      category: form.category,
      images: form.imageUrl ? [{ imageUrl: form.imageUrl }] : [],
      variants: [{ size: form.size, color: form.color, stock: Number(form.stock) }],
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, {
          name: form.name,
          description: form.description,
          basePrice: Number(form.basePrice),
          brand: form.brand,
          category: form.category,
        });
        setMsg('Product updated');
      } else {
        await api.post('/products', payload);
        setMsg('Product created');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadProducts();
    } catch {
      setMsg('Failed to save product');
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      basePrice: String(product.basePrice),
      brand: product.brand,
      category: product.category,
      imageUrl: product.images[0]?.imageUrl || '',
      size: product.variants[0]?.size || 'EU 42',
      color: product.variants[0]?.color || 'Black',
      stock: String(product.variants[0]?.stock || 10),
    });
  }

  async function removeProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  }

  return (
    <div className="kk-rise space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--kk-kick)]">
          Commerce
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Catalog floor
        </h2>
        <p className="mt-1 text-sm text-[var(--kk-mute)]">
          Stock kicks, shirts, and watches for the storefront
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <form
          onSubmit={onSubmit}
          className="h-fit border border-[var(--kk-line)] bg-white p-5 sm:p-6"
        >
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {editingId ? 'Edit product' : 'Add product'}
          </h3>
          <p className="mt-1 text-xs text-[var(--kk-mute)]">
            Create catalog items for Sport, Shirt, and Watch
          </p>
          <div className="mt-4 space-y-3">
            <input
              className="kk-admin-input"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <textarea
              className="kk-admin-input resize-none"
              rows={2}
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <input
              className="kk-admin-input"
              type="number"
              step="0.01"
              placeholder="Price"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              required
            />
            <input
              className="kk-admin-input"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              required
            />
            <select
              className="kk-admin-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <optgroup label="Sport · Shoes">
                {['Running', 'Basketball', 'Football', 'Training', 'Outdoor'].map((c) => (
                  <option key={c} value={c}>
                    {c} Shoes
                  </option>
                ))}
              </optgroup>
              <optgroup label="Shirt">
                <option value="Casual">Casual Shirt</option>
                <option value="Athletic">Athletic Shirt</option>
                <option value="Formal">Formal Shirt</option>
                <option value="Polo">Polo Shirt</option>
              </optgroup>
              <optgroup label="Watch">
                <option value="SportWatch">Sport Watch</option>
                <option value="Classic">Classic Watch</option>
                <option value="Smart">Smart Watch</option>
                <option value="Luxury">Luxury Watch</option>
              </optgroup>
            </select>
            {!editingId && (
              <>
                <input
                  className="kk-admin-input"
                  placeholder="Image URL"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    className="kk-admin-input"
                    placeholder={
                      ['Casual', 'Athletic', 'Formal', 'Polo'].includes(form.category)
                        ? 'S / M / L'
                        : ['SportWatch', 'Classic', 'Smart', 'Luxury'].includes(form.category)
                          ? 'One Size'
                          : 'EU 42'
                    }
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                  />
                  <input
                    className="kk-admin-input"
                    placeholder="Color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                  />
                  <input
                    className="kk-admin-input"
                    type="number"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="submit" className="kk-admin-btn">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                className="kk-admin-btn-ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
          {msg && <p className="mt-3 text-sm font-medium text-[var(--kk-ok)]">{msg}</p>}
        </form>

        <div className="border border-[var(--kk-line)] bg-white">
          <div className="border-b border-[var(--kk-line)] px-5 py-4">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              On shelf
            </h3>
            <p className="text-xs text-[var(--kk-mute)]">{products.length} products</p>
          </div>
          <div className="divide-y divide-[var(--kk-line)]">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-[var(--kk-chalk)]"
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-[var(--kk-mute)]">
                    {p.category} · ${Number(p.basePrice).toFixed(2)} · Stock:{' '}
                    {p.variants.reduce((s, v) => s + v.stock, 0)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(p)}
                    className="text-sm font-semibold text-[var(--kk-ink)] hover:text-[var(--kk-kick)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeProduct(p.id)}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="px-5 py-12 text-center text-[var(--kk-mute)]">No products yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
