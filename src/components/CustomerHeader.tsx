import React from 'react';
import { StoreSettings, CustomerTab } from '../types';
import { Store, ShoppingBag } from 'lucide-react';

interface CustomerHeaderProps {
  settings: StoreSettings;
  cartCount: number;
  onOpenCart: () => void;
  onSwitchMode?: () => void;
  onSwitchToMerchant?: () => void;
  activeTab?: CustomerTab;
  onChangeTab?: (tab: CustomerTab) => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  settings,
  cartCount,
  onOpenCart,
  onSwitchMode,
  onSwitchToMerchant,
  activeTab,
  onChangeTab,
  title,
  showBack,
  onBack,
  rightAction
}) => {
  const handleSwitch = onSwitchToMerchant || onSwitchMode;

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 pt-safe bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#1f202e] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#9496a1] hover:text-white hover:bg-[#181926] transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        ) : (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#181926] border border-[#27273a] flex items-center justify-center shadow-inner shrink-0">
            <span className="material-symbols-outlined text-[#818cf8] text-[22px] fill">restaurant</span>
          </div>
        )}

        <div>
          <h1 className="text-[20px] md:text-[22px] font-bold text-white tracking-tight leading-none">
            {title || settings.storeName}
          </h1>
          {!title && (
            <p className="text-[11px] text-[#9496a1] hidden sm:block mt-0.5">Authentic Filipino Comfort Food</p>
          )}
        </div>
      </div>

      {/* Desktop Navigation Links */}
      {onChangeTab && (
        <div className="hidden md:flex items-center gap-1 bg-[#13141f] p-1 rounded-full border border-[#1f202e]">
          <button
            onClick={() => onChangeTab('home')}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'text-[#9496a1] hover:text-white hover:bg-[#1c1d2d]'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => onChangeTab('orders')}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'text-[#9496a1] hover:text-white hover:bg-[#1c1d2d]'
            }`}
          >
            Orders
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3">
        {rightAction ? (
          rightAction
        ) : (
          <>
            {/* Store Status Pill */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold border ${
              settings.isOpen
                ? 'bg-[#064e3b]/50 text-[#34d399] border-[#065f46]'
                : 'bg-[#27273a] text-[#a1a1aa] border-[#3f3f46]'
            }`}>
              {settings.isOpen && (
                <span className="w-2 h-2 rounded-full bg-[#34d399] mr-1.5 animate-pulse" />
              )}
              {settings.isOpen ? 'Open' : 'Closed'}
            </span>

            {/* Merchant Portal Switcher Button */}
            {handleSwitch && (
              <button
                onClick={handleSwitch}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-[#c7d2fe] bg-[#181926] hover:bg-[#202234] border border-[#2e3048] transition-colors cursor-pointer"
                title="Switch to Merchant Dashboard"
              >
                <Store className="w-3.5 h-3.5 text-[#818cf8]" />
                <span className="hidden sm:inline">Merchant View</span>
                <span className="sm:hidden text-[11px]">Merchant</span>
              </button>
            )}

            {/* Cart Icon for Desktop & Mobile */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 text-[#9496a1] hover:text-white hover:bg-[#181926] rounded-full transition-colors cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-bold text-white shadow">
                  {cartCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </header>
  );
};

