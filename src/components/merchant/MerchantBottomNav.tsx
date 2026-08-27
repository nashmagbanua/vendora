import React from 'react';
import { MerchantTab } from '../../types';

interface MerchantBottomNavProps {
  activeTab: MerchantTab;
  onChangeTab: (tab: MerchantTab) => void;
  pendingOrdersCount: number;
}

export const MerchantBottomNav: React.FC<MerchantBottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingOrdersCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-1 pb-safe h-20 bg-[#0a0a0f] rounded-t-2xl shadow-[0_-4px_24px_0_rgba(0,0,0,0.8)] border-t border-[#1f202e] lg:hidden">
      {/* Home / Dashboard */}
      <button
        onClick={() => onChangeTab('home')}
        className="flex flex-col items-center justify-center transition-colors group cursor-pointer"
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 mb-1 transition-all duration-150 ${
            activeTab === 'home'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_0_12px_rgba(99,102,241,0.25)]'
              : 'text-[#9496a1] group-hover:text-white'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${activeTab === 'home' ? 'fill' : ''}`}
            style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
          >
            dashboard
          </span>
        </div>
        <span
          className={`text-[11px] font-semibold ${
            activeTab === 'home' ? 'text-[#818cf8]' : 'text-[#9496a1]'
          }`}
        >
          Home
        </span>
      </button>

      {/* Orders */}
      <button
        onClick={() => onChangeTab('orders')}
        className="flex flex-col items-center justify-center transition-colors group relative cursor-pointer"
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 mb-1 transition-all duration-150 relative ${
            activeTab === 'orders'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_0_12px_rgba(99,102,241,0.25)]'
              : 'text-[#9496a1] group-hover:text-white'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${activeTab === 'orders' ? 'fill' : ''}`}
            style={{ fontVariationSettings: activeTab === 'orders' ? "'FILL' 1" : "'FILL' 0" }}
          >
            receipt_long
          </span>
          {pendingOrdersCount > 0 && (
            <span className="absolute top-0 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f87171] text-[10px] font-bold text-[#050507] shadow-xs">
              {pendingOrdersCount}
            </span>
          )}
        </div>
        <span
          className={`text-[11px] font-semibold ${
            activeTab === 'orders' ? 'text-[#818cf8]' : 'text-[#9496a1]'
          }`}
        >
          Orders
        </span>
      </button>

      {/* Products */}
      <button
        onClick={() => onChangeTab('products')}
        className="flex flex-col items-center justify-center transition-colors group cursor-pointer"
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 mb-1 transition-all duration-150 ${
            activeTab === 'products' || activeTab === 'add_product'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_0_12px_rgba(99,102,241,0.25)]'
              : 'text-[#9496a1] group-hover:text-white'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${activeTab === 'products' ? 'fill' : ''}`}
            style={{ fontVariationSettings: activeTab === 'products' ? "'FILL' 1" : "'FILL' 0" }}
          >
            inventory_2
          </span>
        </div>
        <span
          className={`text-[11px] font-semibold ${
            activeTab === 'products' || activeTab === 'add_product' ? 'text-[#818cf8]' : 'text-[#9496a1]'
          }`}
        >
          Products
        </span>
      </button>

      {/* Customers */}
      <button
        onClick={() => onChangeTab('customers')}
        className="flex flex-col items-center justify-center transition-colors group cursor-pointer"
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 mb-1 transition-all duration-150 ${
            activeTab === 'customers'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_0_12px_rgba(99,102,241,0.25)]'
              : 'text-[#9496a1] group-hover:text-white'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${activeTab === 'customers' ? 'fill' : ''}`}
            style={{ fontVariationSettings: activeTab === 'customers' ? "'FILL' 1" : "'FILL' 0" }}
          >
            group
          </span>
        </div>
        <span
          className={`text-[11px] font-semibold ${
            activeTab === 'customers' ? 'text-[#818cf8]' : 'text-[#9496a1]'
          }`}
        >
          Customers
        </span>
      </button>

      {/* Settings */}
      <button
        onClick={() => onChangeTab('settings')}
        className="flex flex-col items-center justify-center transition-colors group cursor-pointer"
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 mb-1 transition-all duration-150 ${
            activeTab === 'settings'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_0_12px_rgba(99,102,241,0.25)]'
              : 'text-[#9496a1] group-hover:text-white'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${activeTab === 'settings' ? 'fill' : ''}`}
            style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}
          >
            settings
          </span>
        </div>
        <span
          className={`text-[11px] font-semibold ${
            activeTab === 'settings' ? 'text-[#818cf8]' : 'text-[#9496a1]'
          }`}
        >
          Settings
        </span>
      </button>
    </nav>
  );
};

