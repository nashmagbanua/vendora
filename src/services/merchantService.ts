import { StoreSettings, Merchant } from '../types';
import { INITIAL_SETTINGS, INITIAL_MERCHANT, DEFAULT_MERCHANT_ID } from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DbMerchant,
  DbStoreSettings,
  mapDbMerchantToMerchant,
  mapDbSettingsToStoreSettings,
  mapStoreSettingsToDb
} from '../lib/dbMappers';

const SETTINGS_STORAGE_KEY = 'vendora_settings_cache';

function getStoredSettings(): StoreSettings {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read settings from localStorage', e);
  }
  return INITIAL_SETTINGS;
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
  async getMerchant(merchantId: string = DEFAULT_MERCHANT_ID): Promise<Merchant | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', merchantId)
          .single();

        if (!error && data) {
          return mapDbMerchantToMerchant(data as DbMerchant);
        }
      } catch (err) {
        console.warn('Supabase getMerchant failed, using seed data:', err);
      }
    }
    return INITIAL_MERCHANT;
  },

  /**
   * Fetch store configuration and operational settings
   */
  async getStoreSettings(merchantId: string = DEFAULT_MERCHANT_ID): Promise<StoreSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('merchant_id', merchantId)
          .single();

        if (!error && data) {
          const mapped = mapDbSettingsToStoreSettings(data as DbStoreSettings);
          setStoredSettings(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getStoreSettings failed, using local store:', err);
      }
    }

    return getStoredSettings();
  },

  /**
   * Update store configuration
   */
  async updateStoreSettings(
    updates: Partial<StoreSettings>,
    merchantId: string = DEFAULT_MERCHANT_ID
  ): Promise<StoreSettings> {
    const current = getStoredSettings();
    const updated: StoreSettings = {
      ...current,
      ...updates,
      merchantId: current.merchantId || merchantId
    };

    if (isSupabaseConfigured && supabase) {
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
  async toggleStoreStatus(merchantId: string = DEFAULT_MERCHANT_ID): Promise<StoreSettings> {
    const current = getStoredSettings();
    return this.updateStoreSettings({ isOpen: !current.isOpen }, merchantId);
  }
};
