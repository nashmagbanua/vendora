import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/orderService';
import { DbOrder, mapDbOrderToOrder } from '../lib/dbMappers';
import { soundService } from '../services/soundService';

interface UseMerchantOrderRealtimeOptions {
  merchantId: string;
  enabled?: boolean;
  onNewOrder?: (order: Order) => void;
  onOrderUpdated?: (order: Order) => void;
  onOrderDeleted?: (orderId: string) => void;
  playNotificationSound?: boolean;
}

/**
 * Realtime hook for Merchants to listen to incoming orders and updates for their store
 */
export function useMerchantOrderRealtime({
  merchantId,
  enabled = true,
  onNewOrder,
  onOrderUpdated,
  onOrderDeleted,
  playNotificationSound = true
}: UseMerchantOrderRealtimeOptions) {
  // Use refs for callbacks to avoid re-subscribing on function reference changes
  const onNewOrderRef = useRef(onNewOrder);
  const onOrderUpdatedRef = useRef(onOrderUpdated);
  const onOrderDeletedRef = useRef(onOrderDeleted);
  const playSoundRef = useRef(playNotificationSound);

  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
    onOrderUpdatedRef.current = onOrderUpdated;
    onOrderDeletedRef.current = onOrderDeleted;
    playSoundRef.current = playNotificationSound;
  });

  useEffect(() => {
    if (!enabled || !merchantId || !isSupabaseConfigured || !supabase) {
      return;
    }

    const channelName = `realtime:merchant-orders:${merchantId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `merchant_id=eq.${merchantId}`
        },
        async (payload) => {
          const dbOrder = payload.new as DbOrder;
          if (!dbOrder || !dbOrder.id) return;

          try {
            // Fetch complete order with line items
            const fullOrder = await orderService.getOrderById(dbOrder.id, merchantId);
            const resolvedOrder: Order = fullOrder || mapDbOrderToOrder(dbOrder, []);

            if (playSoundRef.current) {
              soundService.playNewOrderChime();
            }

            if (onNewOrderRef.current) {
              onNewOrderRef.current(resolvedOrder);
            }
          } catch (err) {
            console.warn('[useMerchantOrderRealtime] Failed to resolve inserted order:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `merchant_id=eq.${merchantId}`
        },
        async (payload) => {
          const dbOrder = payload.new as DbOrder;
          if (!dbOrder || !dbOrder.id) return;

          try {
            const fullOrder = await orderService.getOrderById(dbOrder.id, merchantId);
            const resolvedOrder: Order = fullOrder || mapDbOrderToOrder(dbOrder, []);

            if (onOrderUpdatedRef.current) {
              onOrderUpdatedRef.current(resolvedOrder);
            }
          } catch (err) {
            console.warn('[useMerchantOrderRealtime] Failed to resolve updated order:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders',
          filter: `merchant_id=eq.${merchantId}`
        },
        (payload) => {
          const deletedId = (payload.old as any)?.id;
          if (deletedId && onOrderDeletedRef.current) {
            onOrderDeletedRef.current(deletedId);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn(`[useMerchantOrderRealtime] Channel error on ${channelName}:`, err);
        }
      });

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [merchantId, enabled]);
}

interface UseCustomerOrderRealtimeOptions {
  orderId?: string | null;
  merchantId?: string;
  enabled?: boolean;
  onStatusChange?: (newStatus: OrderStatus, fullOrder: Order) => void;
  onOrderUpdated?: (order: Order) => void;
}

/**
 * Realtime hook for Customers to track order status changes live
 */
export function useCustomerOrderRealtime({
  orderId,
  merchantId,
  enabled = true,
  onStatusChange,
  onOrderUpdated
}: UseCustomerOrderRealtimeOptions) {
  const onStatusChangeRef = useRef(onStatusChange);
  const onOrderUpdatedRef = useRef(onOrderUpdated);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
    onOrderUpdatedRef.current = onOrderUpdated;
  });

  useEffect(() => {
    if (!enabled || !orderId || !isSupabaseConfigured || !supabase) {
      return;
    }

    const channelName = `realtime:customer-order:${orderId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        async (payload) => {
          const dbOrder = payload.new as DbOrder;
          if (!dbOrder || !dbOrder.id) return;

          try {
            const fullOrder = await orderService.getOrderById(dbOrder.id, merchantId);
            const resolvedOrder: Order = fullOrder || mapDbOrderToOrder(dbOrder, []);

            if (onStatusChangeRef.current) {
              onStatusChangeRef.current(resolvedOrder.status, resolvedOrder);
            }
            if (onOrderUpdatedRef.current) {
              onOrderUpdatedRef.current(resolvedOrder);
            }
          } catch (err) {
            console.warn('[useCustomerOrderRealtime] Failed to handle order status update:', err);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn(`[useCustomerOrderRealtime] Channel error on ${channelName}:`, err);
        }
      });

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [orderId, merchantId, enabled]);
}
