'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images[0]?.imageUrl;

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">No image</div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium">{product.name}</p>
        <p className="text-xs text-gray-500">{product.category}</p>
        <p className="mt-1 text-sm font-semibold">${Number(product.basePrice).toFixed(2)}</p>
      </div>
    </Link>
  );
}
