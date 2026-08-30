import { StoreSettings, Merchant } from '../types';
import { supabase, isSupabaseConfigured, isUUID } from '../lib/supabase';
import {
  DbMerchant,
  DbStoreSettings,
  mapDbMerchantToMerchant,
  mapDbSettingsToStoreSettings,
  mapStoreSettingsToDb
} from '../lib/dbMappers';

const SETTINGS_STORAGE_KEY = 'vendora_settings_cache';

const DEFAULT_EMPTY_SETTINGS: StoreSettings = {
  merchantId: '',
  storeName: 'Store',
  storeDescription: '',
  isOpen: true,
  currency: '₱',
  deliveryFee: 50,
  phone: '',
  address: '',
  trialDaysLeft: 14,
  plan: 'Growth Plan'
};

function getStoredSettings(): StoreSettings {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read settings from localStorage', e);
  }
  return DEFAULT_EMPTY_SETTINGS;
}

function setStoredSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export const merchantService = {
  /**
   * Fetch merchant profile by ID
   */
  async getMerchant(merchantId: string = ''): Promise<Merchant | null> {
    if (!merchantId) return null;

    if (isSupabaseConfigured && supabase && isUUID(merchantId)) {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', merchantId)
          .maybeSingle();

        if (!error && data) {
          return mapDbMerchantToMerchant(data as DbMerchant);
        }
      } catch (err) {
        console.warn('[merchantService] Supabase getMerchant failed:', err);
      }
      return null;
    }
    return null;
  },

  /**
   * Fetch merchant by slug for deterministic storefront routing
   */
  async getMerchantBySlug(slug: string): Promise<Merchant | null> {
    if (!slug) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (!error && data) {
          return mapDbMerchantToMerchant(data as DbMerchant);
        }
      } catch (err) {
        console.warn('[merchantService] Supabase getMerchantBySlug failed:', err);
      }
      return null;
    }
    return null;
  },

  /**
   * Fetch the first active merchant from database for default storefront exploration
   */
  async getFirstActiveMerchant(): Promise<Merchant | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return mapDbMerchantToMerchant(data as DbMerchant);
        }
      } catch (err) {
        console.warn('[merchantService] Supabase getFirstActiveMerchant failed:', err);
      }
      return null;
    }
    return null;
  },

  /**
   * Fetch store configuration and operational settings
   */
  async getStoreSettings(merchantId: string = ''): Promise<StoreSettings> {
    if (!merchantId) {
      return {
        ...DEFAULT_EMPTY_SETTINGS,
        merchantId: ''
      };
    }

    if (isSupabaseConfigured && supabase && isUUID(merchantId)) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('merchant_id', merchantId)
          .maybeSingle();

        if (!error && data) {
          const mapped = mapDbSettingsToStoreSettings(data as DbStoreSettings);
          setStoredSettings(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('[merchantService] Supabase getStoreSettings failed:', err);
      }
      return {
        ...DEFAULT_EMPTY_SETTINGS,
        merchantId
      };
    }

    const stored = getStoredSettings();
    if (stored.merchantId === merchantId) {
      return stored;
    }
    return {
      ...DEFAULT_EMPTY_SETTINGS,
      merchantId
    };
  },

  /**
   * Update store configuration
   */
  async updateStoreSettings(
    updates: Partial<StoreSettings>,
    merchantId: string = ''
  ): Promise<StoreSettings> {
    if (!merchantId) {
      throw new Error('Merchant ID is required to update store settings.');
    }

    const current = getStoredSettings();
    const updated: StoreSettings = {
      ...current,
      ...updates,
      merchantId: current.merchantId || merchantId
    };

    if (isSupabaseConfigured && supabase && isUUID(merchantId)) {
      try {
        const dbPayload = mapStoreSettingsToDb(updated, merchantId);
        const { data, error } = await supabase
          .from('store_settings')
          .upsert(dbPayload, { onConflict: 'merchant_id' })
          .select()
          .single();

        if (!error && data) {
          const mapped = mapDbSettingsToStoreSettings(data as DbStoreSettings);
          setStoredSettings(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase updateStoreSettings failed, saving to local store:', err);
      }
    }

    setStoredSettings(updated);
    return updated;
  },

  /**
   * Toggle store open / closed status
   */
  async toggleStoreStatus(merchantId: string = ''): Promise<StoreSettings> {
    if (!merchantId) {
      throw new Error('Merchant ID is required to toggle store status.');
    }
    const current = await this.getStoreSettings(merchantId);
    return this.updateStoreSettings({ isOpen: !current.isOpen }, merchantId);
  }
};
