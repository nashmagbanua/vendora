import { Order, OrderStatus, PaymentStatus } from '../types';
import { INITIAL_ORDERS, DEFAULT_MERCHANT_ID } from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DbOrder,
  DbOrderItem,
  mapDbOrderToOrder,
  mapOrderToDb,
  mapOrderItemToDb
} from '../lib/dbMappers';

const ORDERS_STORAGE_KEY = 'vendora_orders_cache';

function getStoredOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read orders from localStorage', e);
  }
  return INITIAL_ORDERS;
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
  async getOrders(merchantId: string = DEFAULT_MERCHANT_ID): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbOrders, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: false });

        if (!orderErr && dbOrders && dbOrders.length > 0) {
          const orderIds = dbOrders.map((o: DbOrder) => o.id);
          const { data: dbItems } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

          const mapped: Order[] = dbOrders.map((o: DbOrder) => {
            const items = (dbItems as DbOrderItem[] || []).filter((it) => it.order_id === o.id);
            return mapDbOrderToOrder(o, items);
          });

          setStoredOrders(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase orders fetch failed, using local store:', err);
      }
    }

    const all = getStoredOrders();
    return all.filter((o) => (o.merchantId ? o.merchantId === merchantId : true));
  },

  /**
   * Fetch order by ID including item snapshots
   */
  async getOrderById(id: string, merchantId: string = DEFAULT_MERCHANT_ID): Promise<Order | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbOrder, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (!orderErr && dbOrder) {
          const { data: dbItems } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', id);

          return mapDbOrderToOrder(dbOrder as DbOrder, (dbItems as DbOrderItem[]) || []);
        }
      } catch (err) {
        console.warn('Supabase getOrderById failed, using local store:', err);
      }
    }

    const orders = await this.getOrders(merchantId);
    return orders.find((o) => o.id === id) || null;
  },

  /**
   * Create a new customer order with immutable item snapshots
   */
  async createOrder(
    orderData: Omit<Order, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
    merchantId: string = DEFAULT_MERCHANT_ID
  ): Promise<Order> {
    const generatedId = orderData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `order-${Date.now()}`);
    const newOrder: Order = {
      ...orderData,
      id: generatedId,
      merchantId,
      createdAt: orderData.createdAt || new Date().toISOString(),
      timeAgo: 'Just now',
      paymentStatus: orderData.paymentStatus || (orderData.paymentMethod === 'cod' ? 'pending' : 'pending')
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = mapOrderToDb(newOrder, merchantId);
        const { data: insertedOrder, error: insertErr } = await supabase
          .from('orders')
          .insert(dbPayload)
          .select()
          .single();

        if (!insertErr && insertedOrder) {
          const orderId = insertedOrder.id;

          // Insert order items snapshots
          if (newOrder.items && newOrder.items.length > 0) {
            const itemsPayload = newOrder.items.map((item) =>
              mapOrderItemToDb(item, orderId, merchantId)
            );
            await supabase.from('order_items').insert(itemsPayload);
          }

          const fullOrder = await this.getOrderById(orderId, merchantId);
          if (fullOrder) {
            const all = getStoredOrders();
            setStoredOrders([fullOrder, ...all.filter((o) => o.id !== fullOrder.id)]);
            return fullOrder;
          }
        }
      } catch (err) {
        console.warn('Supabase createOrder failed, saving to local store:', err);
      }
    }

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
    merchantId: string = DEFAULT_MERCHANT_ID
  ): Promise<Order> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId)
          .eq('merchant_id', merchantId);
      } catch (err) {
        console.warn('Supabase updateOrderStatus failed:', err);
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
    merchantId: string = DEFAULT_MERCHANT_ID
  ): Promise<Order> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ payment_status: paymentStatus })
          .eq('id', orderId)
          .eq('merchant_id', merchantId);
      } catch (err) {
        console.warn('Supabase updatePaymentStatus failed:', err);
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
    merchantId: string = DEFAULT_MERCHANT_ID
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
