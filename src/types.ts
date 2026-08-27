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
  name: string;
  category: string;
  basePrice: number;
  description: string;
  image: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isActive: boolean;
  tag?: string; // e.g. 'HOT MEALS', 'APPAREL'
  optionGroups: OptionGroup[];
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
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'declined';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  fulfillment: 'delivery' | 'pickup';
  address: string;
  paymentMethod: 'gcash' | 'maya' | 'cod';
  notes?: string;
  items: OrderItemRecord[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  timeAgo?: string;
  estimatedTime: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  count?: number;
}

export interface StoreSettings {
  storeName: string;
  isOpen: boolean;
  phone: string;
  address: string;
  deliveryFee: number;
  currency: string;
  trialDaysLeft: number;
  merchantId: string;
  plan: string;
}

export type AppMode = 'customer' | 'merchant';

export type CustomerTab = 'home' | 'search' | 'cart' | 'orders';

export type MerchantTab = 'home' | 'orders' | 'products' | 'customers' | 'settings' | 'categories' | 'add_product';
