import React, { useState, useMemo } from 'react';
import { Product, StoreSettings } from '../types';
import { Minus, Plus, ShoppingCart, Share2, Check, ArrowLeft } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  settings: StoreSettings;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedOptions: Record<string, string | string[]>,
    calculatedTotalPrice: number
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  // Initialize selected options with defaults
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>(() => {
    const initial: Record<string, string | string[]> = {};
    product.optionGroups.forEach((group) => {
      if (group.type === 'checkbox') {
        initial[group.id] = [];
      } else {
        // default to first option if required
        if (group.options.length > 0) {
          initial[group.id] = group.options[0].id;
        }
      }
    });
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [copiedToast, setCopiedToast] = useState(false);

  // Calculate unit price based on options
  const unitPrice = useMemo(() => {
    let price = product.basePrice;
    product.optionGroups.forEach((group) => {
      const selected = selectedOptions[group.id];
      if (Array.isArray(selected)) {
        selected.forEach((optId) => {
          const opt = group.options.find((o) => o.id === optId);
          if (opt) price += opt.priceModifier;
        });
      } else if (typeof selected === 'string') {
        const opt = group.options.find((o) => o.id === selected);
        if (opt) price += opt.priceModifier;
      }
    });
    return price;
  }, [product, selectedOptions]);

  const totalPrice = unitPrice * quantity;

  const handleRadioChange = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: optionId
    }));
  };

  const handleCheckboxToggle = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const currentList = (prev[groupId] as string[]) || [];
      const exists = currentList.includes(optionId);
      const updated = exists
        ? currentList.filter((id) => id !== optionId)
        : [...currentList, optionId];
      return {
        ...prev,
        [groupId]: updated
      };
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedOptions, totalPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e0f17] text-[#e0e0e2] w-full max-w-2xl md:rounded-3xl min-h-screen md:min-h-0 md:max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.9)] border border-[#27273a] flex flex-col relative">
        {/* Top Header */}
        <div className="sticky top-0 z-20 bg-[#0e0f17]/95 backdrop-blur-md px-4 py-3 border-b border-[#1f202e] flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#181926] border border-[#27273a] flex items-center justify-center text-[#e0e0e2] hover:text-white hover:bg-[#202234] transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[17px] font-bold text-white truncate px-3">
            {product.category === 'Clothing' ? 'Details' : settings.storeName}
          </span>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-[#181926] border border-[#27273a] flex items-center justify-center text-[#9496a1] hover:text-white hover:bg-[#202234] transition-colors cursor-pointer"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {copiedToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] text-[12px] font-semibold px-4 py-2 rounded-full shadow-lg">
            Link copied to clipboard!
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto pb-32">
          {/* Hero Image */}
          <div className="relative w-full aspect-square md:aspect-[16/9] md:max-h-[360px] overflow-hidden bg-[#181926]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f17] via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Header Info */}
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-[24px] sm:text-[28px] font-bold text-white leading-tight">
                  {product.name}
                </h1>
                <span className="text-[22px] sm:text-[26px] font-bold text-[#818cf8] shrink-0">
                  {settings.currency}{product.basePrice}
                </span>
              </div>
              <p className="text-[15px] text-[#9496a1] leading-relaxed">
                {product.description}
              </p>
            </div>

            <hr className="border-t border-[#1f202e]" />

            {/* Customization Groups */}
            {product.optionGroups.map((group) => {
              if (group.type === 'pills') {
                const currentSelected = selectedOptions[group.id] as string;
                return (
                  <section key={group.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[17px] font-bold text-white">{group.name}</h3>
                      {group.required && (
                        <span className="text-[11px] font-semibold text-[#f87171] bg-[#450a0a]/60 border border-[#7f1d1d] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Required
                        </span>
                      )}
                    </div>
                    <div className={`grid gap-2.5 ${group.options.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                      {group.options.map((opt) => {
                        const isChecked = currentSelected === opt.id;
                        return (
                          <label key={opt.id} className="cursor-pointer">
                            <input
                              type="radio"
                              name={group.id}
                              checked={isChecked}
                              onChange={() => handleRadioChange(group.id, opt.id)}
                              className="sr-only"
                            />
                            <div
                              className={`text-center py-3 px-2 rounded-xl text-[14px] transition-all font-semibold border ${
                                isChecked
                                  ? 'bg-[#4f46e5] text-white border-[#6366f1] shadow-[0_4px_16px_rgba(79,70,229,0.4)] scale-[1.02]'
                                  : 'bg-[#13141f] text-[#9496a1] border-[#27273a] hover:border-[#818cf8] hover:text-white'
                              }`}
                            >
                              {opt.name}
                              {opt.priceModifier > 0 && (
                                <span className="block text-[11px] opacity-80 mt-0.5">
                                  +{settings.currency}{opt.priceModifier}
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                );
              }

              if (group.type === 'radio') {
                const currentSelected = selectedOptions[group.id] as string;
                return (
                  <section key={group.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[17px] font-bold text-white">{group.name}</h3>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                        group.required
                          ? 'text-[#f87171] bg-[#450a0a]/60 border-[#7f1d1d]'
                          : 'text-[#9496a1] bg-[#181926] border-[#27273a]'
                      }`}>
                        {group.required ? 'Required' : 'Optional'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {group.options.map((opt) => {
                        const isChecked = currentSelected === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`relative flex items-center p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'border-[#6366f1] bg-[#1e1e38] text-white ring-1 ring-[#6366f1]'
                                : 'border-[#27273a] bg-[#13141f] text-[#9496a1] hover:border-[#3b3c58] hover:text-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name={group.id}
                              checked={isChecked}
                              onChange={() => handleRadioChange(group.id, opt.id)}
                              className="sr-only"
                            />
                            {opt.colorHex ? (
                              <div
                                className="w-5 h-5 rounded-full mr-3 shrink-0 border border-[#3b3c58] shadow-xs"
                                style={{ backgroundColor: opt.colorHex }}
                              />
                            ) : (
                              <div
                                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                                  isChecked ? 'border-[#818cf8]' : 'border-[#6b7280]'
                                }`}
                              >
                                {isChecked && <div className="w-2.5 h-2.5 rounded-full bg-[#818cf8]" />}
                              </div>
                            )}
                            <span className="text-[15px] font-medium text-white flex-1">
                              {opt.name}
                            </span>
                            <span className="text-[14px] text-[#818cf8] font-semibold">
                              {opt.priceModifier > 0 ? `+${settings.currency}${opt.priceModifier}` : '+₱0'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                );
              }

              // Checkbox group
              const currentList = (selectedOptions[group.id] as string[]) || [];
              return (
                <section key={group.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[17px] font-bold text-white">{group.name}</h3>
                    <span className="text-[11px] font-semibold text-[#9496a1] bg-[#181926] border border-[#27273a] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Optional
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {group.options.map((opt) => {
                      const isChecked = currentList.includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className={`relative flex items-center p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-[#6366f1] bg-[#1e1e38] text-white ring-1 ring-[#6366f1]'
                              : 'border-[#27273a] bg-[#13141f] text-[#9496a1] hover:border-[#3b3c58] hover:text-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxToggle(group.id, opt.id)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center transition-colors ${
                              isChecked ? 'bg-[#4f46e5] border-[#6366f1]' : 'border-[#6b7280] bg-[#0e0f17]'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="text-[15px] font-medium text-white flex-1">
                            {opt.name}
                          </span>
                          <span className="text-[14px] text-[#818cf8] font-semibold">
                            +{settings.currency}{opt.priceModifier}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed md:sticky bottom-0 left-0 w-full bg-[#0e0f17] border-t border-[#1f202e] p-4 pb-safe z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-[#13141f] rounded-full border border-[#27273a] h-12 w-32 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-full flex items-center justify-center text-[#9496a1] hover:text-white transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-bold text-[16px] text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-full flex items-center justify-center text-[#9496a1] hover:text-white transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 bg-[#4f46e5] hover:bg-[#6366f1] text-white h-12 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(79,70,229,0.4)] active:scale-95 text-[15px] font-bold cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[13px] ml-1">
                {settings.currency}{totalPrice}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

