import React from 'react';
import { Order, StoreSettings } from '../../types';
import { X, Phone, MapPin, Printer, MessageCircle } from 'lucide-react';

interface MerchantOrderDetailModalProps {
  order: Order | null;
  settings: StoreSettings;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export const MerchantOrderDetailModal: React.FC<MerchantOrderDetailModalProps> = ({
  order,
  settings,
  onClose,
  onUpdateStatus
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e0f17] text-[#e0e0e2] w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-[#1f202e]">
        {/* Header */}
        <div className="bg-[#0a0a0f] px-6 py-4 border-b border-[#1f202e] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[18px] font-bold text-white">{order.orderNumber}</h3>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[#181926] text-[#818cf8] border border-[#2e3048]">
                {order.fulfillment}
              </span>
            </div>
            <p className="text-[12px] text-[#9496a1]">
              Placed: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#181926] flex items-center justify-center text-[#9496a1] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Customer & Contact Box */}
          <div className="bg-[#13141f] rounded-2xl p-4 border border-[#1f202e] space-y-3">
            <h4 className="text-[13px] font-bold text-[#9496a1] uppercase tracking-wider">
              Customer Details
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[16px] font-bold text-white">{order.customerName}</p>
                <p className="text-[13px] text-[#9496a1] flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-[#6b7280]" />
                  <span>{order.phone}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${order.phone}`}
                  className="w-9 h-9 rounded-xl bg-[#0e0f17] border border-[#1f202e] text-[#818cf8] flex items-center justify-center hover:bg-[#181926] transition-colors"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`sms:${order.phone}`}
                  className="w-9 h-9 rounded-xl bg-[#0e0f17] border border-[#1f202e] text-[#818cf8] flex items-center justify-center hover:bg-[#181926] transition-colors"
                  title="Send SMS"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {order.address && (
              <div className="pt-2 border-t border-[#1f202e] flex items-start gap-2 text-[13px] text-[#9496a1]">
                <MapPin className="w-4 h-4 text-[#6b7280] shrink-0 mt-0.5" />
                <span>{order.address}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-[#fbbf24]/10 rounded-2xl p-4 border border-[#fbbf24]/20">
              <p className="text-[12px] font-bold text-[#fbbf24] uppercase mb-1">Customer Special Instructions:</p>
              <p className="text-[14px] text-[#e0e0e2]">{order.notes}</p>
            </div>
          )}

          {/* Ordered Line Items */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-bold text-[#9496a1] uppercase tracking-wider">
              Ordered Items
            </h4>
            <div className="border border-[#1f202e] rounded-2xl divide-y divide-[#1f202e] overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex justify-between items-start text-[14px]">
                  <div>
                    <span className="font-bold text-white">{item.quantity}x {item.title}</span>
                    {item.optionsDescription && (
                      <p className="text-[12px] text-[#9496a1] mt-0.5">
                        Options: {item.optionsDescription}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-white">
                    {settings.currency}{item.totalPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[#13141f] rounded-2xl p-4 border border-[#1f202e] space-y-1.5 text-[13px]">
              <div className="flex justify-between text-[#9496a1]">
                <span>Subtotal</span>
                <span>{settings.currency}{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#9496a1]">
                <span>Delivery Fee</span>
                <span>{settings.currency}{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[16px] font-bold text-white pt-2 border-t border-[#1f202e]">
                <span>Total Due / Paid ({order.paymentMethod.toUpperCase()})</span>
                <span className="text-[#818cf8]">{settings.currency}{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Quick Status Changers */}
          <div className="space-y-2 pt-2">
            <label className="block text-[12px] font-bold text-[#9496a1] uppercase">
              Update Order Status:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onUpdateStatus(order.id, 'pending')}
                className={`py-2 rounded-xl text-[12px] font-bold border transition-colors cursor-pointer ${
                  order.status === 'pending'
                    ? 'bg-[#fbbf24]/20 border-[#fbbf24] text-[#fbbf24]'
                    : 'bg-[#13141f] border-[#1f202e] text-[#9496a1] hover:bg-[#181926] hover:text-white'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'accepted')}
                className={`py-2 rounded-xl text-[12px] font-bold border transition-colors cursor-pointer ${
                  order.status === 'accepted'
                    ? 'bg-[#60a5fa]/20 border-[#60a5fa] text-[#60a5fa]'
                    : 'bg-[#13141f] border-[#1f202e] text-[#9496a1] hover:bg-[#181926] hover:text-white'
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'preparing')}
                className={`py-2 rounded-xl text-[12px] font-bold border transition-colors cursor-pointer ${
                  order.status === 'preparing'
                    ? 'bg-[#c084fc]/20 border-[#c084fc] text-[#c084fc]'
                    : 'bg-[#13141f] border-[#1f202e] text-[#9496a1] hover:bg-[#181926] hover:text-white'
                }`}
              >
                Preparing
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'ready')}
                className={`py-2 rounded-xl text-[12px] font-bold border transition-colors cursor-pointer ${
                  order.status === 'ready' || order.status === 'completed'
                    ? 'bg-[#34d399]/20 border-[#34d399] text-[#34d399]'
                    : 'bg-[#13141f] border-[#1f202e] text-[#9496a1] hover:bg-[#181926] hover:text-white'
                }`}
              >
                Ready
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-[#0a0a0f] border-t border-[#1f202e] flex gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-[#13141f] hover:bg-[#181926] border border-[#1f202e] text-[#818cf8] rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#4f46e5] text-white hover:bg-[#6366f1] rounded-xl font-bold text-[13px] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

