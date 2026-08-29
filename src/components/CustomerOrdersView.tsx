import React from 'react';
import { Order, StoreSettings } from '../types';
import { Receipt, Clock, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';

interface CustomerOrdersViewProps {
  orders: Order[];
  settings: StoreSettings;
  onSelectOrder: (order: Order) => void;
  onExploreMenu: () => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  orders,
  settings,
  onSelectOrder,
  onExploreMenu
}) => {
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-[#451a03]/70 text-[#fbbf24] px-3 py-1 rounded-full text-[12px] font-semibold border border-[#78350f]">Pending Approval</span>;
      case 'accepted':
        return <span className="bg-[#1e1e38] text-[#818cf8] px-3 py-1 rounded-full text-[12px] font-semibold border border-[#2e3048]">Order Accepted</span>;
      case 'preparing':
        return <span className="bg-[#2e1065]/70 text-[#c084fc] px-3 py-1 rounded-full text-[12px] font-semibold border border-[#581c87]">In Kitchen / Cooking</span>;
      case 'ready':
      case 'completed':
        return <span className="bg-[#064e3b]/70 text-[#34d399] px-3 py-1 rounded-full text-[12px] font-semibold border border-[#065f46]">Ready / Delivered</span>;
      case 'declined':
        return <span className="bg-[#450a0a]/70 text-[#f87171] px-3 py-1 rounded-full text-[12px] font-semibold border border-[#7f1d1d]">Declined</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-28 text-[#e0e0e2]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-white">Your Orders</h1>
          <p className="text-[14px] text-[#9496a1]">Track your ongoing and past orders</p>
        </div>
        <span className="bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] text-[13px] font-bold px-3.5 py-1 rounded-full">
          {orders.length} Total
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#0e0f17] rounded-3xl p-12 border border-[#1f202e] text-center max-w-md mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="w-16 h-16 rounded-full bg-[#181926] text-[#818cf8] border border-[#27273a] flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-[18px] font-bold text-white mb-1">No Orders Yet</h3>
          <p className="text-[14px] text-[#9496a1] mb-6">You haven't placed any orders yet. Browse the catalog to get started!</p>
          <button
            onClick={onExploreMenu}
            className="w-full py-3 bg-[#4f46e5] text-white rounded-xl text-[14px] font-bold hover:bg-[#6366f1] shadow-[0_4px_16px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Storefront</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="bg-[#0e0f17] rounded-3xl p-5 sm:p-6 border border-[#1f202e] shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-[#3b3c58] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-[18px] font-bold text-white group-hover:text-[#818cf8] transition-colors">
                      {order.orderNumber}
                    </h3>
                    <p className="text-[12px] text-[#9496a1] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{order.timeAgo || new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Items summary */}
                <div className="py-3 border-y border-[#1f202e] space-y-1.5 mb-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[13px] text-[#9496a1]">
                      <span>{item.quantity}x {item.title}</span>
                      <span className="font-semibold text-white">
                        {settings.currency}{item.totalPrice}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[12px] text-[#9496a1]">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#818cf8]" />
                  <span className="truncate">{order.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1f202e]">
                <div>
                  <span className="text-[11px] text-[#6b7280] block uppercase font-semibold">Total Amount</span>
                  <span className="text-[18px] font-bold text-[#818cf8]">
                    {settings.currency}{order.total}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[13px] font-bold text-[#818cf8] group-hover:translate-x-1 transition-transform">
                  <span>Track Live</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

