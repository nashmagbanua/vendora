import { Category } from '../types';
import { INITIAL_CATEGORIES, DEFAULT_MERCHANT_ID } from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbCategory, mapDbCategoryToCategory, mapCategoryToDb } from '../lib/dbMappers';

const CATEGORIES_STORAGE_KEY = 'vendora_categories_cache';

function getStoredCategories(): Category[] {
  try {
    const data = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read categories from localStorage', e);
  }
  return INITIAL_CATEGORIES;
}

function setStoredCategories(categories: Category[]): void {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories to localStorage', e);
  }
}

export const categoryService = {
  /**
   * Fetch categories for merchant
   */
  async getCategories(merchantId: string = DEFAULT_MERCHANT_ID): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('merchant_id', merchantId)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped = data.map((c: DbCategory) => mapDbCategoryToCategory(c));
          setStoredCategories(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase category fetch failed, using local store:', err);
      }
    }

    const all = getStoredCategories();
    return all.filter((c) => (c.merchantId ? c.merchantId === merchantId : true));
  },

  /**
   * Create category
   */
  async createCategory(
    categoryData: Omit<Category, 'id'> & { id?: string },
    merchantId: string = DEFAULT_MERCHANT_ID
  ): Promise<Category> {
    const generatedId = categoryData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`);
    const newCategory: Category = {
      ...categoryData,
      id: generatedId,
      merchantId
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = mapCategoryToDb(newCategory, merchantId);
        const { data, error } = await supabase
          .from('categories')
          .insert(dbPayload)
          .select()
          .single();

        if (!error && data) {
          const mapped = mapDbCategoryToCategory(data as DbCategory);
          const all = getStoredCategories();
          setStoredCategories([...all.filter((c) => c.id !== mapped.id), mapped]);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase createCategory failed, saving to local store:', err);
      }
    }

    const all = getStoredCategories();
    const updated = [...all.filter((c) => c.id !== newCategory.id), newCategory];
    setStoredCategories(updated);
    return newCategory;
  },

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    updates: Partial<Category>,
    merchantId: string = DEFAULT_MERCHANT_ID
  ): Promise<Category> {
    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = mapCategoryToDb(updates, merchantId);
        const { data, error } = await supabase
          .from('categories')
          .update(dbPayload)
          .eq('id', id)
          .eq('merchant_id', merchantId)
          .select()
          .single();

        if (!error && data) {
          const mapped = mapDbCategoryToCategory(data as DbCategory);
          const all = getStoredCategories();
          setStoredCategories(all.map((c) => (c.id === id ? mapped : c)));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase updateCategory failed, saving to local store:', err);
      }
    }

    const all = getStoredCategories();
    let updatedCat: Category | null = null;

    const newCategories = all.map((c) => {
      if (c.id === id) {
        updatedCat = { ...c, ...updates, merchantId: c.merchantId || merchantId };
        return updatedCat;
      }
      return c;
    });

    if (!updatedCat) {
      throw new Error(`Category with ID ${id} not found.`);
    }

    setStoredCategories(newCategories);
    return updatedCat;
  },

  /**
   * Delete category
   */
  async deleteCategory(id: string, merchantId: string = DEFAULT_MERCHANT_ID): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('categories')
          .delete()
          .eq('id', id)
          .eq('merchant_id', merchantId);
      } catch (err) {
        console.warn('Supabase deleteCategory failed:', err);
      }
    }

    const all = getStoredCategories();
    const filtered = all.filter((c) => c.id !== id);
    setStoredCategories(filtered);
    return true;
  }
};
