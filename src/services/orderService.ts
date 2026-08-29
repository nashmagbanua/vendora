import { Order, OrderStatus, PaymentStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DbOrder,
  DbOrderItem,
  mapDbOrderToOrder,
  mapOrderToDb,
  mapOrderItemToDb
} from '../lib/dbMappers';

const ORDERS_STORAGE_KEY = 'vendora_orders_cache';
const GUEST_TOKENS_KEY = 'vendora_guest_order_tokens';

interface StoredGuestToken {
  orderId: string;
  trackingToken: string;
  merchantId?: string;
  createdAt: string;
}

function getStoredGuestTokens(): StoredGuestToken[] {
  try {
    const raw = localStorage.getItem(GUEST_TOKENS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read guest order tokens from localStorage', e);
  }
  return [];
}

function saveGuestToken(orderId: string, trackingToken: string, merchantId?: string): void {
  try {
    const existing = getStoredGuestTokens().filter((t) => t.orderId !== orderId);
    const updated: StoredGuestToken[] = [
      { orderId, trackingToken, merchantId, createdAt: new Date().toISOString() },
      ...existing
    ].slice(0, 50);
    localStorage.setItem(GUEST_TOKENS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to store guest order token', e);
  }
}

function getStoredOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read orders from localStorage', e);
  }
  return [];
}

function setStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
}

export const orderService = {
  /**
   * Fetch all orders for a merchant including historical item snapshots
   */
  async getOrders(merchantId: string = ''): Promise<Order[]> {
    if (!merchantId) return [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbOrders, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: false });

        if (orderErr) {
          console.warn('[orderService] Supabase orders fetch error:', orderErr.message);
          return [];
        }

        if (dbOrders) {
          if (dbOrders.length === 0) {
            return [];
          }
          const orderIds = dbOrders.map((o: DbOrder) => o.id);
          const { data: dbItems, error: itemsErr } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

          if (itemsErr) {
            console.warn('[orderService] Supabase order items error:', itemsErr.message);
          }

          const mapped: Order[] = dbOrders.map((o: DbOrder) => {
            const items = (dbItems as DbOrderItem[] || []).filter((it) => it.order_id === o.id);
            return mapDbOrderToOrder(o, items);
          });

          return mapped;
        }
      } catch (err) {
        console.warn('[orderService] Supabase orders fetch failed:', err);
        return [];
      }
    }

    const all = getStoredOrders();
    return all.filter((o) => (o.merchantId ? o.merchantId === merchantId : true));
  },

  /**
   * Fetch order by ID or Tracking Token including item snapshots
   */
  async getOrderById(id: string, merchantId: string = '', trackingToken?: string): Promise<Order | null> {
    if (!id) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        // If tracking token is provided, attempt secure RPC lookup
        if (trackingToken) {
          const { data: rpcData, error: rpcErr } = await supabase.rpc('get_order_by_tracking_token', {
            p_order_id: id,
            p_tracking_token: trackingToken
          });
          if (!rpcErr && rpcData) {
            return rpcData as Order;
          }
        }

        const query = supabase
          .from('orders')
          .select('*')
          .eq('id', id);

        if (merchantId) {
          query.eq('merchant_id', merchantId);
        }

        const { data: dbOrder, error: orderErr } = await query.maybeSingle();

        if (!orderErr && dbOrder) {
          const { data: dbItems } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', id);

          return mapDbOrderToOrder(dbOrder as DbOrder, (dbItems as DbOrderItem[]) || []);
        }
      } catch (err) {
        console.warn('[orderService] Supabase getOrderById failed:', err);
      }
      return null;
    }

    const orders = await this.getOrders(merchantId);
    return orders.find((o) => o.id === id) || null;
  },

  /**
   * Fetch recent orders placed by guest customer using stored tracking tokens
   */
  async getGuestOrders(merchantId: string = ''): Promise<Order[]> {
    const tokens = getStoredGuestTokens();
    const guestTokens = tokens.filter((t) => !t.merchantId || !merchantId || t.merchantId === merchantId);
    
    if (guestTokens.length === 0) {
      if (isSupabaseConfigured && supabase) {
        return [];
      }
      const all = getStoredOrders();
      return all.filter((o) => (o.merchantId ? o.merchantId === merchantId : true));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const fetchedOrders: Order[] = [];
        for (const tokenItem of guestTokens) {
          const order = await this.getOrderById(tokenItem.orderId, merchantId, tokenItem.trackingToken);
          if (order) {
            fetchedOrders.push(order);
          }
        }
        return fetchedOrders;
      } catch (err) {
        console.warn('[orderService] Failed to fetch guest orders via tokens:', err);
        return [];
      }
    }

    const all = getStoredOrders();
    return all.filter((o) => (o.merchantId ? o.merchantId === merchantId : true));
  },

  /**
   * Create a new customer order with server-side pricing validation and immutable snapshots
   * In Supabase mode, STRICTLY uses create_secure_order RPC and never falls back to direct client inserts
   */
  async createOrder(
    orderData: Omit<Order, 'id' | 'createdAt'> & { id?: string; createdAt?: string; trackingToken?: string },
    merchantId: string = ''
  ): Promise<Order> {
    if (!merchantId) {
      throw new Error('Merchant ID is required to create an order.');
    }

    const generatedId = orderData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `order-${Date.now()}`);
    const fallbackToken = orderData.trackingToken || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : `token-${Date.now()}`);
    
    const newOrder: Order = {
      ...orderData,
      id: generatedId,
      merchantId,
      trackingToken: fallbackToken,
      createdAt: orderData.createdAt || new Date().toISOString(),
      timeAgo: 'Just now',
      paymentStatus: orderData.paymentStatus || 'pending'
    };

    if (isSupabaseConfigured && supabase) {
      // Transform selectedOptions into exact JSONB structure expected by create_secure_order
      const itemsPayload = (newOrder.items || []).map((item) => ({
        product_id: item.productId,
        quantity: Math.max(1, Math.min(item.quantity || 1, 99)),
        options_description: item.optionsDescription || 'Standard',
        selected_options: item.selectedOptions || {}
      }));

      if (itemsPayload.length === 0) {
        throw new Error('Order must contain at least one item.');
      }

      // Creation via the atomic, server-validated RPC
      const { data: createdOrderRpc, error: rpcErr } = await supabase.rpc('create_secure_order', {
        p_merchant_id: merchantId,
        p_customer_name: newOrder.customerName,
        p_phone: newOrder.phone,
        p_email: newOrder.email || null,
        p_fulfillment: newOrder.fulfillment,
        p_address: newOrder.address,
        p_payment_method: newOrder.paymentMethod,
        p_notes: newOrder.notes || null,
        p_items: itemsPayload,
        p_order_number: newOrder.orderNumber || null
      });

      if (rpcErr || !createdOrderRpc) {
        console.error('[orderService] create_secure_order RPC failed:', rpcErr);
        throw new Error(rpcErr?.message || 'Failed to create order securely. Please try again.');
      }

      const verifiedOrder = createdOrderRpc as Order;
      if (verifiedOrder.trackingToken) {
        saveGuestToken(verifiedOrder.id, verifiedOrder.trackingToken, merchantId);
      }
      return verifiedOrder;
    }

    // Local development storage when Supabase is not configured
    saveGuestToken(newOrder.id, fallbackToken, merchantId);
    const all = getStoredOrders();
    const updated = [newOrder, ...all.filter((o) => o.id !== newOrder.id)];
    setStoredOrders(updated);
    return newOrder;
  },

  /**
   * Update order status (e.g. pending -> accepted -> preparing -> ready -> completed)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    merchantId: string = ''
  ): Promise<Order> {
    if (!orderId) {
      throw new Error('Order ID is required.');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const query = supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId);

        if (merchantId) {
          query.eq('merchant_id', merchantId);
        }

        const { error } = await query;
        if (error) {
          throw new Error(error.message);
        }
      } catch (err: any) {
        console.warn('Supabase updateOrderStatus failed:', err);
        throw err;
      }
    }

    const all = getStoredOrders();
    let updatedOrder: Order | null = null;

    const newOrders = all.map((o) => {
      if (o.id === orderId) {
        updatedOrder = {
          ...o,
          status,
          merchantId: o.merchantId || merchantId
        };
        return updatedOrder;
      }
      return o;
    });

    if (!updatedOrder) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    setStoredOrders(newOrders);
    return updatedOrder;
  },

  /**
   * Update payment status (e.g. pending -> paid -> failed -> refunded)
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    merchantId: string = ''
  ): Promise<Order> {
    if (!orderId) {
      throw new Error('Order ID is required.');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const query = supabase
          .from('orders')
          .update({ payment_status: paymentStatus })
          .eq('id', orderId);

        if (merchantId) {
          query.eq('merchant_id', merchantId);
        }

        const { error } = await query;
        if (error) {
          throw new Error(error.message);
        }
      } catch (err: any) {
        console.warn('Supabase updatePaymentStatus failed:', err);
        throw err;
      }
    }

    const all = getStoredOrders();
    let updatedOrder: Order | null = null;

    const newOrders = all.map((o) => {
      if (o.id === orderId) {
        updatedOrder = {
          ...o,
          paymentStatus,
          merchantId: o.merchantId || merchantId
        };
        return updatedOrder;
      }
      return o;
    });

    if (!updatedOrder) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    setStoredOrders(newOrders);
    return updatedOrder;
  },

  /**
   * Advance order status to next logical fulfillment stage
   */
  async advanceOrderStatus(
    orderId: string,
    merchantId: string = ''
  ): Promise<Order> {
    const order = await this.getOrderById(orderId, merchantId);
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    let nextStatus: OrderStatus = order.status;
    if (order.status === 'pending') nextStatus = 'accepted';
    else if (order.status === 'accepted') nextStatus = 'preparing';
    else if (order.status === 'preparing') nextStatus = 'ready';
    else if (order.status === 'ready') nextStatus = 'completed';

    return this.updateOrderStatus(orderId, nextStatus, merchantId);
  }
};
