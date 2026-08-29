import { useState, useEffect, useCallback, useMemo } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { orderService } from '../services/orderService';
import { useMerchantOrderRealtime } from './useOrderRealtime';

interface UseOrdersOptions {
  onIncomingOrder?: (order: Order) => void;
  enableRealtime?: boolean;
  isMerchantAuthenticated?: boolean;
}

export function useOrders(
  merchantId: string = '',
  options: UseOrdersOptions = {}
) {
  const { onIncomingOrder, enableRealtime = true, isMerchantAuthenticated = false } = options;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshOrders = useCallback(async () => {
    if (!merchantId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = isMerchantAuthenticated
        ? await orderService.getOrders(merchantId)
        : await orderService.getGuestOrders(merchantId);
      setOrders(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [merchantId, isMerchantAuthenticated]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // Supabase Realtime synchronization with idempotency checks
  useMerchantOrderRealtime({
    merchantId,
    enabled: enableRealtime && Boolean(merchantId),
    onNewOrder: (newOrder) => {
      setOrders((prev) => {
        // Prevent duplicate order insertion
        if (prev.some((o) => o.id === newOrder.id || o.orderNumber === newOrder.orderNumber)) {
          return prev;
        }
        return [newOrder, ...prev];
      });
      if (onIncomingOrder) {
        onIncomingOrder(newOrder);
      }
    },
    onOrderUpdated: (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    },
    onOrderDeleted: (deletedId) => {
      setOrders((prev) => prev.filter((o) => o.id !== deletedId));
    }
  });

  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'pending').length,
    [orders]
  );

  const placeOrder = async (
    orderData: Omit<Order, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ): Promise<Order> => {
    try {
      setError(null);
      const created = await orderService.createOrder(orderData, merchantId);
      setOrders((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      setError(err?.message || 'Failed to place order');
      throw err;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus
  ): Promise<Order> => {
    try {
      setError(null);
      const updated = await orderService.updateOrderStatus(orderId, status, merchantId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to update order status');
      throw err;
    }
  };

  const advanceOrderStatus = async (orderId: string): Promise<Order> => {
    try {
      setError(null);
      const updated = await orderService.advanceOrderStatus(orderId, merchantId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to advance order status');
      throw err;
    }
  };

  const updatePaymentStatus = async (
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<Order> => {
    try {
      setError(null);
      const updated = await orderService.updatePaymentStatus(orderId, paymentStatus, merchantId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to update payment status');
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    pendingOrdersCount,
    placeOrder,
    updateOrderStatus,
    advanceOrderStatus,
    updatePaymentStatus,
    refreshOrders,
    setOrders
  };
}
