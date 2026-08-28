import { useState, useEffect, useCallback } from 'react';
import { Category, Customer } from '../types';
import { categoryService } from '../services/categoryService';
import { customerService } from '../services/customerService';
import { DEFAULT_MERCHANT_ID } from '../data/initialData';

export function useMerchant(activeMerchantId: string = DEFAULT_MERCHANT_ID) {
  const [merchantId, setMerchantId] = useState<string>(activeMerchantId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync internal merchantId if prop changes
  useEffect(() => {
    if (activeMerchantId && activeMerchantId !== merchantId) {
      setMerchantId(activeMerchantId);
    }
  }, [activeMerchantId]);

  const refreshCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      setError(null);
      const data = await categoryService.getCategories(merchantId);
      setCategories(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  }, [merchantId]);

  const refreshCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true);
      setError(null);
      const data = await customerService.getCustomers(merchantId);
      setCustomers(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  }, [merchantId]);

  useEffect(() => {
    refreshCategories();
    refreshCustomers();
  }, [refreshCategories, refreshCustomers]);

  const addCategory = async (
    categoryData: Omit<Category, 'id'> & { id?: string }
  ): Promise<Category> => {
    try {
      setError(null);
      const newCat = await categoryService.createCategory(categoryData, merchantId);
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    } catch (err: any) {
      setError(err?.message || 'Failed to add category');
      throw err;
    }
  };

  const updateCategory = async (category: Category): Promise<Category> => {
    try {
      setError(null);
      const updated = await categoryService.updateCategory(category.id, category, merchantId);
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    try {
      setError(null);
      await categoryService.deleteCategory(categoryId, merchantId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to delete category');
      return false;
    }
  };

  return {
    merchantId,
    setMerchantId,
    categories,
    customers,
    loadingCategories,
    loadingCustomers,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
    refreshCustomers,
    setCategories,
    setCustomers
  };
}
