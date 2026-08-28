import React, { useState } from 'react';
import { CartItem, StoreSettings, Order, Customer } from '../types';
import { User, Truck, QrCode, Wallet, Banknote, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

interface CheckoutViewProps {
  cart: CartItem[];
  settings: StoreSettings;
  initialCustomer?: Customer | null;
  onBackToCart: () => void;
  onOrderPlaced: (newOrder: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  settings,
  initialCustomer,
  onBackToCart,
  onOrderPlaced
}) => {
  const [fullName, setFullName] = useState(initialCustomer?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(initialCustomer?.phone || '');
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState(initialCustomer?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'cod'>('gcash');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = fulfillment === 'delivery' ? settings.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const handleFillDemo = () => {
    setFullName('Maria Santos');
    setPhoneNumber('0917 123 4567');
    setAddress('123 Sampaguita St., Brgy. San Lorenzo, Makati City');
    setValidationError(null);
  };

  const handlePlaceOrder = () => {
    setValidationError(null);
    if (!fullName.trim() || !phoneNumber.trim()) {
      setValidationError('Please provide your name and phone number to place the order.');
      return;
    }
    if (fulfillment === 'delivery' && !address.trim()) {
      setValidationError('Please enter a delivery address for order dispatch.');
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNum = `#${settings.storeName ? settings.storeName.substring(0, 2).toUpperCase() : 'ORD'}-${randomSuffix}`;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      merchantId: settings.merchantId || '8829',
      orderNumber: orderNum,
      customerName: fullName.trim(),
      phone: phoneNumber.trim(),
      fulfillment,
      address: fulfillment === 'delivery' ? address.trim() : `Store Pickup (${settings.address})`,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      notes: orderNotes.trim(),
      items: cart.map((item) => {
        const optionSummaries: string[] = [];
        item.product.optionGroups.forEach((group) => {
          const sel = item.selectedOptions[group.id];
          if (Array.isArray(sel)) {
            sel.forEach((id) => {
              const opt = group.options.find((o) => o.id === id);
              if (opt) optionSummaries.push(opt.name);
            });
          } else if (typeof sel === 'string') {
            const opt = group.options.find((o) => o.id === sel);
            if (opt && opt.name !== 'No Rice' && opt.name !== 'None') {
              optionSummaries.push(opt.name);
            }
          }
        });

        return {
          productId: item.product.id,
          title: item.product.name,
          optionsDescription: optionSummaries.join(', ') || 'Standard',
          quantity: item.quantity,
          unitPrice: item.totalPrice / item.quantity,
          totalPrice: item.totalPrice
        };
      }),
      subtotal,
      deliveryFee,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now',
      estimatedTime: fulfillment === 'delivery' ? '30-45 mins' : '15-20 mins'
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    }, 500);
  };

  return (
    <div className="w-full min-h-screen bg-[#050507] text-[#e0e0e2] antialiased pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#1f202e] shadow-[0_4px_20px_rgba(0,0,0,0.5)] pt-safe">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCart}
            className="text-[#9496a1] hover:text-white hover:bg-[#181926] transition-colors p-2 rounded-full flex items-center justify-center -ml-2 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#181926] border border-[#27273a] flex-shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#818cf8] text-[20px] fill">restaurant</span>
            </div>
            <h1 className="text-[20px] font-bold text-white">Checkout</h1>
          </div>
        </div>
        <button
          onClick={onBackToCart}
          className="text-[#818cf8] font-bold text-[14px] px-3 py-1.5 hover:bg-[#181926] rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 md:px-8 max-w-3xl mx-auto space-y-6">
        {/* Merchant Preview Banner */}
        <div className="bg-[#0e0f17] rounded-2xl p-4 flex items-start justify-between gap-3 border border-[#27273a] border-dashed shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#818cf8] mt-0.5 text-[22px]">storefront</span>
            <div>
              <p className="text-[13px] text-[#e0e0e2] leading-relaxed">
                <strong className="text-white">{settings.storeName || "Store"} Checkout</strong> • Multi-tenant guest order pipeline.
              </p>
            </div>
          </div>
          {(!fullName || !phoneNumber) && (
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[12px] font-semibold text-[#818cf8] bg-[#181926] border border-[#27273a] px-3 py-1 rounded-lg hover:bg-[#202234] transition-colors whitespace-nowrap cursor-pointer"
            >
              Fill Demo Info
            </button>
          )}
        </div>

        {validationError && (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-2xl text-red-300 text-[14px]">
            {validationError}
          </div>
        )}

        {/* Contact Information */}
        <section className="bg-[#0e0f17] rounded-3xl p-6 border border-[#1f202e] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <h2 className="text-[18px] font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#818cf8]" />
            <span>Contact Information</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#9496a1] mb-1.5" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maria Santos"
                className="w-full bg-[#13141f] text-white rounded-xl border border-[#27273a] px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#9496a1] mb-1.5" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0917 123 4567"
                className="w-full bg-[#13141f] text-white rounded-xl border border-[#27273a] px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
              />
            </div>
          </div>
        </section>

        {/* Fulfillment Section */}
        <section className="bg-[#0e0f17] rounded-3xl p-6 border border-[#1f202e] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <h2 className="text-[18px] font-bold text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#818cf8]" />
            <span>Fulfillment</span>
          </h2>

          {/* Toggle */}
          <div className="flex p-1 bg-[#13141f] rounded-2xl mb-5 relative border border-[#27273a]">
            <button
              type="button"
              onClick={() => setFulfillment('pickup')}
              className={`flex-1 py-3 text-[14px] rounded-xl font-bold transition-all cursor-pointer ${
                fulfillment === 'pickup'
                  ? 'bg-[#4f46e5] text-white shadow-sm'
                  : 'text-[#9496a1] hover:text-white'
              }`}
            >
              Pickup
            </button>
            <button
              type="button"
              onClick={() => setFulfillment('delivery')}
              className={`flex-1 py-3 text-[14px] rounded-xl font-bold transition-all cursor-pointer ${
                fulfillment === 'delivery'
                  ? 'bg-[#4f46e5] text-white shadow-sm'
                  : 'text-[#9496a1] hover:text-white'
              }`}
            >
              Delivery
            </button>
          </div>

          {/* Address Box */}
          {fulfillment === 'delivery' ? (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="block text-[13px] font-semibold text-[#9496a1]" htmlFor="address">
                Delivery Address
              </label>
              <textarea
                id="address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete address, landmarks, street name, etc."
                className="w-full bg-[#13141f] text-white rounded-xl border border-[#27273a] px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all resize-none"
              />
            </div>
          ) : (
            <div className="p-4 bg-[#13141f] rounded-xl border border-[#27273a] text-[13px] text-[#9496a1]">
              <span className="font-bold text-white">Pickup Location:</span> {settings.address}
              <p className="mt-1 text-[12px] text-[#6b7280]">Estimated prep time: 15-20 mins</p>
            </div>
          )}
        </section>

        {/* Payment Method */}
        <section className="bg-[#0e0f17] rounded-3xl p-6 border border-[#1f202e] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <h2 className="text-[18px] font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#818cf8] text-[22px] fill">payments</span>
            <span>Payment Method</span>
          </h2>
          <div className="space-y-3">
            {/* GCash */}
            <label
              onClick={() => setPaymentMethod('gcash')}
              className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                paymentMethod === 'gcash'
                  ? 'border-2 border-[#6366f1] bg-[#1e1e38] ring-1 ring-[#6366f1]'
                  : 'border border-[#27273a] bg-[#13141f] hover:border-[#3b3c58]'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'gcash'}
                  onChange={() => setPaymentMethod('gcash')}
                  className="w-5 h-5 text-[#6366f1] focus:ring-[#6366f1]"
                />
                <span className={`text-[15px] ${paymentMethod === 'gcash' ? 'font-bold text-white' : 'text-[#9496a1]'}`}>
                  GCash
                </span>
              </div>
              <QrCode className={`w-5 h-5 ${paymentMethod === 'gcash' ? 'text-[#818cf8]' : 'text-[#6b7280]'}`} />
            </label>

            {/* Maya */}
            <label
              onClick={() => setPaymentMethod('maya')}
              className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                paymentMethod === 'maya'
                  ? 'border-2 border-[#6366f1] bg-[#1e1e38] ring-1 ring-[#6366f1]'
                  : 'border border-[#27273a] bg-[#13141f] hover:border-[#3b3c58]'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'maya'}
                  onChange={() => setPaymentMethod('maya')}
                  className="w-5 h-5 text-[#6366f1] focus:ring-[#6366f1]"
                />
                <span className={`text-[15px] ${paymentMethod === 'maya' ? 'font-bold text-white' : 'text-[#9496a1]'}`}>
                  Maya
                </span>
              </div>
              <Wallet className={`w-5 h-5 ${paymentMethod === 'maya' ? 'text-[#818cf8]' : 'text-[#6b7280]'}`} />
            </label>

            {/* COD */}
            <label
              onClick={() => setPaymentMethod('cod')}
              className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-2 border-[#6366f1] bg-[#1e1e38] ring-1 ring-[#6366f1]'
                  : 'border border-[#27273a] bg-[#13141f] hover:border-[#3b3c58]'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="w-5 h-5 text-[#6366f1] focus:ring-[#6366f1]"
                />
                <span className={`text-[15px] ${paymentMethod === 'cod' ? 'font-bold text-white' : 'text-[#9496a1]'}`}>
                  Cash on Delivery
                </span>
              </div>
              <Banknote className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-[#818cf8]' : 'text-[#6b7280]'}`} />
            </label>
          </div>
        </section>

        {/* Order Notes */}
        <section className="bg-[#0e0f17] rounded-3xl p-6 border border-[#1f202e] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <h2 className="text-[18px] font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#818cf8]" />
            <span>Order Notes</span>
          </h2>
          <textarea
            rows={2}
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Any special instructions for the kitchen? (Optional)"
            className="w-full bg-[#13141f] text-white rounded-xl border border-[#27273a] px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all resize-none"
          />
        </section>

        {/* Order Summary */}
        <section className="bg-[#0e0f17] rounded-3xl p-6 border border-[#1f202e] shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-8">
          <h2 className="text-[18px] font-bold text-white mb-4">Order Summary</h2>

          <div className="space-y-3.5 mb-6">
            {cart.map((item) => (
              <div key={item.cartItemId} className="flex justify-between items-start gap-4 pb-3.5 border-b border-[#1f202e] last:border-0 last:pb-0">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1e1e38] text-[#818cf8] border border-[#2e3048] flex items-center justify-center text-[12px] font-bold shrink-0">
                    {item.quantity}x
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">{item.product.name}</p>
                    <p className="text-[12px] text-[#9496a1]">
                      {Object.keys(item.selectedOptions).length > 0 ? 'Customized' : 'Standard'}
                    </p>
                  </div>
                </div>
                <p className="text-[15px] font-bold text-white whitespace-nowrap">
                  {settings.currency}{item.totalPrice}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-[#1f202e]">
            <div className="flex justify-between text-[14px] text-[#9496a1]">
              <span>Subtotal</span>
              <span className="font-semibold text-white">{settings.currency}{subtotal}</span>
            </div>
            <div className="flex justify-between text-[14px] text-[#9496a1]">
              <span>Delivery Fee</span>
              <span className="font-semibold text-white">{settings.currency}{deliveryFee}</span>
            </div>
            <div className="flex justify-between text-[18px] font-bold text-white pt-3 border-t border-[#1f202e] mt-2">
              <span>Total</span>
              <span className="text-[#818cf8]">{settings.currency}{total}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-[#0e0f17] border-t border-[#1f202e] shadow-[0_-4px_20px_rgba(0,0,0,0.7)] px-4 md:px-8 py-3.5 pb-safe flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[12px] text-[#9496a1] font-medium">Total Payment</span>
          <span className="text-[22px] font-bold text-[#818cf8]">
            {settings.currency}{total}
          </span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="bg-[#4f46e5] hover:bg-[#6366f1] text-white text-[16px] font-bold py-3.5 px-8 rounded-2xl shadow-[0_4px_16px_rgba(79,70,229,0.4)] transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Placing Order...' : 'Place Order'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
