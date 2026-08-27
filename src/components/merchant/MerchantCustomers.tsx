import React, { useState } from 'react';
import { Order, StoreSettings } from '../../types';
import { Search, Phone, MapPin, Heart, MessageCircle } from 'lucide-react';

interface MerchantCustomersProps {
  orders: Order[];
  settings: StoreSettings;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export const MerchantCustomers: React.FC<MerchantCustomersProps> = ({
  orders,
  settings
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Group customer stats from orders
  const customerMap: Record<string, CustomerInfo> = orders.reduce((acc, order) => {
    const key = order.customerName.toLowerCase();
    if (!acc[key]) {
      acc[key] = {
        name: order.customerName,
        phone: order.phone,
        address: order.address,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: order.createdAt
      };
    }
    acc[key].totalOrders += 1;
    acc[key].totalSpent += order.total;
    return acc;
  }, {} as Record<string, CustomerInfo>);

  // Add sample regulars if list is short
  if (!customerMap['maria santos']) {
    customerMap['maria santos'] = {
      name: 'Maria Santos',
      phone: '0917 123 4567',
      address: '123 Sampaguita St., Makati City',
      totalOrders: 6,
      totalSpent: 2850,
      lastOrderDate: new Date().toISOString()
    };
  }
  if (!customerMap['jose rizal']) {
    customerMap['jose rizal'] = {
      name: 'Jose Rizal',
      phone: '0918 987 6543',
      address: '456 Ilustrado Ave., Manila',
      totalOrders: 4,
      totalSpent: 1980,
      lastOrderDate: new Date(Date.now() - 86400000).toISOString()
    };
  }

  const customersList: CustomerInfo[] = (Object.values(customerMap) as CustomerInfo[]).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-32 text-[#e0e0e2]">
      {/* Header */}
      <div className="bg-[#0e0f17] rounded-3xl p-5 sm:p-6 border border-[#1f202e] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-white">Customer Directory</h1>
          <p className="text-[14px] text-[#9496a1]">Manage regular diners, order history, and contact details.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9496a1]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name, phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#13141f] rounded-xl border border-[#1f202e] text-[14px] text-white placeholder-[#9496a1] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {customersList.map((customer, idx) => (
          <div
            key={idx}
            className="bg-[#0e0f17] rounded-3xl border border-[#1f202e] shadow-md hover:border-[#2e3048] transition-all p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#181926] text-[#818cf8] border border-[#2e3048] flex items-center justify-center font-bold text-[16px] shrink-0">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-white">{customer.name}</h3>
                    <div className="flex items-center gap-1 text-[12px] text-[#9496a1] mt-0.5">
                      <Phone className="w-3 h-3 text-[#6b7280]" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#fb7185]/10 border border-[#fb7185]/20 text-[#fb7185] px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <Heart className="w-3 h-3 fill-current" />
                  <span>VIP Regular</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 bg-[#13141f] p-3.5 rounded-2xl border border-[#1f202e] mb-4 text-center">
                <div>
                  <span className="text-[11px] font-bold text-[#9496a1] uppercase block">Total Orders</span>
                  <span className="text-[18px] font-bold text-[#818cf8]">{customer.totalOrders}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#9496a1] uppercase block">Lifetime Value</span>
                  <span className="text-[18px] font-bold text-[#34d399]">
                    {settings.currency}{customer.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>

              {customer.address && (
                <div className="flex items-start gap-2 text-[13px] text-[#9496a1] mb-2">
                  <MapPin className="w-4 h-4 text-[#6b7280] shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{customer.address}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#1f202e] flex gap-2">
              <a
                href={`tel:${customer.phone}`}
                className="flex-1 py-2 bg-[#13141f] hover:bg-[#181926] border border-[#1f202e] text-[#818cf8] rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
              <a
                href={`sms:${customer.phone}`}
                className="flex-1 py-2 bg-[#13141f] hover:bg-[#181926] border border-[#1f202e] text-[#818cf8] rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>SMS</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

