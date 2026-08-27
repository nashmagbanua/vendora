import React from 'react';
import { Order, StoreSettings } from '../types';
import { X, Printer, CheckCircle2, QrCode } from 'lucide-react';

interface ViewReceiptModalProps {
  order: Order | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const ViewReceiptModal: React.FC<ViewReceiptModalProps> = ({
  order,
  settings,
  onClose
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e0f17] w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.8)] flex flex-col border border-[#1f202e] text-[#e0e0e2]">
        {/* Header */}
        <div className="bg-[#13141f] px-6 py-4 border-b border-[#1f202e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#818cf8]" />
            <h3 className="text-[17px] font-bold text-white">Official Digital Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#1f202e] flex items-center justify-center text-[#9496a1] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 md:p-8 space-y-6 bg-[#0a0a0f]">
          {/* Store Brand */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-[#27273a]">
            <h2 className="text-[22px] font-bold text-[#818cf8]">{settings.storeName}</h2>
            <p className="text-[12px] text-[#9496a1]">{settings.address}</p>
            <p className="text-[12px] text-[#6b7280]">Merchant ID: {settings.merchantId} • TIN: 123-456-789-000</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <span className="text-[#6b7280] block">Order #:</span>
              <span className="font-bold text-white">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-[#6b7280] block">Date:</span>
              <span className="font-semibold text-white">
                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              <span className="text-[#6b7280] block">Customer:</span>
              <span className="font-semibold text-white">{order.customerName}</span>
            </div>
            <div>
              <span className="text-[#6b7280] block">Payment:</span>
              <span className="font-semibold text-[#818cf8] uppercase">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-[#13141f] rounded-2xl p-4 border border-[#1f202e] space-y-2.5">
            <div className="text-[12px] font-bold text-[#6b7280] uppercase border-b border-[#1f202e] pb-2 flex justify-between">
              <span>Item Description</span>
              <span>Total</span>
            </div>
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-start text-[13px]">
                <div>
                  <span className="font-semibold text-white">{it.quantity}x {it.title}</span>
                  {it.optionsDescription && (
                    <span className="block text-[11px] text-[#9496a1]">({it.optionsDescription})</span>
                  )}
                </div>
                <span className="font-semibold text-white shrink-0">
                  {settings.currency}{it.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="space-y-1.5 text-[14px] pt-1">
            <div className="flex justify-between text-[#9496a1]">
              <span>Subtotal</span>
              <span className="text-white">{settings.currency}{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#9496a1]">
              <span>Delivery Fee</span>
              <span className="text-white">{settings.currency}{order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[18px] font-bold text-white pt-2 border-t border-[#27273a]">
              <span>Grand Total</span>
              <span className="text-[#818cf8]">{settings.currency}{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* QR Code Graphic */}
          <div className="bg-[#13141f] rounded-2xl p-4 border border-[#1f202e] flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[13px] font-bold text-white">Order Verification QR</p>
              <p className="text-[11px] text-[#6b7280]">Scan to verify transaction status</p>
            </div>
            <div className="w-14 h-14 bg-[#1e1e38] border border-[#2e3048] rounded-xl flex items-center justify-center text-[#818cf8]">
              <QrCode className="w-9 h-9" />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-[#13141f] border-t border-[#1f202e] flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-[#1e1e38] border border-[#2e3048] text-[#818cf8] hover:bg-[#28284c] rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#4f46e5] text-white hover:bg-[#6366f1] rounded-xl font-bold text-[14px] shadow-[0_4px_16px_rgba(79,70,229,0.4)] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

