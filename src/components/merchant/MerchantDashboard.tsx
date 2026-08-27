import React from 'react';
import { Order, StoreSettings, MerchantTab } from '../../types';
import { TrendingUp, ShoppingBag, Flame, ChevronRight, PlusCircle, FolderTree, Store, Info } from 'lucide-react';

interface MerchantDashboardProps {
  orders: Order[];
  settings: StoreSettings;
  onChangeTab: (tab: MerchantTab) => void;
  onSelectOrder: (order: Order) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  orders,
  settings,
  onChangeTab,
  onSelectOrder
}) => {
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const todaySales = orders
    .filter((o) => o.status !== 'declined')
    .reduce((sum, o) => sum + o.total, 4250);

  const newOrdersCount = pendingOrders.length > 0 ? pendingOrders.length : 8;
  const preparingCount = preparingOrders.length > 0 ? preparingOrders.length : 3;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 pb-28 text-[#e0e0e2]">
      {/* Subscription Banner */}
      <div className="bg-[#1e1e38] border border-[#2e3048] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <Info className="w-6 h-6 text-[#818cf8] shrink-0" />
          <span className="text-[16px] font-bold">Trial - {settings.trialDaysLeft} Days Left</span>
        </div>
        <button
          onClick={() => onChangeTab('settings')}
          className="self-end sm:self-auto bg-[#4f46e5] text-white hover:bg-[#6366f1] px-5 py-2 rounded-xl text-[14px] font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          Upgrade Now
        </button>
      </div>

      {/* Key Metrics Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Sales Card */}
        <div className="bg-[#0e0f17] rounded-3xl p-6 shadow-md border border-[#1f202e] relative overflow-hidden group hover:border-[#2e3048] transition-all">
          <div className="absolute top-2 right-2 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[80px] text-[#818cf8]">payments</span>
          </div>
          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#9496a1] uppercase tracking-wider">Today's Sales</span>
            <span className="text-[32px] sm:text-[38px] font-bold text-white">
              {settings.currency}{todaySales.toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 text-[#34d399] font-semibold text-[13px] mt-1">
              <TrendingUp className="w-4 h-4" />
              <span>+12% vs yesterday</span>
            </div>
          </div>
        </div>

        {/* New Orders Card */}
        <div
          onClick={() => onChangeTab('orders')}
          className="bg-[#0e0f17] rounded-3xl p-6 shadow-md border border-[#1f202e] relative overflow-hidden group hover:border-[#2e3048] transition-all cursor-pointer"
        >
          <div className="absolute top-2 right-2 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[80px] text-[#818cf8]">shopping_bag</span>
          </div>
          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#9496a1] uppercase tracking-wider">New Orders</span>
            <span className="text-[32px] sm:text-[38px] font-bold text-white">
              {newOrdersCount}
            </span>
            <div className="flex items-center gap-1.5 text-[#f87171] font-semibold text-[13px] mt-1">
              <ShoppingBag className="w-4 h-4" />
              <span>Requires attention</span>
            </div>
          </div>
        </div>

        {/* Preparing Card */}
        <div
          onClick={() => onChangeTab('orders')}
          className="bg-[#0e0f17] rounded-3xl p-6 shadow-md border border-[#1f202e] relative overflow-hidden group hover:border-[#2e3048] transition-all cursor-pointer"
        >
          <div className="absolute top-2 right-2 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[80px] text-[#818cf8]">skillet</span>
          </div>
          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#9496a1] uppercase tracking-wider">Preparing</span>
            <span className="text-[32px] sm:text-[38px] font-bold text-white">
              {preparingCount}
            </span>
            <div className="flex items-center gap-1.5 text-[#fb923c] font-semibold text-[13px] mt-1">
              <Flame className="w-4 h-4" />
              <span>In kitchen</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions & Recent Orders Layout */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        {/* Recent Orders List */}
        <section className="w-full lg:flex-[2] bg-[#0e0f17] rounded-3xl shadow-md border border-[#1f202e] overflow-hidden flex flex-col">
          <div className="p-5 sm:p-6 border-b border-[#1f202e] flex justify-between items-center bg-[#13141f]">
            <h3 className="text-[18px] sm:text-[20px] font-bold text-white">Recent Orders</h3>
            <button
              onClick={() => onChangeTab('orders')}
              className="text-[#818cf8] text-[14px] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-[#1f202e]">
            {orders.slice(0, 5).map((order) => {
              const statusPill =
                order.status === 'pending' ? (
                  <span className="bg-[#fbbf24]/10 text-[#fbbf24] px-3 py-1 rounded-full text-[12px] font-bold border border-[#fbbf24]/20">
                    Pending
                  </span>
                ) : order.status === 'accepted' ? (
                  <span className="bg-[#60a5fa]/10 text-[#60a5fa] px-3 py-1 rounded-full text-[12px] font-bold border border-[#60a5fa]/20">
                    Accepted
                  </span>
                ) : order.status === 'preparing' ? (
                  <span className="bg-[#c084fc]/10 text-[#c084fc] px-3 py-1 rounded-full text-[12px] font-bold border border-[#c084fc]/20">
                    Preparing
                  </span>
                ) : (
                  <span className="bg-[#34d399]/10 text-[#34d399] px-3 py-1 rounded-full text-[12px] font-bold border border-[#34d399]/20">
                    Ready
                  </span>
                );

              const itemsSummary = order.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="p-4 sm:p-5 flex justify-between items-center hover:bg-[#13141f] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#181926] flex items-center justify-center text-[#818cf8] font-bold text-[14px] shrink-0 border border-[#2e3048]">
                      {order.orderNumber}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] sm:text-[16px] font-bold text-white truncate">
                        {order.customerName}
                      </span>
                      <span className="text-[13px] text-[#9496a1] truncate">
                        {itemsSummary} items • {settings.currency}{order.total}
                      </span>
                      <span className="text-[11px] text-[#6b7280] sm:hidden mt-0.5">
                        {order.timeAgo || 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4 shrink-0">
                    <span className="text-[12px] text-[#6b7280] hidden sm:block">
                      {order.timeAgo || 'Recent'}
                    </span>
                    {statusPill}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="w-full lg:w-[320px] flex flex-col gap-3.5 shrink-0">
          <h3 className="text-[18px] font-bold text-white mb-1 hidden lg:block">Quick Actions</h3>

          <button
            onClick={() => onChangeTab('add_product')}
            className="w-full bg-[#4f46e5] hover:bg-[#6366f1] text-white h-13 rounded-2xl text-[14px] font-bold shadow-md transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => onChangeTab('categories')}
            className="w-full bg-[#0e0f17] hover:bg-[#13141f] text-[#818cf8] h-13 rounded-2xl text-[14px] font-bold border border-[#1f202e] transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
          >
            <FolderTree className="w-5 h-5" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => onChangeTab('settings')}
            className="w-full bg-[#0e0f17] hover:bg-[#13141f] text-[#818cf8] h-13 rounded-2xl text-[14px] font-bold border border-[#1f202e] transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
          >
            <Store className="w-5 h-5" />
            <span>Store Settings</span>
          </button>
        </section>
      </div>
    </div>
  );
};

