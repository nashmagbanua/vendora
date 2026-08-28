import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../../types';
import { Store, MapPin, CreditCard, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface MerchantSettingsProps {
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
}

export const MerchantSettings: React.FC<MerchantSettingsProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6 md:space-y-8 pb-32 text-[#e0e0e2]">
      {/* Header */}
      <div className="bg-[#0e0f17] rounded-3xl p-5 sm:p-6 border border-[#1f202e] shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-white">Store Settings</h1>
          <p className="text-[14px] text-[#9496a1]">Configure your restaurant profile, delivery fee, and payment options.</p>
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#6366f1] text-white font-bold rounded-xl shadow-md text-[14px] transition-all active:scale-95 cursor-pointer"
        >
          Save Changes
        </button>
      </div>

      {showSavedToast && (
        <div className="bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#34d399]" />
          <span className="text-[14px] font-bold">Settings saved successfully!</span>
        </div>
      )}

      {/* Subscription Plan Card */}
      <div className="bg-[#13141f] border border-[#2e3048] rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#fb923c]" />
            <span className="text-[18px] font-bold">Pro Trial Plan Active</span>
          </div>
          <p className="text-[13px] text-[#9496a1]">
            {formData.trialDaysLeft} days remaining on your complimentary trial. Unlimited orders & custom variants enabled.
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert('Subscription billing management modal')}
          className="bg-[#4f46e5] hover:bg-[#6366f1] text-white px-5 py-2.5 rounded-xl font-bold text-[13px] shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          Upgrade / Renew
        </button>
      </div>

      {/* General Store Info */}
      <section className="bg-[#0e0f17] rounded-3xl p-6 sm:p-8 border border-[#1f202e] shadow-md space-y-5">
        <h2 className="text-[18px] font-bold text-white flex items-center gap-2">
          <Store className="w-5 h-5 text-[#818cf8]" />
          <span>General Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#9496a1] mb-2">Store Name</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full bg-[#13141f] text-white text-[15px] border border-[#1f202e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#9496a1] mb-2">Merchant ID</label>
            <input
              type="text"
              readOnly
              value={formData.merchantId}
              className="w-full bg-[#181926] text-[#6b7280] text-[15px] border border-[#1f202e] rounded-xl px-4 py-3 focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-[#9496a1] mb-2">Store Tagline / Description</label>
          <input
            type="text"
            value={formData.storeDescription || ''}
            onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
            className="w-full bg-[#13141f] text-white text-[15px] border border-[#1f202e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#9496a1] mb-2">Currency Symbol</label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full bg-[#13141f] text-white text-[15px] border border-[#1f202e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] font-bold"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#9496a1] mb-2">Delivery Fee (Flat Rate)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9496a1] font-bold">
                {formData.currency}
              </span>
              <input
                type="number"
                min="0"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) || 0 })}
                className="w-full bg-[#13141f] text-white text-[15px] pl-8 pr-4 py-3 border border-[#1f202e] rounded-xl focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] font-semibold"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="bg-[#0e0f17] rounded-3xl p-6 sm:p-8 border border-[#1f202e] shadow-md space-y-5">
        <h2 className="text-[18px] font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#818cf8]" />
          <span>Location & Contact</span>
        </h2>

        <div>
          <label className="block text-[13px] font-semibold text-[#9496a1] mb-2">Store Address / Pickup Station</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full bg-[#13141f] text-white text-[15px] border border-[#1f202e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-[#9496a1] mb-2">Contact Phone Number</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-[#13141f] text-white text-[15px] border border-[#1f202e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          />
        </div>
      </section>

      {/* Payment Methods */}
      <section className="bg-[#0e0f17] rounded-3xl p-6 sm:p-8 border border-[#1f202e] shadow-md space-y-5">
        <h2 className="text-[18px] font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#818cf8]" />
          <span>Accepted Payment Methods</span>
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-[#13141f] rounded-2xl border border-[#1f202e]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center font-bold text-[12px]">
                GC
              </div>
              <div>
                <p className="text-[14px] font-bold text-white">GCash QR & Direct Transfer</p>
                <p className="text-[12px] text-[#9496a1]">Allow customers to scan or pay via GCash</p>
              </div>
            </div>
            <span className="text-[12px] font-bold text-[#34d399] bg-[#34d399]/10 border border-[#34d399]/20 px-3 py-1 rounded-full">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#13141f] rounded-2xl border border-[#1f202e]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#059669] text-white flex items-center justify-center font-bold text-[12px]">
                MY
              </div>
              <div>
                <p className="text-[14px] font-bold text-white">Maya Wallet & Card Payments</p>
                <p className="text-[12px] text-[#9496a1]">Accept payments via Maya</p>
              </div>
            </div>
            <span className="text-[12px] font-bold text-[#34d399] bg-[#34d399]/10 border border-[#34d399]/20 px-3 py-1 rounded-full">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#13141f] rounded-2xl border border-[#1f202e]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ea580c] text-white flex items-center justify-center font-bold text-[12px]">
                COD
              </div>
              <div>
                <p className="text-[14px] font-bold text-white">Cash On Delivery (COD)</p>
                <p className="text-[12px] text-[#9496a1]">Rider collects cash upon handoff</p>
              </div>
            </div>
            <span className="text-[12px] font-bold text-[#34d399] bg-[#34d399]/10 border border-[#34d399]/20 px-3 py-1 rounded-full">
              Enabled
            </span>
          </div>
        </div>
      </section>

      {/* Security & Reliability */}
      <div className="p-4 bg-[#13141f] rounded-2xl border border-[#1f202e] flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#818cf8] shrink-0" />
        <p className="text-[12px] text-[#9496a1]">
          Bayanihan Tech Cloud automatically backs up your menu catalog and synchronizes orders in real-time.
        </p>
      </div>
    </form>
  );
};

