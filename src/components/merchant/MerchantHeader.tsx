import React from 'react';
import { StoreSettings } from '../../types';
import { Store } from 'lucide-react';

interface MerchantHeaderProps {
  settings: StoreSettings;
  onToggleStoreStatus: () => void;
  onSwitchToCustomer: () => void;
  title?: string;
}

export const MerchantHeader: React.FC<MerchantHeaderProps> = ({
  settings,
  onToggleStoreStatus,
  onSwitchToCustomer,
  title
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-4 md:px-8 h-16 bg-[#0a0a0f] border-b border-[#1f202e] text-[#e0e0e2] shadow-xs pt-safe lg:hidden">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#181926] border border-[#27273a] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#818cf8] text-[20px] fill">restaurant</span>
        </div>
        <div>
          <h1 className="text-[17px] font-bold text-white truncate">
            {title || settings.storeName}
          </h1>
          <span className="text-[11px] text-[#6b7280]">Merchant ID: {settings.merchantId}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSwitchToCustomer}
          className="p-2 rounded-xl text-[#9496a1] hover:text-white bg-[#13141f] text-[12px] font-semibold flex items-center gap-1.5 border border-[#1f202e] cursor-pointer"
          title="Customer View"
        >
          <Store className="w-4 h-4 text-[#818cf8]" />
          <span className="hidden sm:inline">Store</span>
        </button>

        <button
          onClick={onToggleStoreStatus}
          className={`font-semibold text-[13px] px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-xs cursor-pointer ${
            settings.isOpen
              ? 'bg-[#4f46e5] text-white hover:bg-[#6366f1]'
              : 'bg-[#27273a] text-[#9496a1] hover:bg-[#323348]'
          }`}
        >
          <span>{settings.isOpen ? 'Open' : 'Closed'}</span>
          <span className="material-symbols-outlined text-[14px]">expand_more</span>
        </button>
      </div>
    </header>
  );
};

