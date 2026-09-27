import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-[#111] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[0.14em] text-white"
          >
            KAMBO-KICKS
          </Link>
          <p className="mt-3 text-sm text-gray-400">
            STEP UP · STYLE ON · STAND OUT
          </p>
        </div>
        <div>
          <p className="font-semibold">Shop</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400">
            <Link href="/products" className="hover:text-white">All Products</Link>
            <Link href="/products?category=Sport" className="hover:text-white">Sport</Link>
            <Link href="/products?category=Running" className="hover:text-white">Running Shoes</Link>
            <Link href="/products?category=Shirt" className="hover:text-white">Shirt</Link>
            <Link href="/products?category=Watch" className="hover:text-white">Watch</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold">Account</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400">
            <Link href="/login" className="hover:text-white">Login</Link>
            <Link href="/register" className="hover:text-white">Register</Link>
            <Link href="/orders" className="hover:text-white">My Orders</Link>
            <Link href="/admin" className="hover:text-white">Admin Panel</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} KAMBO-KICKS. Year 4 Project.
      </div>
    </footer>
  );
}
