import React from 'react';
import { CartItem, StoreSettings } from '../types';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';

interface CartViewProps {
  cart: CartItem[];
  settings: StoreSettings;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  onBackToShopping: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onBackToShopping
}) => {
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = cart.length > 0 ? settings.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  // Helper to format selected options for display
  const getOptionsDescription = (item: CartItem): string => {
    const descriptions: string[] = [];
    item.product.optionGroups.forEach((group) => {
      const selected = item.selectedOptions[group.id];
      if (Array.isArray(selected)) {
        const names = selected
          .map((id) => group.options.find((o) => o.id === id)?.name)
          .filter(Boolean);
        if (names.length > 0) descriptions.push(names.join(', '));
      } else if (typeof selected === 'string') {
        const opt = group.options.find((o) => o.id === selected);
        if (opt && opt.name !== 'No Rice' && opt.name !== 'None') {
          descriptions.push(opt.name);
        } else if (opt && opt.name === 'No Rice') {
          descriptions.push('No Rice');
        }
      }
    });
    return descriptions.join(', ') || 'Standard';
  };

  if (cart.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-12 text-center text-[#e0e0e2]">
        <div className="bg-[#0e0f17] rounded-3xl p-12 border border-[#1f202e] shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-[#181926] text-[#818cf8] border border-[#27273a] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-[22px] font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-[14px] text-[#9496a1] mb-6">
            Looks like you haven't added any authentic Filipino specialties yet.
          </p>
          <button
            onClick={onBackToShopping}
            className="w-full py-3.5 bg-[#4f46e5] text-white rounded-xl font-bold text-[15px] hover:bg-[#6366f1] shadow-[0_4px_16px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Menu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-28 text-[#e0e0e2]">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] sm:text-[28px] font-bold text-white">Your Cart</h1>
        <span className="bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] text-[13px] font-bold px-3.5 py-1 rounded-full">
          {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const itemDescription = getOptionsDescription(item);
            return (
              <div
                key={item.cartItemId}
                className="bg-[#0e0f17] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#1f202e] flex gap-4 sm:gap-6 items-center transition-all hover:border-[#3b3c58]"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-[#181926]">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[17px] sm:text-[18px] font-bold text-white truncate pr-2">
                      {item.product.name}
                    </h3>
                    <button
                      onClick={() => onRemoveItem(item.cartItemId)}
                      aria-label="Remove item"
                      className="text-[#6b7280] hover:text-[#f87171] transition-colors p-1.5 rounded-lg hover:bg-[#450a0a]/50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[13px] text-[#9496a1] mb-3 truncate">
                    {itemDescription}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[18px] sm:text-[20px] font-bold text-[#818cf8]">
                      {settings.currency}{item.totalPrice}
                    </span>

                    {/* Stepper */}
                    <div className="flex items-center bg-[#13141f] rounded-full border border-[#27273a] h-8 sm:h-9">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center text-[#9496a1] hover:text-white transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-[13px] font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-8 h-full flex items-center justify-center text-[#9496a1] hover:text-white transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={onBackToShopping}
            className="flex items-center gap-2 text-[#818cf8] hover:underline text-[14px] font-semibold pt-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Add more items</span>
          </button>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-1 bg-[#0e0f17] rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-[#1f202e] sticky top-24 space-y-6">
          <h3 className="text-[20px] font-bold text-white">Order Summary</h3>

          <div className="space-y-3">
            <div className="flex justify-between text-[15px] text-[#9496a1]">
              <span>Subtotal</span>
              <span className="font-semibold text-white">{settings.currency}{subtotal}</span>
            </div>
            <div className="flex justify-between text-[15px] text-[#9496a1]">
              <span>Delivery Fee</span>
              <span className="font-semibold text-white">{settings.currency}{deliveryFee}</span>
            </div>
            <div className="h-px bg-[#1f202e] w-full my-2" />
            <div className="flex justify-between items-center text-[20px] font-bold text-white">
              <span>Total</span>
              <span className="text-[#818cf8]">{settings.currency}{grandTotal}</span>
            </div>
          </div>

          <button
            onClick={onProceedToCheckout}
            className="w-full bg-[#4f46e5] text-white hover:bg-[#6366f1] transition-all duration-200 rounded-2xl h-13 flex items-center justify-center gap-2 text-[15px] font-bold shadow-[0_4px_16px_rgba(79,70,229,0.4)] active:scale-95 cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-[12px] text-[#6b7280] text-center">
            Secure checkout powered by Bayanihan Tech.
          </p>
        </div>
      </div>
    </div>
  );
};

