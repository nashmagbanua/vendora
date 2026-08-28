import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { DEFAULT_MERCHANT_ID } from '../data/initialData';

export function useProducts(merchantId: string = DEFAULT_MERCHANT_ID) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts(merchantId);
      setProducts(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const saveProduct = async (productData: Product): Promise<Product> => {
    try {
      setError(null);
      const existing = products.some((p) => p.id === productData.id);
      let saved: Product;
      if (existing) {
        saved = await productService.updateProduct(productData.id, productData, merchantId);
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      } else {
        saved = await productService.createProduct(productData, merchantId);
        setProducts((prev) => [saved, ...prev]);
      }
      return saved;
    } catch (err: any) {
      setError(err?.message || 'Failed to save product');
      throw err;
    }
  };

  const toggleProductActive = async (productId: string): Promise<void> => {
    try {
      setError(null);
      const updated = await productService.toggleProductActive(productId, merchantId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updated : p))
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle product status');
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      setError(null);
      await productService.deleteProduct(productId, merchantId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      setError(err?.message || 'Failed to delete product');
    }
  };

  return {
    products,
    loading,
    error,
    saveProduct,
    toggleProductActive,
    deleteProduct,
    refreshProducts,
    setProducts
  };
}
