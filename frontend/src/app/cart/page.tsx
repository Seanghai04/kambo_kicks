'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  function goCheckout() {
    if (!user) {
      router.push('/login?next=/checkout');
      return;
    }
    router.push('/checkout');
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Cart</h1>

      {items.length === 0 ? (
        <div className="mt-8">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link href="/products" className="btn mt-4 inline-flex">
            Go shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4 border-b border-gray-200 pb-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      {item.color} · {item.size}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="h-7 w-7 rounded border text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="h-7 w-7 rounded border text-sm"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-lg border border-[#e8e8e8] bg-[#fafafa] p-5">
            <h2 className="font-semibold">Summary</h2>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>
                Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)
              </span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-[#e8e8e8] pt-3 font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Shipping & payment are selected on the next step.
            </p>
            {!user && (
              <p className="mt-3 text-sm text-gray-500">
                <Link href="/login?next=/checkout" className="underline">
                  Login
                </Link>{' '}
                to checkout
              </p>
            )}
            <button type="button" onClick={goCheckout} className="btn mt-4 w-full">
              Proceed to Checkout
            </button>
            <Link
              href="/products"
              className="mt-3 block text-center text-sm text-gray-500 hover:text-black"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
