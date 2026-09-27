'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';
import {
  CATEGORY_LABELS,
  SHIRT_TYPES,
  SPORT_SHOE_TYPES,
  WATCH_TYPES,
  isShirtCategory,
  isSportCategory,
  isWatchCategory,
  matchesCategoryFilter,
} from '@/lib/categories';

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || 'All';
  const brand = searchParams.get('brand') || '';
  const query = (searchParams.get('q') || '').toLowerCase();
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data.products as Product[]))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((product) =>
      matchesCategoryFilter(product.category, category),
    );

    if (brand) {
      list = list.filter((product) => product.brand === brand);
    }

    if (query) {
      list = list.filter((product) =>
        `${product.name} ${product.brand} ${product.category}`
          .toLowerCase()
          .includes(query),
      );
    }

    if (sort === 'newest') {
      list = [...list].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
    }

    return list;
  }, [brand, category, products, query, sort]);

  const activeSection =
    category === 'Sport' || isSportCategory(category)
      ? 'sport'
      : category === 'Shirt' || isShirtCategory(category)
        ? 'shirt'
        : category === 'Watch' || isWatchCategory(category)
          ? 'watch'
          : sort === 'newest'
            ? 'new'
            : 'all';

  const title =
    sort === 'newest' && category === 'All'
      ? 'NEW IN'
      : category === 'Sport'
      ? 'Sport Shoes'
        : category === 'Shirt'
        ? 'All Shirts'
          : category === 'Watch'
          ? 'All Watches'
            : category === 'All'
              ? 'All Products'
              : CATEGORY_LABELS[category] || category;

  const filterOptions = useMemo(() => {
    const options: string[] =
      activeSection === 'sport'
        ? [...SPORT_SHOE_TYPES]
        : activeSection === 'shirt'
          ? [...SHIRT_TYPES]
          : activeSection === 'watch'
            ? [...WATCH_TYPES]
            : [...new Set(products.map((product) => product.brand))];

    return options.map((option) => ({
      value: option,
      label:
        activeSection === 'new' || activeSection === 'all'
          ? option
          : CATEGORY_LABELS[option] || option,
      count: products.filter((product) =>
        activeSection === 'new' || activeSection === 'all'
          ? product.brand === option
          : product.category === option,
      ).length,
    }));
  }, [activeSection, products]);

  function filterHref(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeSection === 'new' || activeSection === 'all') {
      params.set('brand', value);
    } else {
      params.set('category', value);
      params.delete('brand');
    }
    return `/products?${params.toString()}`;
  }

  return (
    <main>
      <section className="border-b border-[#dedede] bg-[#f7f7f7]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6">
          <h1 className="shrink-0 text-lg font-bold uppercase tracking-wide">
            {title}{' '}
            <span className="font-normal text-[#555]">({filtered.length} Items)</span>
          </h1>

          {filterOptions.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {filterOptions.map((option) => {
                const selected =
                  (activeSection === 'new' || activeSection === 'all'
                    ? brand
                    : category) === option.value;

                return (
                  <Link
                    key={option.value}
                    href={filterHref(option.value)}
                    className={`shrink-0 rounded-[3px] border px-3 py-2 text-xs font-semibold transition ${
                      selected
                        ? 'border-black bg-black text-white'
                        : 'border-[#777] bg-white text-[#222] hover:border-black'
                    }`}
                  >
                    {option.label} ({option.count})
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No products in this category.</p>
        ) : (
          <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <ProductsPageInner />
    </Suspense>
  );
}
