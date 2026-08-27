import React from 'react';
import { Order, StoreSettings } from '../types';
import { CheckCircle2, Check, Utensils, Flame, Truck, MapPin, Phone, User, Home, Receipt, RefreshCw } from 'lucide-react';

interface OrderConfirmedViewProps {
  order: Order;
  settings: StoreSettings;
  onBackToHome: () => void;
  onOpenReceipt: () => void;
  onAdvanceOrderStatus?: (orderId: string) => void;
}

export const OrderConfirmedView: React.FC<OrderConfirmedViewProps> = ({
  order,
  settings,
  onBackToHome,
  onOpenReceipt,
  onAdvanceOrderStatus
}) => {
  // Determine active step in 4-step progress:
  // 1: Pending, 2: Accepted, 3: Preparing, 4: Ready/Completed
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'accepted': return 2;
      case 'preparing': return 3;
      case 'ready':
      case 'completed': return 4;
      default: return 1;
    }
  };

  const currentStep = getStepIndex(order.status);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-28 text-[#e0e0e2]">
      {/* Success Header Section */}
      <section className="flex flex-col items-center justify-center text-center py-6">
        <div className="w-24 h-24 rounded-full bg-[#4f46e5] text-white flex items-center justify-center mb-5 shadow-[0_8px_32px_rgba(79,70,229,0.5)] animate-bounce">
          <CheckCircle2 className="w-14 h-14" />
        </div>
        <h1 className="text-[26px] sm:text-[32px] font-bold text-white mb-1.5">
          Order Confirmed
        </h1>
        <p className="text-[15px] sm:text-[16px] text-[#9496a1]">
          Thank you! Your order is being processed.
        </p>
      </section>

      {/* Order Summary & Live Stepper Card */}
      <section className="bg-[#0e0f17] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-[#1f202e] p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#1f202e]">
          <div>
            <p className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">
              Order Number
            </p>
            <p className="text-[20px] sm:text-[24px] font-bold text-white">
              {order.orderNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">
              Estimated Time
            </p>
            <p className="text-[18px] sm:text-[20px] font-bold text-[#818cf8]">
              {order.estimatedTime}
            </p>
          </div>
        </div>

        {/* 4-Step Stepper */}
        <div className="py-3 relative">
          {/* Background Connecting Bar */}
          <div className="absolute top-[20px] left-[10%] right-[10%] h-1 bg-[#181926] -z-0 rounded-full" />
          {/* Active Bar */}
          <div
            className="absolute top-[20px] left-[10%] h-1 bg-[#6366f1] -z-0 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
            style={{
              width: currentStep === 1 ? '10%' : currentStep === 2 ? '38%' : currentStep === 3 ? '68%' : '80%'
            }}
          />

          <div className="flex justify-between items-start relative z-10">
            {/* Step 1: Pending */}
            <div className="flex flex-col items-center gap-2 w-1/4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                currentStep >= 1 ? 'bg-[#4f46e5] text-white ring-2 ring-[#6366f1]' : 'bg-[#181926] text-[#6b7280] border border-[#27273a]'
              }`}>
                {currentStep > 1 ? <Check className="w-5 h-5" /> : <span className="text-[13px] font-bold">1</span>}
              </div>
              <span className={`text-[12px] font-semibold text-center ${
                currentStep >= 1 ? 'text-[#818cf8]' : 'text-[#6b7280]'
              }`}>
                Pending
              </span>
            </div>

            {/* Step 2: Accepted */}
            <div className="flex flex-col items-center gap-2 w-1/4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                currentStep >= 2
                  ? currentStep === 2
                    ? 'bg-[#4f46e5] text-white ring-4 ring-[#6366f1]/40'
                    : 'bg-[#4f46e5] text-white'
                  : 'bg-[#181926] text-[#6b7280] border border-[#27273a]'
              }`}>
                {currentStep > 2 ? <Check className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
              </div>
              <span className={`text-[12px] font-semibold text-center ${
                currentStep >= 2 ? 'text-white font-bold' : 'text-[#6b7280]'
              }`}>
                Accepted
              </span>
            </div>

            {/* Step 3: Preparing */}
            <div className="flex flex-col items-center gap-2 w-1/4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                currentStep >= 3
                  ? currentStep === 3
                    ? 'bg-[#4f46e5] text-white ring-4 ring-[#6366f1]/40'
                    : 'bg-[#4f46e5] text-white'
                  : 'bg-[#181926] text-[#6b7280] border border-[#27273a]'
              }`}>
                {currentStep > 3 ? <Check className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
              </div>
              <span className={`text-[12px] font-semibold text-center ${
                currentStep >= 3 ? 'text-white font-bold' : 'text-[#6b7280]'
              }`}>
                Preparing
              </span>
            </div>

            {/* Step 4: Ready */}
            <div className="flex flex-col items-center gap-2 w-1/4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                currentStep >= 4 ? 'bg-[#064e3b] text-[#34d399] border border-[#065f46]' : 'bg-[#181926] text-[#6b7280] border border-[#27273a]'
              }`}>
                <Truck className="w-5 h-5" />
              </div>
              <span className={`text-[12px] font-semibold text-center ${
                currentStep >= 4 ? 'text-[#34d399] font-bold' : 'text-[#6b7280]'
              }`}>
                {order.fulfillment === 'delivery' ? 'On the Way' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Simulation Trigger (Customer Experience Enhancement) */}
        {onAdvanceOrderStatus && currentStep < 4 && (
          <div className="mt-6 pt-4 border-t border-[#1f202e] flex items-center justify-between bg-[#13141f] p-3 rounded-2xl border border-[#27273a]">
            <span className="text-[12px] text-[#9496a1]">
              Simulate kitchen cooking progress:
            </span>
            <button
              onClick={() => onAdvanceOrderStatus(order.id)}
              className="px-3 py-1 bg-[#181926] border border-[#27273a] text-[#818cf8] text-[12px] font-bold rounded-lg hover:bg-[#202234] flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Next Stage</span>
            </button>
          </div>
        )}
      </section>

      {/* Bento Grid: Delivery Details + Order Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Details Card */}
        <section className="bg-[#0e0f17] rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#1f202e] p-6 space-y-4">
          <h3 className="text-[18px] font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#818cf8]" />
            <span>Delivery Details</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div>
              <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">Customer</p>
              <p className="text-[15px] font-semibold text-white mt-0.5">{order.customerName}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">Address</p>
              <div className="flex items-start gap-2 mt-0.5">
                <MapPin className="w-4 h-4 text-[#818cf8] mt-0.5 shrink-0" />
                <p className="text-[14px] text-[#e0e0e2]">{order.address}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">Contact</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Phone className="w-4 h-4 text-[#818cf8] shrink-0" />
                <p className="text-[14px] text-[#e0e0e2]">{order.phone}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">Payment Method</p>
              <p className="text-[14px] font-semibold text-[#818cf8] uppercase mt-0.5">{order.paymentMethod}</p>
            </div>
          </div>
        </section>

        {/* Order Items Card */}
        <section className="bg-[#0e0f17] rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#1f202e] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[18px] font-bold text-white flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-[#818cf8]" />
              <span>Order Items</span>
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-[#1f202e] pb-2.5 last:border-0 last:pb-0">
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded bg-[#1e1e38] border border-[#2e3048] flex items-center justify-center text-[12px] font-bold text-[#818cf8] shrink-0">
                      {item.quantity}x
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-white">{item.title}</p>
                      {item.optionsDescription && (
                        <p className="text-[12px] text-[#9496a1] mt-0.5">
                          • {item.optionsDescription}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-[14px] font-bold text-white shrink-0">
                    {settings.currency}{item.totalPrice.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-4 pt-3 border-t-2 border-dashed border-[#27273a] space-y-1.5">
            <div className="flex justify-between text-[13px] text-[#9496a1]">
              <span>Subtotal</span>
              <span className="text-white">{settings.currency}{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-[#9496a1]">
              <span>Delivery Fee</span>
              <span className="text-white">{settings.currency}{order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[17px] font-bold text-white pt-2 border-t border-[#1f202e]">
              <span>Total Paid</span>
              <span className="text-[#818cf8]">{settings.currency}{order.total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <section className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onBackToHome}
          className="flex-1 bg-[#4f46e5] hover:bg-[#6366f1] text-white h-13 rounded-2xl text-[15px] font-bold transition-all shadow-[0_4px_16px_rgba(79,70,229,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={onOpenReceipt}
          className="flex-1 bg-[#13141f] border border-[#27273a] text-[#818cf8] hover:bg-[#181926] h-13 rounded-2xl text-[15px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Receipt className="w-4 h-4" />
          <span>View Receipt</span>
        </button>
      </section>
    </div>
  );
};

