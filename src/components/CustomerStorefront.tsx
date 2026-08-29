import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product, Category, StoreSettings } from '../types';
import { ShoppingCart, Plus, Search, Sparkles, Utensils, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerStorefrontProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({
  products,
  categories,
  settings,
  onSelectProduct,
  onQuickAddToCart
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic suggestions built directly from merchant store data
  const suggestions = useMemo(() => {
    const list: string[] = [];
    const activeProducts = products.filter((p) => p.isActive);
    const featured = activeProducts.filter((p) => p.isFeatured);

    if (featured.length > 0) {
      featured.slice(0, 3).forEach((p) => list.push(`Search "${p.name}" in ${settings.store_name || 'store'}...`));
    } else if (activeProducts.length > 0) {
      activeProducts.slice(0, 3).forEach((p) => list.push(`Search "${p.name}"...`));
    }

    if (categories.length > 0) {
      categories.slice(0, 3).forEach((c) => list.push(`Craving ${c.name}? Find it here...`));
    }

    if (settings.store_name) {
      list.push(`Explore ${settings.store_name}'s full menu...`);
    } else {
      list.push('Search for food, drinks, or items...');
    }

    return list.length > 0 ? list : ['Search for food, drinks, or items...'];
  }, [products, categories, settings.store_name]);

  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  // Cycle suggestions with smooth animation
  useEffect(() => {
    if (suggestions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [suggestions]);

  // Quick suggestion chips based on store items
  const quickChips = useMemo(() => {
    const chips: string[] = [];
    products
      .filter((p) => p.isActive && p.isFeatured)
      .slice(0, 3)
      .forEach((p) => chips.push(p.name));

    if (chips.length < 3) {
      categories.slice(0, 3 - chips.length).forEach((c) => chips.push(c.name));
    }

    if (chips.length === 0 && products.length > 0) {
      const activeFirst = products.find((p) => p.isActive);
      if (activeFirst) chips.push(activeFirst.name);
    }
    return chips;
  }, [products, categories]);

  const featuredProduct = products.find((p) => p.isFeatured && p.isActive) || products[0];

  const filteredProducts = products.filter((product) => {
    if (!product.isActive) return false;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-4 md:px-8 pt-4 pb-12 text-[#e0e0e2]">
      {/* Search Bar with Dynamic Animated Suggestions */}
      <section className="relative group space-y-2.5">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6b7280] group-focus-within:text-[#818cf8] transition-colors z-10">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl bg-[#0e0f17] border border-[#27273a] text-[15px] text-[#e0e0e2] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-[#3b3c58] relative z-1"
          />

          {/* Animated Suggestion Placeholder */}
          {!searchQuery && (
            <div
              onClick={() => inputRef.current?.focus()}
              className="absolute inset-y-0 left-12 right-10 flex items-center overflow-hidden pointer-events-none z-1"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentSuggestionIndex}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="text-[14px] sm:text-[15px] text-[#6b7280] font-normal truncate"
                >
                  {suggestions[currentSuggestionIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#6b7280] hover:text-white cursor-pointer z-10"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips based on Store Items */}
        {quickChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 overflow-x-auto hide-scrollbar text-[12px] text-[#9496a1] pt-0.5"
          >
            <span className="flex items-center gap-1 shrink-0 text-[#818cf8] font-semibold text-[11px] uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              Try:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSearchQuery(chip)}
                  className="px-2.5 py-1 rounded-lg bg-[#13141f] hover:bg-[#1f202e] border border-[#27273a] hover:border-[#6366f1]/60 text-[#9496a1] hover:text-white text-[12px] font-medium transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <span>{chip}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* Categories (Horizontal Scroll) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[20px] font-bold text-white">Categories</h2>
          {selectedCategory ? (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[#818cf8] text-[14px] font-semibold hover:underline cursor-pointer"
            >
              Show All
            </button>
          ) : (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[#818cf8] text-[14px] font-semibold hover:underline cursor-pointer"
            >
              View All
            </button>
          )}
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-3 sm:gap-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[84px] group cursor-pointer"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs group-hover:-translate-y-1 ${
              selectedCategory === null
                ? 'bg-[#4f46e5] text-white border-2 border-[#6366f1] shadow-[0_4px_16px_rgba(79,70,229,0.4)]'
                : 'bg-[#0e0f17] border border-[#27273a] text-[#9496a1] group-hover:border-[#818cf8] group-hover:text-white'
            }`}>
              <Sparkles className="w-7 h-7" />
            </div>
            <span className={`text-[13px] font-semibold text-center w-full truncate ${
              selectedCategory === null ? 'text-[#818cf8]' : 'text-[#9496a1]'
            }`}>
              All Items
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[84px] group cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-2xl bg-[#0e0f17] shadow-xs border overflow-hidden flex items-center justify-center group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 ${
                  isSelected ? 'border-2 border-[#6366f1] ring-2 ring-[#6366f1]/30' : 'border-[#27273a] group-hover:border-[#818cf8]'
                }`}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className={`text-[13px] font-semibold text-center w-full truncate transition-colors ${
                  isSelected ? 'text-[#818cf8]' : 'text-[#9496a1] group-hover:text-white'
                }`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Signature Dish (Only show if not filtering or if category matches) */}
      {featuredProduct && (!selectedCategory || featuredProduct.category === selectedCategory) && !searchQuery && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[20px] font-bold text-white">Featured Signature Dish</h2>
          </div>
          <div
            onClick={() => onSelectProduct(featuredProduct)}
            className="relative bg-[#0e0f17] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-[#1f202e] group cursor-pointer hover:border-[#3b3c58] hover:shadow-[0_12px_40px_rgba(0,0,0,0.8)] transition-all duration-300 flex flex-col md:flex-row"
          >
            <div className="relative h-64 md:h-auto md:w-1/2 overflow-hidden bg-[#181926]">
              <img
                src={featuredProduct.image}
                alt={featuredProduct.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f17] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-[#064e3b]/80 backdrop-blur-xs text-[#34d399] border border-[#065f46] px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Best Seller
                </span>
              </div>
            </div>
            <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="text-[22px] md:text-[24px] font-bold text-white group-hover:text-[#818cf8] transition-colors leading-tight">
                  {featuredProduct.name}
                </h3>
                <span className="text-[22px] font-bold text-[#818cf8] shrink-0">
                  {settings.currency}{featuredProduct.basePrice}
                </span>
              </div>
              <p className="text-[14px] text-[#9496a1] mb-6 line-clamp-3 leading-relaxed">
                {featuredProduct.description}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProduct(featuredProduct);
                }}
                className="w-full py-3.5 bg-[#4f46e5] text-white rounded-xl text-[14px] font-semibold shadow-[0_4px_16px_rgba(79,70,229,0.4)] hover:bg-[#6366f1] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Order</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold text-white">
            {selectedCategory ? `${selectedCategory} (${filteredProducts.length})` : 'Popular Items'}
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-[#0e0f17] rounded-2xl border border-dashed border-[#27273a] p-12 text-center">
            <Utensils className="w-12 h-12 text-[#6b7280] mx-auto mb-3 opacity-50" />
            <h3 className="text-[16px] font-semibold text-white">No items found</h3>
            <p className="text-[14px] text-[#9496a1] mt-1">Try clearing your search query or selecting a different category.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#181926] text-[#818cf8] border border-[#2e3048] font-semibold text-[13px] hover:bg-[#202234] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="bg-[#0e0f17] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#1f202e] shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-[#3b3c58] hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)] transition-all duration-300 group flex flex-col cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden bg-[#181926]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  {product.tag && (
                    <span className="absolute top-2.5 left-2.5 bg-[#064e3b]/80 backdrop-blur-xs text-[#34d399] border border-[#065f46] px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      {product.tag}
                    </span>
                  )}
                </div>
                <div className="p-3.5 sm:p-5 flex-grow flex flex-col">
                  <h4 className="text-[15px] sm:text-[17px] font-semibold text-white group-hover:text-[#818cf8] transition-colors line-clamp-1 mb-1">
                    {product.name}
                  </h4>
                  <p className="text-[12px] sm:text-[13px] text-[#9496a1] line-clamp-2 mb-3 flex-grow leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#1f202e]">
                    <span className="text-[16px] sm:text-[19px] font-bold text-[#818cf8]">
                      {settings.currency}{product.basePrice}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add ${product.name} to cart`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // If product has options, open modal so user can pick; else quick add
                        if (product.optionGroups && product.optionGroups.length > 0) {
                          onSelectProduct(product);
                        } else {
                          onQuickAddToCart(product);
                        }
                      }}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#181926] text-[#818cf8] border border-[#2e3048] flex items-center justify-center hover:bg-[#4f46e5] hover:text-white transition-all active:scale-90 shrink-0 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

