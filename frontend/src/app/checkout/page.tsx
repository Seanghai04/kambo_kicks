'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/Guards';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';

type ShippingMethod = 'standard' | 'express';
type PaymentMethod = 'cod' | 'aba';

function CheckoutContent() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items.length, router]);

  useEffect(() => {
    if (user?.name && !fullName) setFullName(user.name);
  }, [user, fullName]);

  const shippingFee = useMemo(() => {
    if (shippingMethod === 'express') return 5;
    return total >= 100 ? 0 : 2;
  }, [shippingMethod, total]);

  const grandTotal = total + shippingFee;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('');

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setStatus('Please fill in name, phone, and address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim() || undefined,
        note: note.trim() || undefined,
        shippingMethod,
        paymentMethod,
        items: items.map((i) => ({
          productVariantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      const orderId = res.data.order.id as string;
      clearCart();
      router.push(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Checkout failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <div className="py-20 text-center text-gray-500">Redirecting to cart…</div>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
          Cart / Checkout
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Checkout</h1>
      </div>

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <section className="rounded-xl border border-[#e8e8e8] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Delivery details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm text-gray-600">Full name</span>
                <input
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-gray-600">Phone</span>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01X XXX XXX"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-gray-600">City</span>
                <input
                  className="input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Phnom Penh"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm text-gray-600">Address</span>
                <textarea
                  className="input min-h-[96px] resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, house number, landmark"
                  required
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm text-gray-600">Order note (optional)</span>
                <input
                  className="input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Call on arrival, leave at door…"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-[#e8e8e8] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Shipping</h2>
            <div className="mt-4 grid gap-3">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  shippingMethod === 'standard'
                    ? 'border-black bg-[#f7f7f7]'
                    : 'border-[#e5e5e5] hover:border-[#bbb]'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  className="mt-1"
                  checked={shippingMethod === 'standard'}
                  onChange={() => setShippingMethod('standard')}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">Standard delivery</p>
                    <p className="text-sm font-semibold">
                      {total >= 100 ? 'Free' : '$2.00'}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    2–4 days · Free shipping on orders $100+
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  shippingMethod === 'express'
                    ? 'border-black bg-[#f7f7f7]'
                    : 'border-[#e5e5e5] hover:border-[#bbb]'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  className="mt-1"
                  checked={shippingMethod === 'express'}
                  onChange={() => setShippingMethod('express')}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">Express delivery</p>
                    <p className="text-sm font-semibold">$5.00</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">1–2 days in major cities</p>
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-[#e8e8e8] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Payment</h2>
            <div className="mt-4 grid gap-3">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  paymentMethod === 'cod'
                    ? 'border-black bg-[#f7f7f7]'
                    : 'border-[#e5e5e5] hover:border-[#bbb]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="mt-1"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div>
                  <p className="font-medium">Cash on Delivery (COD)</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Pay when your order arrives.
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  paymentMethod === 'aba'
                    ? 'border-black bg-[#f7f7f7]'
                    : 'border-[#e5e5e5] hover:border-[#bbb]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="mt-1"
                  checked={paymentMethod === 'aba'}
                  onChange={() => setPaymentMethod('aba')}
                />
                <div>
                  <p className="font-medium">ABA Pay</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Order is created as pending. Full ABA redirect comes next.
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-semibold">Order summary</h2>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-white">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-gray-500">
                    {item.color} · {item.size} · ×{item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 border-t border-[#e5e5e5] pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between border-t border-[#e5e5e5] pt-3 text-base font-semibold">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {status && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {status}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn mt-5 w-full">
            {loading ? 'Placing order…' : 'Place order'}
          </button>
          <Link
            href="/cart"
            className="mt-3 block text-center text-sm text-gray-500 hover:text-black"
          >
            Back to cart
          </Link>
        </aside>
      </form>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutContent />
    </AuthGuard>
  );
}
