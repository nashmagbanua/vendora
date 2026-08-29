import { Customer, Order } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DbCustomer,
  mapDbCustomerToCustomer,
  mapCustomerToDb
} from '../lib/dbMappers';

const CUSTOMERS_STORAGE_KEY = 'vendora_customers_cache';

function getStoredCustomers(): Customer[] {
  try {
    const data = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read customers from localStorage', e);
  }
  return [];
}

function setStoredCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers to localStorage', e);
  }
}

export const customerService = {
  /**
   * Fetch all customers for a merchant
   */
  async getCustomers(merchantId: string = ''): Promise<Customer[]> {
    if (!merchantId) return [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('merchant_id', merchantId)
          .order('total_spent', { ascending: false });

        if (error) {
          console.warn('[customerService] Supabase customer fetch error:', error.message);
          return [];
        }

        if (data) {
          return data.map((c: DbCustomer) => mapDbCustomerToCustomer(c));
        }
      } catch (err) {
        console.warn('[customerService] Supabase customer fetch failed:', err);
        return [];
      }
    }

    const all = getStoredCustomers();
    return all.filter((c) => c.merchantId === merchantId);
  },

  /**
   * Find a customer by phone number
   */
  async getCustomerByPhone(phone: string, merchantId: string = ''): Promise<Customer | null> {
    if (!merchantId || !phone) return null;
    const cleanPhone = phone.replace(/\s+/g, '');
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('merchant_id', merchantId)
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (!error && data) {
          return mapDbCustomerToCustomer(data as DbCustomer);
        }
      } catch (err) {
        console.warn('[customerService] Supabase getCustomerByPhone failed:', err);
      }
      return null;
    }

    const customers = await this.getCustomers(merchantId);
    return customers.find((c) => c.phone.replace(/\s+/g, '') === cleanPhone) || null;
  },

  /**
   * Create or update a customer record
   */
  async upsertCustomer(
    customerData: Partial<Customer> & { fullName: string; phone: string },
    merchantId: string = ''
  ): Promise<Customer> {
    if (!merchantId) {
      throw new Error('Merchant ID is required to upsert customer.');
    }
    const cleanPhone = customerData.phone.trim();

    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = mapCustomerToDb(
          { ...customerData, phone: cleanPhone },
          merchantId
        );
        const { data, error } = await supabase
          .from('customers')
          .upsert(dbPayload, { onConflict: 'merchant_id,phone' })
          .select()
          .single();

        if (!error && data) {
          const mapped = mapDbCustomerToCustomer(data as DbCustomer);
          const all = getStoredCustomers();
          setStoredCustomers([...all.filter((c) => c.id !== mapped.id), mapped]);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase upsertCustomer failed, using local store:', err);
      }
    }

    const all = getStoredCustomers();
    const existingIndex = all.findIndex(
      (c) => c.phone.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '')
    );

    if (existingIndex >= 0) {
      const existing = all[existingIndex];
      const updated: Customer = {
        ...existing,
        ...customerData,
        merchantId: existing.merchantId || merchantId,
        totalOrders: (existing.totalOrders || 0) + (customerData.totalOrders || 0),
        totalSpent: (existing.totalSpent || 0) + (customerData.totalSpent || 0),
        lastOrderDate: customerData.lastOrderDate || new Date().toISOString()
      };
      all[existingIndex] = updated;
      setStoredCustomers(all);
      return updated;
    } else {
      const newCustomer: Customer = {
        id: customerData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cust-${Date.now()}`),
        merchantId,
        fullName: customerData.fullName,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        totalOrders: customerData.totalOrders || 1,
        totalSpent: customerData.totalSpent || 0,
        lastOrderDate: customerData.lastOrderDate || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      const updatedList = [newCustomer, ...all];
      setStoredCustomers(updatedList);
      return newCustomer;
    }
  },

  /**
   * Derive and aggregate customers list from orders
   */
  deriveCustomersFromOrders(orders: Order[], baseCustomers: Customer[] = []): Customer[] {
    const map = new Map<string, Customer>();

    // Seed with known base customers
    baseCustomers.forEach((c) => {
      map.set(c.phone.toLowerCase().replace(/\s+/g, ''), { ...c });
    });

    // Aggregate from orders
    orders.forEach((order) => {
      const key = order.phone.toLowerCase().replace(/\s+/g, '') || order.customerName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: `cust-${order.id}`,
          merchantId: order.merchantId || '',
          fullName: order.customerName,
          phone: order.phone,
          address: order.address,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
          createdAt: order.createdAt
        });
      }
      const cust = map.get(key)!;
      cust.totalOrders = (cust.totalOrders || 0) + 1;
      cust.totalSpent = (cust.totalSpent || 0) + order.total;
      if (new Date(order.createdAt) > new Date(cust.lastOrderDate || 0)) {
        cust.lastOrderDate = order.createdAt;
        if (order.address && order.address !== 'Store Pickup') {
          cust.address = order.address;
        }
      }
    });

    return Array.from(map.values());
  }
};
