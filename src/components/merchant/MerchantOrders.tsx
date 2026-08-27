import React, { useState } from 'react';
import { Order, StoreSettings } from '../../types';
import { Search, Clock, MapPin, Phone, Check, X, Flame, Truck, ChevronRight, CheckCircle2 } from 'lucide-react';

interface MerchantOrdersProps {
  orders: Order[];
  settings: StoreSettings;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onViewOrderDetail: (order: Order) => void;
}

export const MerchantOrders: React.FC<MerchantOrdersProps> = ({
  orders,
  settings,
  onUpdateOrderStatus,
  onViewOrderDetail
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      activeFilter === 'all' ? true : order.status === activeFilter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-[#fbbf24]/10 text-[#fbbf24] px-3 py-1 rounded-full text-[12px] font-bold border border-[#fbbf24]/20">Pending</span>;
      case 'accepted':
        return <span className="bg-[#60a5fa]/10 text-[#60a5fa] px-3 py-1 rounded-full text-[12px] font-bold border border-[#60a5fa]/20">Accepted</span>;
      case 'preparing':
        return <span className="bg-[#c084fc]/10 text-[#c084fc] px-3 py-1 rounded-full text-[12px] font-bold border border-[#c084fc]/20">Preparing</span>;
      case 'ready':
      case 'completed':
        return <span className="bg-[#34d399]/10 text-[#34d399] px-3 py-1 rounded-full text-[12px] font-bold border border-[#34d399]/20">Ready</span>;
      case 'declined':
        return <span className="bg-[#f87171]/10 text-[#f87171] px-3 py-1 rounded-full text-[12px] font-bold border border-[#f87171]/20">Declined</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-32 text-[#e0e0e2]">
      {/* Header */}
      <div className="bg-[#0e0f17] rounded-3xl p-5 sm:p-6 border border-[#1f202e] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-white">Live Orders</h1>
          <p className="text-[14px] text-[#9496a1]">Manage incoming customer orders, kitchen prep, and fulfillment.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9496a1]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#13141f] rounded-xl border border-[#1f202e] text-[14px] text-white placeholder-[#9496a1] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'pending', label: 'Pending' },
          { id: 'accepted', label: 'Accepted' },
          { id: 'preparing', label: 'Preparing' },
          { id: 'ready', label: 'Ready' },
          { id: 'declined', label: 'Declined' }
        ].map((tab) => {
          const count = getStatusCount(tab.id);
          const isSelected = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#4f46e5] text-white shadow-md'
                  : 'bg-[#13141f] border border-[#1f202e] text-[#9496a1] hover:bg-[#181926] hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#181926] text-[#818cf8]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#0e0f17] rounded-3xl p-12 text-center border border-[#1f202e] shadow-md">
          <p className="text-[16px] font-bold text-white mb-1">No orders found in this status</p>
          <p className="text-[13px] text-[#9496a1]">New orders placed by customers will show up here instantly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const totalItemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-[#0e0f17] rounded-3xl border border-[#1f202e] shadow-md hover:border-[#2e3048] transition-all p-5 sm:p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-bold text-white">{order.orderNumber}</span>
                        <span className="text-[11px] uppercase font-bold bg-[#181926] text-[#818cf8] border border-[#2e3048] px-2 py-0.5 rounded-md">
                          {order.fulfillment}
                        </span>
                      </div>
                      <p className="text-[15px] font-semibold text-white mt-0.5">{order.customerName}</p>
                      <p className="text-[12px] text-[#6b7280] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{order.timeAgo || new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Order Items List */}
                  <div className="bg-[#13141f] rounded-2xl p-3.5 my-3 border border-[#1f202e] space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[13px]">
                        <span className="font-semibold text-white">
                          {item.quantity}x {item.title}
                          {item.optionsDescription && (
                            <span className="block text-[11px] font-normal text-[#9496a1]">
                              {item.optionsDescription}
                            </span>
                          )}
                        </span>
                        <span className="font-bold text-white shrink-0 ml-2">
                          {settings.currency}{item.totalPrice}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-[#1f202e] flex justify-between items-center text-[14px]">
                      <span className="text-[#9496a1] font-semibold">{totalItemsCount} items</span>
                      <span className="text-[16px] font-bold text-[#818cf8]">
                        {settings.currency}{order.total}
                      </span>
                    </div>
                  </div>

                  {/* Contact / Delivery info */}
                  <div className="space-y-1 text-[12px] text-[#9496a1] mb-4">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#6b7280]" />
                      <span>{order.phone}</span>
                    </div>
                    {order.address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#6b7280] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{order.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-[#1f202e] flex flex-col gap-2">
                  {/* Status specific quick transition buttons */}
                  {order.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'accepted')}
                        className="py-2.5 bg-[#4f46e5] hover:bg-[#6366f1] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Order</span>
                      </button>
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'declined')}
                        className="py-2.5 bg-[#13141f] border border-[#f87171] text-[#f87171] hover:bg-[#f87171]/10 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'accepted' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                      className="w-full py-2.5 bg-[#4f46e5] hover:bg-[#6366f1] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-[#fb923c]" />
                      <span>Mark As Preparing</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                      className="w-full py-2.5 bg-[#059669] hover:bg-[#10b981] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-[#a7f3d0]" />
                      <span>Mark Ready / Out for Delivery</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <div className="flex items-center justify-center gap-1.5 py-2 text-[#34d399] font-bold text-[13px] bg-[#34d399]/10 border border-[#34d399]/20 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed / Ready</span>
                    </div>
                  )}

                  <button
                    onClick={() => onViewOrderDetail(order)}
                    className="w-full py-2 text-center text-[#818cf8] hover:text-[#a5b4fc] text-[13px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Full Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

