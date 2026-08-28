import React, { useEffect, useState } from 'react';
import { Order, StoreSettings } from '../../types';
import { ShoppingBag, X, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface OrderNotificationToastProps {
  order: Order | null;
  settings: StoreSettings;
  onViewOrder: (order: Order) => void;
  onDismiss: () => void;
}

export const OrderNotificationToast: React.FC<OrderNotificationToastProps> = ({
  order,
  settings,
  onViewOrder,
  onDismiss
}) => {
  const [isMuted, setIsMuted] = useState(soundService.getIsMuted());

  useEffect(() => {
    if (!order) return;

    // Auto-dismiss after 7 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);

    return () => clearTimeout(timer);
  }, [order, onDismiss]);

  if (!order) return null;

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isMuted;
    soundService.setMuted(nextState);
    setIsMuted(nextState);
  };

  return (
    <div
      id="merchant-realtime-toast"
      className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-[#0e0f17] border-2 border-[#4f46e5] text-[#e0e0e2] rounded-3xl p-4 shadow-[0_12px_40px_rgba(79,70,229,0.35)] animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md"
    >
      <div className="flex items-start gap-3">
        {/* Animated Icon */}
        <div className="w-10 h-10 rounded-2xl bg-[#4f46e5] text-white flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pulse">
          <ShoppingBag className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[12px] font-extrabold text-[#818cf8] uppercase tracking-wider">
              New Order Received!
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSound}
                className="p-1 text-[#9496a1] hover:text-white rounded-lg hover:bg-[#181926] transition-colors"
                title={isMuted ? 'Unmute order notifications' : 'Mute order notifications'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#34d399]" />}
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="p-1 text-[#9496a1] hover:text-white rounded-lg hover:bg-[#181926] transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h4 className="text-[15px] font-bold text-white truncate">
            {order.orderNumber} • {settings.currency}{order.total.toFixed(2)}
          </h4>
          <p className="text-[13px] text-[#9496a1] truncate mt-0.5">
            {order.customerName} ({order.fulfillment})
          </p>

          {/* Quick Action */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#1f202e]">
            <span className="text-[11px] text-[#6b7280]">Realtime Live Alert</span>
            <button
              type="button"
              onClick={() => {
                onViewOrder(order);
                onDismiss();
              }}
              className="text-[12px] font-bold text-[#818cf8] hover:text-white flex items-center gap-1 group cursor-pointer"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
