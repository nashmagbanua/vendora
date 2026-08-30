import {
  Product,
  Category,
  Order,
  OrderItemRecord,
  StoreSettings,
  Customer,
  Merchant,
  OptionGroup,
  OptionItem
} from '../types';
import { isUUID } from './supabase';

export interface DbMerchant {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  owner_id?: string | null;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbStoreSettings {
  id: string;
  merchant_id: string;
  store_name: string;
  store_description?: string | null;
  is_open: boolean;
  phone?: string | null;
  address?: string | null;
  delivery_fee: number;
  currency: string;
  plan: string;
  trial_days_left: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbCategory {
  id: string;
  merchant_id: string;
  name: string;
  image?: string | null;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbProduct {
  id: string;
  merchant_id: string;
  category_id?: string | null;
  category_name?: string | null;
  name: string;
  base_price: number;
  description: string;
  image_url: string;
  is_featured: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  tag?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbOptionGroup {
  id: string;
  merchant_id: string;
  product_id: string;
  name: string;
  type: 'radio' | 'checkbox' | 'pills';
  required: boolean;
  display_order?: number;
  created_at?: string;
}

export interface DbProductOption {
  id: string;
  merchant_id: string;
  product_id: string;
  option_group_id: string;
  name: string;
  price_modifier: number;
  color_hex?: string | null;
  display_order?: number;
  created_at?: string;
}

export interface DbCustomer {
  id: string;
  merchant_id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  total_orders: number;
  total_spent: number;
  last_order_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbOrder {
  id: string;
  merchant_id: string;
  order_number: string;
  customer_id?: string | null;
  customer_name: string;
  phone: string;
  email?: string | null;
  fulfillment: 'delivery' | 'pickup';
  address: string;
  payment_method: 'gcash' | 'maya' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
  notes?: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'declined' | 'cancelled';
  tracking_token?: string;
  estimated_time: string;
  created_at: string;
  updated_at?: string;
}

export interface DbOrderItem {
  id: string;
  merchant_id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  options_description?: string | null;
  selected_options?: Record<string, any>;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

/**
 * ==============================================================================
 * MAPPERS: DB Schema <--> Frontend Domain Models
 * ==============================================================================
 */

export function mapDbMerchantToMerchant(db: DbMerchant): Merchant {
  return {
    id: db.id,
    name: db.name,
    slug: db.slug || undefined,
    description: db.description || undefined,
    ownerId: db.owner_id || undefined,
    logoUrl: db.logo_url || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

export function mapDbSettingsToStoreSettings(db: DbStoreSettings): StoreSettings {
  return {
    merchantId: db.merchant_id,
    storeName: db.store_name,
    storeDescription: db.store_description || '',
    isOpen: db.is_open,
    phone: db.phone || '',
    address: db.address || '',
    deliveryFee: Number(db.delivery_fee) || 0,
    currency: db.currency || '₱',
    plan: db.plan || 'Starter',
    trialDaysLeft: db.trial_days_left ?? 14
  };
}

export function mapStoreSettingsToDb(settings: StoreSettings, merchantId: string): Partial<DbStoreSettings> {
  return {
    merchant_id: merchantId,
    store_name: settings.storeName,
    store_description: settings.storeDescription || null,
    is_open: settings.isOpen,
    phone: settings.phone || null,
    address: settings.address || null,
    delivery_fee: settings.deliveryFee,
    currency: settings.currency || '₱',
    plan: settings.plan || 'Starter',
    trial_days_left: settings.trialDaysLeft
  };
}

export function mapDbCategoryToCategory(db: DbCategory): Category {
  return {
    id: db.id,
    merchantId: db.merchant_id,
    name: db.name,
    image: db.image || undefined
  };
}

export function mapCategoryToDb(category: Partial<Category>, merchantId: string): Partial<DbCategory> {
  const out: Partial<DbCategory> = {
    merchant_id: merchantId,
    name: category.name
  };
  if (category.id && isUUID(category.id)) out.id = category.id;
  if (category.image !== undefined) out.image = category.image || null;
  return out;
}

export function mapDbProductToProduct(
  db: DbProduct,
  optionGroups: DbOptionGroup[] = [],
  options: DbProductOption[] = []
): Product {
  // Assemble nested option groups and options
  const mappedGroups: OptionGroup[] = optionGroups.map((g) => {
    const groupOptions: OptionItem[] = options
      .filter((o) => o.option_group_id === g.id)
      .map((o) => ({
        id: o.id,
        name: o.name,
        priceModifier: Number(o.price_modifier) || 0,
        colorHex: o.color_hex || undefined
      }));

    return {
      id: g.id,
      name: g.name,
      type: g.type,
      required: g.required,
      options: groupOptions
    };
  });

  return {
    id: db.id,
    merchantId: db.merchant_id,
    name: db.name,
    category: db.category_name || 'General',
    categoryId: db.category_id || undefined,
    basePrice: Number(db.base_price) || 0,
    description: db.description || '',
    image: db.image_url || '',
    isFeatured: db.is_featured,
    isBestSeller: db.is_best_seller,
    isActive: db.is_active,
    tag: db.tag || undefined,
    optionGroups: mappedGroups,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

export function mapProductToDb(product: Partial<Product>, merchantId: string): Partial<DbProduct> {
  const out: Partial<DbProduct> = {
    merchant_id: merchantId,
    name: product.name,
    category_name: product.category,
    category_id: product.categoryId && isUUID(product.categoryId) ? product.categoryId : null,
    base_price: product.basePrice,
    description: product.description || '',
    image_url: product.image || '',
    is_featured: Boolean(product.isFeatured),
    is_best_seller: Boolean(product.isBestSeller),
    is_active: product.isActive ?? true,
    tag: product.tag || null
  };
  if (product.id && isUUID(product.id)) out.id = product.id;
  return out;
}

export function mapDbCustomerToCustomer(db: DbCustomer): Customer {
  return {
    id: db.id,
    merchantId: db.merchant_id,
    fullName: db.full_name,
    phone: db.phone,
    email: db.email || undefined,
    address: db.address || undefined,
    totalOrders: db.total_orders || 0,
    totalSpent: Number(db.total_spent) || 0,
    lastOrderDate: db.last_order_date || undefined,
    createdAt: db.created_at
  };
}

export function mapCustomerToDb(customer: Partial<Customer>, merchantId: string): Partial<DbCustomer> {
  const out: Partial<DbCustomer> = {
    merchant_id: merchantId,
    full_name: customer.fullName,
    phone: customer.phone,
    email: customer.email || null,
    address: customer.address || null,
    total_orders: customer.totalOrders ?? 0,
    total_spent: customer.totalSpent ?? 0,
    last_order_date: customer.lastOrderDate || null
  };
  if (customer.id && isUUID(customer.id)) out.id = customer.id;
  return out;
}

export function mapDbOrderToOrder(db: DbOrder, items: DbOrderItem[] = []): Order {
  const mappedItems: OrderItemRecord[] = items.map((item) => ({
    productId: item.product_id || undefined,
    title: item.product_name,
    optionsDescription: item.options_description || undefined,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price) || 0,
    totalPrice: Number(item.total_price) || 0
  }));

  // Calculate rough timeAgo for UI display
  const createdMs = new Date(db.created_at).getTime();
  const diffMins = Math.max(0, Math.floor((Date.now() - createdMs) / 60000));
  let timeAgoStr = 'Just now';
  if (diffMins >= 60) {
    const hrs = Math.floor(diffMins / 60);
    timeAgoStr = `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  } else if (diffMins > 0) {
    timeAgoStr = `${diffMins} min ago`;
  }

  return {
    id: db.id,
    merchantId: db.merchant_id,
    orderNumber: db.order_number,
    customerName: db.customer_name,
    phone: db.phone,
    email: db.email || undefined,
    fulfillment: db.fulfillment,
    address: db.address,
    paymentMethod: db.payment_method,
    paymentStatus: db.payment_status,
    notes: db.notes || undefined,
    items: mappedItems,
    subtotal: Number(db.subtotal) || 0,
    deliveryFee: Number(db.delivery_fee) || 0,
    total: Number(db.total) || 0,
    status: db.status,
    trackingToken: db.tracking_token,
    createdAt: db.created_at,
    timeAgo: timeAgoStr,
    estimatedTime: db.estimated_time || '30-45 mins'
  };
}

export function mapOrderToDb(order: Partial<Order>, merchantId: string): Partial<DbOrder> {
  const out: Partial<DbOrder> = {
    merchant_id: merchantId,
    order_number: order.orderNumber,
    customer_name: order.customerName,
    phone: order.phone,
    email: order.email || null,
    fulfillment: order.fulfillment || 'delivery',
    address: order.address || '',
    payment_method: order.paymentMethod || 'cod',
    payment_status: order.paymentStatus || 'pending',
    notes: order.notes || null,
    subtotal: order.subtotal ?? 0,
    delivery_fee: order.deliveryFee ?? 0,
    total: order.total ?? 0,
    status: order.status || 'pending',
    estimated_time: order.estimatedTime || '30-45 mins'
  };
  if (order.id && isUUID(order.id)) out.id = order.id;
  if (order.createdAt) out.created_at = order.createdAt;
  return out;
}

export function mapOrderItemToDb(item: OrderItemRecord, orderId: string, merchantId: string): Partial<DbOrderItem> {
  return {
    merchant_id: merchantId,
    order_id: orderId,
    product_id: item.productId || null,
    product_name: item.title,
    options_description: item.optionsDescription || null,
    selected_options: {},
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice
  };
}
