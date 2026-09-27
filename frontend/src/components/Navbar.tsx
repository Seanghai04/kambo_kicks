'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Heart, Search, ShoppingBag, User, X } from 'lucide-react';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
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
import type { Product } from '@/types';

type MegaKey = 'new' | 'sport' | 'shirt' | 'watch';
type NavKey = MegaKey | 'all';

const MENU_LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: 'new', href: '/products?sort=newest', label: 'New Arrivals' },
  { key: 'sport', href: '/products?category=Sport', label: 'Sport' },
  { key: 'shirt', href: '/products?category=Shirt', label: 'Shirt' },
  { key: 'watch', href: '/products?category=Watch', label: 'Watch' },
  { key: 'all', href: '/products', label: 'View all' },
];

const HOVER_LINKS = MENU_LINKS.map((item) =>
  item.key === 'all' ? { ...item, label: 'Shop All' } : item,
);

function productStock(product: Product) {
  return product.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
}

function NavbarInner() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hoveredMenu, setHoveredMenu] = useState<NavKey | null>(null);
  const [menuPreview, setMenuPreview] = useState<NavKey>('new');
  const [products, setProducts] = useState<Product[]>([]);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === '/';
  const transparentHeader =
    isHome && !scrolled && !menuOpen && !searchOpen && !hoveredMenu;

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data.products as Product[]))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, searchOpen]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  function isActive(href: string) {
    const url = new URL(href, 'http://localhost');
    if (url.pathname !== pathname) return false;
    const entries = [...url.searchParams.entries()];
    if (entries.length === 0) {
      return searchParams.toString() === '' && pathname === '/products';
    }
    return entries.every(([k, v]) => searchParams.get(k) === v);
  }

  const activeNav: NavKey | null = (() => {
    if (pathname !== '/products') return null;
    const category = searchParams.get('category') || 'All';
    if (category === 'Sport' || isSportCategory(category)) return 'sport';
    if (category === 'Shirt' || isShirtCategory(category)) return 'shirt';
    if (category === 'Watch' || isWatchCategory(category)) return 'watch';
    if (searchParams.get('sort') === 'newest') return 'new';
    return 'all';
  })();

  function productsFor(menu: NavKey, limit = 8): Product[] {
    const list =
      menu === 'all'
        ? products
        : menu === 'new'
          ? [...products].sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime(),
            )
          : products.filter((product) =>
              matchesCategoryFilter(
                product.category,
                menu === 'sport' ? 'Sport' : menu === 'shirt' ? 'Shirt' : 'Watch',
              ),
            );

    return list.slice(0, limit);
  }

  function menuFilters(menu: MegaKey): readonly string[] {
    if (menu === 'sport') return SPORT_SHOE_TYPES;
    if (menu === 'shirt') return SHIRT_TYPES;
    if (menu === 'watch') return WATCH_TYPES;
    return ['New Products', 'Trending Products', 'Product Discounts', 'Brands'];
  }

  const previewLabel =
    MENU_LINKS.find((item) => item.key === (menuOpen ? menuPreview : hoveredMenu))
      ?.label || 'Products';

  return (
    <>
      <header
        className={`top-0 z-50 w-full transition-all duration-300 ${
          isHome ? 'fixed' : 'sticky'
        } ${
          transparentHeader
            ? 'border-b border-transparent bg-transparent text-white'
            : 'border-b border-[#e8e8e8] bg-white text-black shadow-[0_1px_10px_rgba(0,0,0,0.04)]'
        }`}
        onMouseLeave={() => setHoveredMenu(null)}
      >
        <div className="relative mx-auto flex h-[64px] max-w-[1440px] items-center px-4 sm:h-[72px] sm:px-8">
          {/* Left: Menu + Search */}
          <div className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-5 sm:left-8 sm:gap-7">
            <button
              type="button"
              onClick={() => {
                setMenuPreview(activeNav || 'new');
                setMenuOpen(true);
                setSearchOpen(false);
              }}
              className="flex items-center gap-2.5"
              aria-label="Open menu"
            >
              <span className="flex w-[18px] flex-col gap-[4px]" aria-hidden>
                <span
                  className={`h-[1.5px] w-full ${
                    transparentHeader ? 'bg-white' : 'bg-black'
                  }`}
                />
                <span
                  className={`h-[1.5px] w-full ${
                    transparentHeader ? 'bg-white' : 'bg-black'
                  }`}
                />
                <span
                  className={`h-[1.5px] w-full ${
                    transparentHeader ? 'bg-white' : 'bg-black'
                  }`}
                />
              </span>
              <span className="text-[13px] font-normal tracking-wide">Menu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2"
              aria-label="Open search"
            >
              <Search className="h-[16px] w-[16px]" strokeWidth={1.5} />
              <span className="hidden text-[13px] font-normal tracking-wide sm:inline">
                Search
              </span>
            </button>
          </div>

          {/* Center logo */}
          <div className="flex w-full justify-center">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-[1.45rem] font-semibold tracking-[0.12em] sm:text-[1.85rem]"
              aria-label="KAMBO-KICKS home"
            >
              KAMBO-KICKS
            </Link>
          </div>

          {/* Right: Contact + wishlist + account + bag */}
          <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-4 sm:right-8 sm:gap-5">
            <a
              href="mailto:hello@kambo-kicks.com"
              className="hidden text-[13px] font-normal tracking-wide md:inline"
            >
              Contact us
            </a>

            <Link
              href="/products?sort=newest"
              className="flex items-center"
              aria-label="Wishlist"
            >
              <Heart className="h-[17px] w-[17px]" strokeWidth={1.5} />
            </Link>

            <Link
              href={user ? '/orders' : '/login'}
              className="flex items-center"
              aria-label={user ? 'My account' : 'Sign in'}
            >
              <User className="h-[17px] w-[17px]" strokeWidth={1.5} />
            </Link>

            <Link href="/cart" className="relative flex items-center" aria-label="Bag">
              <ShoppingBag className="h-[17px] w-[17px]" strokeWidth={1.5} />
              {count > 0 && (
                <span
                  className={`absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-medium ${
                    transparentHeader
                      ? 'bg-white text-black'
                      : 'bg-black text-white'
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop navigation with product preview on hover */}
        <nav
          className={`border-t border-[#f0f0f0] ${isHome ? 'hidden' : 'block'}`}
        >
          <div className="mx-auto flex h-11 max-w-[1440px] items-center justify-center gap-7 overflow-x-auto px-4 sm:gap-10 sm:px-8">
            {HOVER_LINKS.map((item) => {
              const highlighted =
                hoveredMenu === item.key ||
                (hoveredMenu === null && activeNav === item.key);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onMouseEnter={() => setHoveredMenu(item.key)}
                  className={`flex h-full shrink-0 items-center border-b-2 text-[13px] font-medium tracking-wide transition ${
                    highlighted
                      ? 'border-black text-black'
                      : 'border-transparent text-[#666] hover:text-black'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {hoveredMenu && (
          <div
            className="absolute left-0 right-0 top-full hidden border-t border-[#e5e5e5] bg-white shadow-[0_18px_35px_rgba(0,0,0,0.08)] lg:block"
            onMouseEnter={() => setHoveredMenu(hoveredMenu)}
          >
            <div
              className={`mx-auto grid max-w-[1440px] gap-7 px-6 py-5 ${
                hoveredMenu === 'all'
                  ? 'grid-cols-1'
                  : 'grid-cols-[150px_1fr]'
              }`}
            >
              {hoveredMenu !== 'all' && (
                <aside className="border-r border-[#e5e5e5] pr-5">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-black">
                    {HOVER_LINKS.find((item) => item.key === hoveredMenu)?.label}
                  </p>
                  <div className="flex flex-col gap-3">
                    {menuFilters(hoveredMenu).map((filter, index) => (
                      <Link
                        key={filter}
                        href={
                          hoveredMenu === 'new'
                            ? index === 0
                              ? '/products?sort=newest'
                              : '/products'
                            : `/products?category=${filter}`
                        }
                        className={`border-l-2 pl-2 text-[11px] font-medium uppercase tracking-wide ${
                          index === 0
                            ? 'border-black text-black'
                            : 'border-transparent text-[#666] hover:text-black'
                        }`}
                      >
                        {CATEGORY_LABELS[filter] || filter}
                      </Link>
                    ))}
                  </div>
                </aside>
              )}

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666]">
                    In stock · {previewLabel}
                  </p>
                  <Link
                    href={HOVER_LINKS.find((item) => item.key === hoveredMenu)?.href || '/products'}
                    className="text-[11px] font-medium uppercase tracking-wide text-black underline-offset-2 hover:underline"
                  >
                    View all
                  </Link>
                </div>
                {productsFor(hoveredMenu, 5).length > 0 ? (
                  <div className="grid grid-cols-5 gap-5">
                    {productsFor(hoveredMenu, 5).map((product) => {
                      const stock = productStock(product);
                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="group min-w-0"
                        >
                          <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f4f4]">
                            {product.images[0]?.imageUrl ? (
                              <Image
                                src={product.images[0].imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover transition duration-300 group-hover:scale-105"
                                sizes="220px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-[#999]">
                                No image
                              </div>
                            )}
                            <span
                              className={`absolute bottom-2 left-2 px-1.5 py-0.5 text-[10px] font-semibold ${
                                stock > 0
                                  ? 'bg-white text-black'
                                  : 'bg-black text-white'
                              }`}
                            >
                              {stock > 0 ? `${stock} in stock` : 'Sold out'}
                            </span>
                          </div>
                          <p className="mt-2 truncate text-[11px] text-[#333]">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#999]">
                            ${Number(product.basePrice).toFixed(2)}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-16 text-center text-sm text-[#888]">
                    {products.length === 0 ? 'Loading products…' : 'No products in this category.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Full-screen Menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-white">
          <div className="mx-auto flex h-full max-w-[1440px] flex-col px-4 sm:px-8">
            <div className="flex h-[64px] items-center gap-6 sm:h-[72px] sm:gap-8">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-black"
                aria-label="Close menu"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
                <span className="text-[13px] font-medium tracking-wide">Close</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="flex items-center gap-2 text-black"
                aria-label="Search"
              >
                <Search className="h-[16px] w-[16px]" strokeWidth={1.5} />
                <span className="text-[13px] tracking-wide">Search</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto pb-16 pt-6 sm:pt-10">
              <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
                <ul className="flex flex-col gap-5 sm:gap-6">
                  {MENU_LINKS.map((link) => {
                    const active = isActive(link.href) || menuPreview === link.key;
                    return (
                      <li key={link.key}>
                        <Link
                          href={link.href}
                          onMouseEnter={() => setMenuPreview(link.key)}
                          onFocus={() => setMenuPreview(link.key)}
                          onClick={() => setMenuOpen(false)}
                          className={`block text-[1.35rem] tracking-wide transition sm:text-[1.5rem] ${
                            active
                              ? 'font-semibold text-black'
                              : 'font-normal text-[#6a6a6a] hover:text-black'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="border-t border-[#eee] pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                  <div className="mb-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#999]">
                        In stock now
                      </p>
                      <p className="mt-1 text-lg font-medium tracking-wide text-black">
                        {MENU_LINKS.find((item) => item.key === menuPreview)?.label}
                      </p>
                    </div>
                    <Link
                      href={MENU_LINKS.find((item) => item.key === menuPreview)?.href || '/products'}
                      onClick={() => setMenuOpen(false)}
                      className="text-[12px] font-medium uppercase tracking-wide text-[#666] underline-offset-2 hover:text-black hover:underline"
                    >
                      Shop category
                    </Link>
                  </div>

                  {productsFor(menuPreview, 8).length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {productsFor(menuPreview, 8).map((product) => {
                        const stock = productStock(product);
                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            onClick={() => setMenuOpen(false)}
                            className="group min-w-0"
                          >
                            <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f4f4]">
                              {product.images[0]?.imageUrl ? (
                                <Image
                                  src={product.images[0].imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover transition duration-300 group-hover:scale-105"
                                  sizes="180px"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-[#999]">
                                  No image
                                </div>
                              )}
                              <span
                                className={`absolute bottom-2 left-2 px-1.5 py-0.5 text-[10px] font-semibold ${
                                  stock > 0
                                    ? 'bg-white text-black'
                                    : 'bg-black text-white'
                                }`}
                              >
                                {stock > 0 ? `${stock} in stock` : 'Sold out'}
                              </span>
                            </div>
                            <p className="mt-2 truncate text-[12px] text-[#333]">
                              {product.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#999]">
                              ${Number(product.basePrice).toFixed(2)}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-10 text-sm text-[#888]">
                      {products.length === 0
                        ? 'Loading products…'
                        : 'No products in this category.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-12 flex flex-col gap-4 border-t border-[#eee] pt-8 text-[15px] text-[#6a6a6a]">
                {user ? (
                  <>
                    <Link
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-black"
                    >
                      My Orders
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="hover:text-black"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="text-left hover:text-black"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-black"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-black"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Full-screen Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-white">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="flex h-[64px] items-center gap-6 sm:h-[72px]">
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="flex items-center gap-2 text-black"
                aria-label="Close search"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
                <span className="text-[13px] font-medium tracking-wide">Close</span>
              </button>
            </div>

            <form onSubmit={onSearch} className="mt-8 flex items-center gap-4 border-b border-black pb-3">
              <Search className="h-5 w-5 shrink-0 text-black" strokeWidth={1.5} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-2xl outline-none placeholder:text-[#bbb] sm:text-3xl"
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<header className="h-[64px] border-b border-[#e8e8e8] bg-white sm:h-[72px]" />}>
      <NavbarInner />
    </Suspense>
  );
}
