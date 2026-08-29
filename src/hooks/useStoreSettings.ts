import { useState, useEffect, useCallback } from 'react';
import { StoreSettings } from '../types';
import { merchantService } from '../services/merchantService';

const DEFAULT_INITIAL_SETTINGS: StoreSettings = {
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

export function useStoreSettings(merchantId: string = '') {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await merchantService.getStoreSettings(merchantId);
      setSettings(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load store settings');
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = async (
    newSettings: Partial<StoreSettings>
  ): Promise<StoreSettings> => {
    try {
      setError(null);
      const updated = await merchantService.updateStoreSettings(newSettings, merchantId);
      setSettings(updated);
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to update store settings');
      throw err;
    }
  };

  const toggleStoreStatus = async (): Promise<StoreSettings> => {
    try {
      setError(null);
      const updated = await merchantService.toggleStoreStatus(merchantId);
      setSettings(updated);
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle store status');
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    toggleStoreStatus,
    refreshSettings,
    setSettings
  };
}
