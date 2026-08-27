import React, { useState } from 'react';
import { Product, StoreSettings } from '../../types';
import { Search, Plus, SlidersHorizontal, FolderTree, Edit3, Trash2 } from 'lucide-react';

interface MerchantProductsProps {
  products: Product[];
  settings: StoreSettings;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onToggleProductActive: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenCategories: () => void;
}

export const MerchantProducts: React.FC<MerchantProductsProps> = ({
  products,
  settings,
  onAddProduct,
  onEditProduct,
  onToggleProductActive,
  onDeleteProduct,
  onOpenCategories
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory ? p.category === filterCategory || p.tag === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-32 text-[#e0e0e2]">
      {/* Header & Actions */}
      <div className="bg-[#0e0f17] rounded-3xl p-5 sm:p-6 border border-[#1f202e] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-white">Products</h1>
          <p className="text-[14px] text-[#9496a1]">Manage your inventory, pricing, and variant options.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenCategories}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#13141f] border border-[#1f202e] text-[#818cf8] rounded-xl hover:bg-[#181926] transition-colors text-[13px] font-bold cursor-pointer"
          >
            <FolderTree className="w-4 h-4 text-[#818cf8]" />
            <span>Categories</span>
          </button>
          <button
            onClick={onAddProduct}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4f46e5] text-white rounded-xl hover:bg-[#6366f1] transition-all shadow-md text-[13px] font-bold active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0e0f17] rounded-3xl p-4 sm:p-5 border border-[#1f202e] shadow-md flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9496a1]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#13141f] rounded-xl border border-[#1f202e] text-[14px] text-white placeholder-[#9496a1] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setFilterCategory(null)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors cursor-pointer ${
              filterCategory === null
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'border border-[#1f202e] bg-[#13141f] text-[#9496a1] hover:bg-[#181926] hover:text-white'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilterCategory('Lutong Ulam')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
              filterCategory === 'Lutong Ulam'
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'border border-[#1f202e] bg-[#13141f] text-[#9496a1] hover:bg-[#181926] hover:text-white'
            }`}
          >
            Hot Meals
          </button>
          <button
            onClick={() => setFilterCategory('Clothing')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
              filterCategory === 'Clothing'
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'border border-[#1f202e] bg-[#13141f] text-[#9496a1] hover:bg-[#181926] hover:text-white'
            }`}
          >
            Apparel
          </button>
          <button
            onClick={() => setFilterCategory('Meryenda')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
              filterCategory === 'Meryenda'
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'border border-[#1f202e] bg-[#13141f] text-[#9496a1] hover:bg-[#181926] hover:text-white'
            }`}
          >
            Meryenda
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-[#0e0f17] rounded-3xl border border-[#1f202e] shadow-md overflow-hidden hover:border-[#2e3048] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Product Image */}
              <div className="relative aspect-square w-full bg-[#181926] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#065f46] text-[#34d399] border border-[#34d399]/30 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  {product.tag || product.category}
                </div>

                {/* Edit & Delete Action overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-2 bg-[#0e0f17]/90 backdrop-blur-xs text-[#818cf8] rounded-xl hover:bg-[#181926] shadow-md transition-all cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="p-2 bg-[#0e0f17]/90 backdrop-blur-xs text-[#f87171] rounded-xl hover:bg-[#181926] shadow-md transition-all cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 sm:p-6">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-[18px] sm:text-[20px] font-bold text-white">
                    {product.name}
                  </h3>
                  <span className="text-[18px] sm:text-[20px] font-bold text-[#818cf8] shrink-0">
                    {settings.currency}{product.basePrice}
                  </span>
                </div>
                <p className="text-[13px] text-[#9496a1] line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-5 sm:p-6 pt-0 border-t border-[#1f202e] mt-2 flex items-center justify-between">
              {/* Active Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.isActive}
                  onChange={() => onToggleProductActive(product.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#27273a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f46e5]" />
                <span className={`ml-3 text-[13px] font-bold ${product.isActive ? 'text-white' : 'text-[#6b7280]'}`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>

              {/* Options Pill */}
              <button
                onClick={() => onEditProduct(product)}
                className="cursor-pointer"
              >
                {product.optionGroups && product.optionGroups.length > 0 ? (
                  <span className="inline-flex items-center text-[#fb923c] text-[11px] font-bold gap-1 bg-[#fb923c]/10 border border-[#fb923c]/20 px-2.5 py-1 rounded-md hover:bg-[#fb923c]/20 transition-colors">
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>
                      Options ({product.optionGroups.map((g) => g.name).join(', ')})
                    </span>
                  </span>
                ) : (
                  <span className="text-[12px] text-[#6b7280] font-semibold">
                    No Options
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button on Mobile */}
      <button
        onClick={onAddProduct}
        className="md:hidden fixed bottom-[90px] right-6 w-14 h-14 bg-[#4f46e5] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-[#6366f1] active:scale-95 transition-all z-40 cursor-pointer"
        aria-label="Add Product"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};

