export type UserRole = 'owner' | 'admin' | 'staff' | 'customer';

export interface Profile {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role?: UserRole;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role?: UserRole;
  avatarUrl?: string;
  createdAt?: string;
}

export interface MerchantSignUpData {
  email: string;
  password: string;
  fullName: string;
  storeName: string;
  phone?: string;
  address?: string;
}

export interface MerchantLoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  merchant: Merchant | null;
  role: 'owner' | 'admin' | 'staff' | null;
  memberships: MerchantMember[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  error: string | null;
}

export interface Merchant {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  ownerId?: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MerchantMember {
  id: string;
  merchantId: string;
  userId: string;
  role: 'owner' | 'admin' | 'staff';
  joinedAt?: string;
}

export interface Customer {
  id: string;
  merchantId?: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  createdAt?: string;
}

export interface OptionItem {
  id: string;
  name: string;
  priceModifier: number;
  colorHex?: string;
}

export interface OptionGroup {
  id: string;
  name: string;
  type: 'radio' | 'checkbox' | 'pills';
  required: boolean;
  options: OptionItem[];
}

export interface Product {
  id: string;
  merchantId?: string;
  name: string;
  category: string;
  categoryId?: string;
  basePrice: number;
  description: string;
  image: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isActive: boolean;
  tag?: string; // e.g. 'HOT MEALS', 'APPAREL', 'MERYENDA'
  optionGroups: OptionGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedOptions: {
    [groupId: string]: string | string[]; // option id or array of option ids
  };
  totalPrice: number;
}

export interface OrderItemRecord {
  productId?: string;
  title: string;
  optionsDescription?: string;
  selectedOptions?: {
    [groupId: string]: string | string[];
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderItem = OrderItemRecord;

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'declined'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded';

export type PaymentMethod = 'gcash' | 'maya' | 'cod';

export type FulfillmentType = 'delivery' | 'pickup';

export interface Order {
  id: string;
  merchantId?: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  fulfillment: FulfillmentType;
  address: string;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  notes?: string;
  items: OrderItemRecord[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  trackingToken?: string;
  createdAt: string;
  timeAgo?: string;
  estimatedTime: string;
}

export interface Category {
  id: string;
  merchantId?: string;
  name: string;
  image?: string;
  count?: number;
}

export interface StoreSettings {
  merchantId: string;
  storeName: string;
  storeDescription?: string;
  isOpen: boolean;
  phone: string;
  address: string;
  deliveryFee: number;
  currency: string;
  trialDaysLeft: number;
  plan: string;
}

export type AppMode = 'customer' | 'merchant';

export type CustomerTab = 'home' | 'search' | 'cart' | 'orders';

export type MerchantTab =
  | 'home'
  | 'orders'
  | 'products'
  | 'customers'
  | 'settings'
  | 'categories'
  | 'add_product';
