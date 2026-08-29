import React from 'react';
import { MerchantTab, StoreSettings, User } from '../../types';
import { LayoutDashboard, Receipt, Package, Settings, Users, FolderTree, ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';

interface MerchantSidebarProps {
  activeTab: MerchantTab;
  onChangeTab: (tab: MerchantTab) => void;
  settings: StoreSettings;
  onToggleStoreStatus: () => void;
  onSwitchToCustomer: () => void;
  pendingOrdersCount: number;
  user?: User | null;
  role?: 'owner' | 'admin' | 'staff' | null;
  onSignOut?: () => void;
}

export const MerchantSidebar: React.FC<MerchantSidebarProps> = ({
  activeTab,
  onChangeTab,
  settings,
  onToggleStoreStatus,
  onSwitchToCustomer,
  pendingOrdersCount,
  user,
  role,
  onSignOut
}) => {
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[280px] z-40 bg-[#0a0a0f] border-r border-[#1f202e] text-[#e0e0e2] select-none">
      {/* Profile Header */}
      <div className="p-6 border-b border-[#1f202e]">
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#181926] border border-[#27273a] flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[#818cf8] text-[24px] fill">restaurant</span>
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-[17px] font-bold text-white truncate">
              {settings.storeName}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-semibold text-[#fb923c] uppercase tracking-wider">
                {role || 'owner'}
              </span>
            </div>
            {user?.email && (
              <span className="text-[11px] text-[#6b7280] truncate mt-0.5">
                {user.email}
              </span>
            )}
          </div>
        </div>

        {/* Store Status Toggle */}
        <div className="mt-3 flex items-center justify-between bg-[#13141f] rounded-xl p-2.5 border border-[#1f202e] shadow-xs">
          <span className="text-[13px] font-semibold text-[#e0e0e2]">Store Status</span>
          <button
            onClick={onToggleStoreStatus}
            className={`px-3 py-1 rounded-full text-[12px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              settings.isOpen
                ? 'bg-[#4f46e5] text-white hover:bg-[#6366f1]'
                : 'bg-[#27273a] text-[#9496a1] hover:bg-[#323348]'
            }`}
          >
            <span>{settings.isOpen ? 'Open' : 'Closed'}</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <button
          onClick={() => onChangeTab('home')}
          className={`w-full flex items-center gap-3.5 rounded-xl px-4 py-3 text-[14px] font-semibold transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_2px_8px_rgba(99,102,241,0.2)] font-bold translate-x-1'
              : 'text-[#9496a1] hover:bg-[#13141f] hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onChangeTab('orders')}
          className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-[14px] font-semibold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_2px_8px_rgba(99,102,241,0.2)] font-bold translate-x-1'
              : 'text-[#9496a1] hover:bg-[#13141f] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <Receipt className="w-5 h-5" />
            <span>Orders</span>
          </div>
          {pendingOrdersCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'orders' ? 'bg-[#818cf8] text-[#050507]' : 'bg-[#f87171] text-white'
            }`}>
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onChangeTab('products')}
          className={`w-full flex items-center gap-3.5 rounded-xl px-4 py-3 text-[14px] font-semibold transition-all cursor-pointer ${
            activeTab === 'products' || activeTab === 'add_product'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_2px_8px_rgba(99,102,241,0.2)] font-bold translate-x-1'
              : 'text-[#9496a1] hover:bg-[#13141f] hover:text-white'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Products</span>
        </button>

        <button
          onClick={() => onChangeTab('categories')}
          className={`w-full flex items-center gap-3.5 rounded-xl px-4 py-3 text-[14px] font-semibold transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_2px_8px_rgba(99,102,241,0.2)] font-bold translate-x-1'
              : 'text-[#9496a1] hover:bg-[#13141f] hover:text-white'
          }`}
        >
          <FolderTree className="w-5 h-5" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => onChangeTab('customers')}
          className={`w-full flex items-center gap-3.5 rounded-xl px-4 py-3 text-[14px] font-semibold transition-all cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_2px_8px_rgba(99,102,241,0.2)] font-bold translate-x-1'
              : 'text-[#9496a1] hover:bg-[#13141f] hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Customers</span>
        </button>

        <button
          onClick={() => onChangeTab('settings')}
          className={`w-full flex items-center gap-3.5 rounded-xl px-4 py-3 text-[14px] font-semibold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] shadow-[0_2px_8px_rgba(99,102,241,0.2)] font-bold translate-x-1'
              : 'text-[#9496a1] hover:bg-[#13141f] hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Store Settings</span>
        </button>
      </div>

      {/* Bottom Actions: View Storefront & Sign Out */}
      <div className="p-4 border-t border-[#1f202e] space-y-2">
        <button
          onClick={onSwitchToCustomer}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#13141f] border border-[#1f202e] text-[#818cf8] hover:bg-[#181926] text-[13px] font-bold shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>View Customer Storefront</span>
        </button>

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-transparent hover:bg-[#1f1619] border border-transparent hover:border-[#3b1a1f] text-[#9496a1] hover:text-[#f87171] text-[12px] font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};

