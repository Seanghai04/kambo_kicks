'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .get('/products')
      .then((res) => {
        if (cancelled) return;
        setProducts((res.data.products as Product[]).slice(0, 4));
        setError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      {/* Full-screen video hero */}
      <section className="relative h-screen min-h-[620px] overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hero-poster.jpg"
          aria-label="KAMBO-KICKS featured collection"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/55" />

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-4 pb-12 text-center text-white sm:pb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
            New Collection
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide sm:text-6xl">
            Step Into Style
          </h1>
          <p className="mt-2 text-sm text-white/85 sm:text-base">
            Sport shoes, shirts & watches
          </p>
          <div className="mt-6 flex items-center gap-8 text-xs font-semibold uppercase tracking-wider">
            <Link
              href="/products?category=Sport"
              className="border-b border-white pb-1 transition hover:opacity-70"
            >
              Shop Sport
            </Link>
            <Link
              href="/products?sort=newest"
              className="border-b border-white pb-1 transition hover:opacity-70"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Popular Products</h2>
          <Link href="/products" className="text-sm text-gray-600 underline">
            See all
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : error ? (
          <p className="text-gray-500">
            Could not load products.{' '}
            <button
              type="button"
              className="underline"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
