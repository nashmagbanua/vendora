import React from 'react';
import { CustomerTab } from '../types';

interface CustomerBottomNavProps {
  activeTab: CustomerTab;
  onChangeTab: (tab: CustomerTab) => void;
  cartCount: number;
}

export const CustomerBottomNav: React.FC<CustomerBottomNavProps> = ({
  activeTab,
  onChangeTab,
  cartCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 pb-safe h-20 bg-[#0a0a0f]/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.7)] border-t border-[#1f202e] md:hidden">
      {/* Home */}
      <button
        onClick={() => onChangeTab('home')}
        className="flex flex-col items-center justify-center transition-colors group cursor-pointer"
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full px-5 py-1 mb-1 transition-transform duration-150 ${
            activeTab === 'home'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_2px_8px_rgba(99,102,241,0.2)]'
              : 'text-[#9496a1] group-hover:text-white'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${activeTab === 'home' ? 'fill' : ''}`}
            style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
          >
            home
          </span>
        </div>
        <span
          className={`text-[12px] font-semibold ${
            activeTab === 'home' ? 'text-[#818cf8]' : 'text-[#9496a1]'
          }`}
        >
          Home
        </span>
      </button>

      {/* Search */}
      <button
        onClick={() => onChangeTab('search')}
        className="flex flex-col items-center justify-center transition-colors group cursor-pointer"
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full px-5 py-1 mb-1 transition-transform duration-150 ${
            activeTab === 'search'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_2px_8px_rgba(99,102,241,0.2)]'
              : 'text-[#9496a1] group-hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">search</span>
        </div>
        <span
          className={`text-[12px] font-semibold ${
            activeTab === 'search' ? 'text-[#818cf8]' : 'text-[#9496a1]'
          }`}
        >
          Search
        </span>
      </button>

      {/* Cart */}
      <button
        onClick={() => onChangeTab('cart')}
        className="flex flex-col items-center justify-center transition-colors group relative cursor-pointer"
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full px-5 py-1 mb-1 transition-transform duration-150 relative ${
            activeTab === 'cart'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_2px_8px_rgba(99,102,241,0.2)]'
              : 'text-[#9496a1] group-hover:text-white'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${activeTab === 'cart' ? 'fill' : ''}`}
            style={{ fontVariationSettings: activeTab === 'cart' ? "'FILL' 1" : "'FILL' 0" }}
          >
            shopping_cart
          </span>
          {cartCount > 0 && (
            <span className="absolute top-0 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#f87171] text-[10px] font-bold text-white shadow-xs">
              {cartCount}
            </span>
          )}
        </div>
        <span
          className={`text-[12px] font-semibold ${
            activeTab === 'cart' ? 'text-[#818cf8]' : 'text-[#9496a1]'
          }`}
        >
          Cart
        </span>
      </button>

      {/* Orders */}
      <button
        onClick={() => onChangeTab('orders')}
        className="flex flex-col items-center justify-center transition-colors group cursor-pointer"
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full px-5 py-1 mb-1 transition-transform duration-150 ${
            activeTab === 'orders'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_2px_8px_rgba(99,102,241,0.2)]'
              : 'text-[#9496a1] group-hover:text-white'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${activeTab === 'orders' ? 'fill' : ''}`}
            style={{ fontVariationSettings: activeTab === 'orders' ? "'FILL' 1" : "'FILL' 0" }}
          >
            receipt_long
          </span>
        </div>
        <span
          className={`text-[12px] font-semibold ${
            activeTab === 'orders' ? 'text-[#818cf8]' : 'text-[#9496a1]'
          }`}
        >
          Orders
        </span>
      </button>
    </nav>
  );
};

