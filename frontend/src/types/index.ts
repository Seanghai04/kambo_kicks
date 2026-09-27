export type ProductImage = {
  id: string;
  productId: string;
  imageUrl: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  basePrice: string | number;
  brand: string;
  category: string;
  createdAt?: string;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type CartItem = {
  productId: string;
  productName: string;
  brand: string;
  imageUrl: string;
  variantId: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
};

export type OrderItem = {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  price: string | number;
  productVariant?: ProductVariant & { product?: Product };
};

export type Order = {
  id: string;
  userId: string;
  transactionId?: string | null;
  customerName?: string | null;
  phone?: string | null;
  total: string | number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED';
  address: string;
  shippingMethod?: string | null;
  paymentMethod?: string | null;
  shippingFee?: number;
  note?: string | null;
  paidAt?: string | null;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; name: string; email: string };
};

export type AdminStats = {
  users: number;
  products: number;
  orders: number;
  orders30d: number;
  revenue: number;
  revenue30d: number;
  revenueToday: number;
  revenueMonth: number;
  newCustomers30d: number;
  pending: number;
  paid: number;
  shipped: number;
  delivered: number;
  ordersByStatus: { status: string; label: string; count: number }[];
  dailyRevenue: { date: string; amount: number; orders: number }[];
  recentOrders: Order[];
};
