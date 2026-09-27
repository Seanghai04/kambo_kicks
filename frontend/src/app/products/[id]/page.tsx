'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!params.id) return;
    api.get(`/products/${params.id}`).then((res) => {
      const p: Product = res.data.product;
      setProduct(p);
      const first = p.variants[0];
      if (first) {
        setSize(first.size);
        setColor(first.color);
      }
    });
  }, [params.id]);

  const colors = useMemo(
    () => (product ? Array.from(new Set(product.variants.map((v) => v.color))) : []),
    [product]
  );

  const sizes = useMemo(
    () =>
      product
        ? Array.from(
            new Set(product.variants.filter((v) => v.color === color).map((v) => v.size))
          )
        : [],
    [product, color]
  );

  const variant = product?.variants.find((v) => v.size === size && v.color === color);

  function addToCart() {
    if (!product || !variant) return;
    addItem({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      imageUrl: product.images[0]?.imageUrl || '',
      variantId: variant.id,
      size: variant.size,
      color: variant.color,
      price: Number(product.basePrice),
    });
    setMsg('Added to cart');
    setTimeout(() => setMsg(''), 2000);
  }

  if (!product) {
    return <main className="mx-auto max-w-6xl px-4 py-20 text-gray-500">Loading…</main>;
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {product.images[0] && (
          <Image src={product.images[0].imageUrl} alt={product.name} fill className="object-cover" />
        )}
      </div>

      <div>
        <p className="text-sm text-gray-500">{product.brand}</p>
        <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
        <p className="mt-2 text-xl font-semibold">${Number(product.basePrice).toFixed(2)}</p>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">{product.description}</p>

        <div className="mt-6">
          <p className="text-sm font-medium">Color</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  const next = product.variants.find((v) => v.color === c);
                  if (next) setSize(next.size);
                }}
                className={`rounded-md border px-3 py-2 text-sm ${
                  color === c ? 'border-black' : 'border-gray-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-md border px-3 py-2 text-sm ${
                  size === s ? 'border-black' : 'border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={addToCart}
          disabled={!variant || variant.stock < 1}
          className="btn mt-6 w-full"
        >
          Add to Cart
        </button>
        {msg && <p className="mt-2 text-center text-sm text-green-600">{msg}</p>}
      </div>
    </main>
  );
}
