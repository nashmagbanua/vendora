import { Product } from '../types';
import { INITIAL_PRODUCTS, DEFAULT_MERCHANT_ID } from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DbProduct,
  DbOptionGroup,
  DbProductOption,
  mapDbProductToProduct,
  mapProductToDb
} from '../lib/dbMappers';

const PRODUCTS_STORAGE_KEY = 'vendora_products_cache';

function getStoredProducts(): Product[] {
  try {
    const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read products from localStorage', e);
  }
  return INITIAL_PRODUCTS;
}

function setStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

export const productService = {
  /**
   * Fetch all products for a given merchant (including option groups & choices)
   */
  async getProducts(merchantId: string = DEFAULT_MERCHANT_ID): Promise<Product[]> {
    if (!merchantId) return [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbProducts, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: false });

        if (prodErr) {
          console.warn('[productService] Supabase product fetch error:', prodErr.message);
          return [];
        }

        if (dbProducts) {
          if (dbProducts.length === 0) {
            return [];
          }

          const productIds = dbProducts.map((p: DbProduct) => p.id);

          // Fetch option groups
          const { data: dbGroups } = await supabase
            .from('product_option_groups')
            .select('*')
            .in('product_id', productIds)
            .order('display_order', { ascending: true });

          // Fetch individual options
          const { data: dbOptions } = await supabase
            .from('product_options')
            .select('*')
            .in('product_id', productIds)
            .order('display_order', { ascending: true });

          const mapped = dbProducts.map((p: DbProduct) => {
            const groups = (dbGroups as DbOptionGroup[] || []).filter((g) => g.product_id === p.id);
            const options = (dbOptions as DbProductOption[] || []).filter((o) => o.product_id === p.id);
            return mapDbProductToProduct(p, groups, options);
          });

          return mapped;
        }
      } catch (err) {
        console.warn('[productService] Supabase product fetch failed:', err);
        return [];
      }
    }

    const all = getStoredProducts();
    return all.filter((p) => (p.merchantId ? p.merchantId === merchantId : true));
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id: string, merchantId: string = DEFAULT_MERCHANT_ID): Promise<Product | null> {
    if (!merchantId) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbProduct, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('merchant_id', merchantId)
          .maybeSingle();

        if (!prodErr && dbProduct) {
          const { data: dbGroups } = await supabase
            .from('product_option_groups')
            .select('*')
            .eq('product_id', id)
            .order('display_order', { ascending: true });

          const { data: dbOptions } = await supabase
            .from('product_options')
            .select('*')
            .eq('product_id', id)
            .order('display_order', { ascending: true });

          return mapDbProductToProduct(
            dbProduct as DbProduct,
            (dbGroups as DbOptionGroup[]) || [],
            (dbOptions as DbProductOption[]) || []
          );
        }
      } catch (err) {
        console.warn('[productService] Supabase getProductById failed:', err);
      }
      return null;
    }

    const products = await this.getProducts(merchantId);
    return products.find((p) => p.id === id) || null;
  },

  /**
   * Create or save a new product
   */
  async createProduct(
    productData: Omit<Product, 'id'> & { id?: string },
    merchantId: string = DEFAULT_MERCHANT_ID
  ): Promise<Product> {
    const generatedId = productData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prod-${Date.now()}`);
    const newProduct: Product = {
      ...productData,
      id: generatedId,
      merchantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = mapProductToDb(newProduct, merchantId);
        const { data: insertedProduct, error: insertErr } = await supabase
          .from('products')
          .insert(dbPayload)
          .select()
          .single();

        if (!insertErr && insertedProduct) {
          const actualProductId = insertedProduct.id;

          // Insert option groups and options if any
          if (newProduct.optionGroups && newProduct.optionGroups.length > 0) {
            for (let gIdx = 0; gIdx < newProduct.optionGroups.length; gIdx++) {
              const group = newProduct.optionGroups[gIdx];
              const { data: insertedGroup } = await supabase
                .from('product_option_groups')
                .insert({
                  merchant_id: merchantId,
                  product_id: actualProductId,
                  name: group.name,
                  type: group.type,
                  required: group.required,
                  display_order: gIdx
                })
                .select()
                .single();

              if (insertedGroup && group.options && group.options.length > 0) {
                const optionsPayload = group.options.map((opt, oIdx) => ({
                  merchant_id: merchantId,
                  product_id: actualProductId,
                  option_group_id: insertedGroup.id,
                  name: opt.name,
                  price_modifier: opt.priceModifier,
                  color_hex: opt.colorHex || null,
                  display_order: oIdx
                }));

                await supabase.from('product_options').insert(optionsPayload);
              }
            }
          }

          const fullProduct = await this.getProductById(actualProductId, merchantId);
          if (fullProduct) {
            const all = getStoredProducts();
            setStoredProducts([fullProduct, ...all.filter((p) => p.id !== fullProduct.id)]);
            return fullProduct;
          }
        }
      } catch (err) {
        console.warn('Supabase createProduct failed, saving to local store:', err);
      }
    }

    const all = getStoredProducts();
    const updated = [newProduct, ...all.filter((p) => p.id !== newProduct.id)];
    setStoredProducts(updated);
    return newProduct;
  },

  /**
   * Update an existing product
   */
  async updateProduct(
    id: string,
    updates: Partial<Product>,
    merchantId: string = DEFAULT_MERCHANT_ID
  ): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = mapProductToDb(updates, merchantId);
        await supabase
          .from('products')
          .update(dbPayload)
          .eq('id', id)
          .eq('merchant_id', merchantId);

        // If option groups are updated, refresh option groups
        if (updates.optionGroups) {
          // Delete old groups (cascades to options)
          await supabase.from('product_option_groups').delete().eq('product_id', id);

          for (let gIdx = 0; gIdx < updates.optionGroups.length; gIdx++) {
            const group = updates.optionGroups[gIdx];
            const { data: insertedGroup } = await supabase
              .from('product_option_groups')
              .insert({
                merchant_id: merchantId,
                product_id: id,
                name: group.name,
                type: group.type,
                required: group.required,
                display_order: gIdx
              })
              .select()
              .single();

            if (insertedGroup && group.options && group.options.length > 0) {
              const optionsPayload = group.options.map((opt, oIdx) => ({
                merchant_id: merchantId,
                product_id: id,
                option_group_id: insertedGroup.id,
                name: opt.name,
                price_modifier: opt.priceModifier,
                color_hex: opt.colorHex || null,
                display_order: oIdx
              }));
              await supabase.from('product_options').insert(optionsPayload);
            }
          }
        }

        const fresh = await this.getProductById(id, merchantId);
        if (fresh) {
          const all = getStoredProducts();
          setStoredProducts(all.map((p) => (p.id === id ? fresh : p)));
          return fresh;
        }
      } catch (err) {
        console.warn('Supabase updateProduct failed, saving to local store:', err);
      }
    }

    const all = getStoredProducts();
    let updatedProduct: Product | null = null;

    const newProducts = all.map((p) => {
      if (p.id === id) {
        updatedProduct = {
          ...p,
          ...updates,
          merchantId: p.merchantId || merchantId,
          updatedAt: new Date().toISOString()
        };
        return updatedProduct;
      }
      return p;
    });

    if (!updatedProduct) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    setStoredProducts(newProducts);
    return updatedProduct;
  },

  /**
   * Toggle active/inactive status of product
   */
  async toggleProductActive(id: string, merchantId: string = DEFAULT_MERCHANT_ID): Promise<Product> {
    const all = getStoredProducts();
    const existing = all.find((p) => p.id === id);
    const nextStatus = existing ? !existing.isActive : true;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('products')
          .update({ is_active: nextStatus })
          .eq('id', id)
          .eq('merchant_id', merchantId);
      } catch (err) {
        console.warn('Supabase toggleProductActive failed:', err);
      }
    }

    return this.updateProduct(id, { isActive: nextStatus }, merchantId);
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string, merchantId: string = DEFAULT_MERCHANT_ID): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('products')
          .delete()
          .eq('id', id)
          .eq('merchant_id', merchantId);
      } catch (err) {
        console.warn('Supabase deleteProduct failed:', err);
      }
    }

    const all = getStoredProducts();
    const filtered = all.filter((p) => p.id !== id);
    setStoredProducts(filtered);
    return true;
  }
};
