import React, { useState } from 'react';
import { Store, Phone, MapPin, Tag, ArrowRight, Loader2, LogOut, AlertCircle, Sparkles } from 'lucide-react';
import { User, Profile, MerchantCreateStoreData } from '../../types';

interface MerchantOnboardingProps {
  user: User | null;
  profile: Profile | null;
  onCreateStore: (data: MerchantCreateStoreData) => Promise<any>;
  onSignOut: () => void;
  onBackToStorefront?: () => void;
}

export const MerchantOnboarding: React.FC<MerchantOnboardingProps> = ({
  user,
  profile,
  onCreateStore,
  onSignOut,
  onBackToStorefront
}) => {
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('₱');
  const [deliveryFee, setDeliveryFee] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setError('Please enter a valid store name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onCreateStore({
        storeName: storeName.trim(),
        description: description.trim(),
        phone: phone.trim(),
        address: address.trim(),
        currency: currency.trim() || '₱',
        deliveryFee: Number(deliveryFee) || 0
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to create store. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = profile?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Merchant';

  return (
    <div className="min-h-screen bg-[#050507] text-[#e0e0e2] flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-[#4f46e5] selection:text-white">
      <div className="w-full max-w-xl bg-[#0a0a0f] border border-[#1f202e] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header Section */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#13141f] to-[#0a0a0f] border-b border-[#1f202e] text-center relative">
          <div className={`flex ${onBackToStorefront ? 'justify-between' : 'justify-end'} items-center mb-4`}>
            {onBackToStorefront && (
              <button
                onClick={onBackToStorefront}
                className="text-[13px] text-[#9496a1] hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Storefront
              </button>
            )}
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 text-[13px] text-[#ef4444] hover:text-[#f87171] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e1e38] border border-[#2e3048] text-[#818cf8] mb-4 shadow-inner">
            <Store className="w-8 h-8" />
          </div>

          <h1 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight">
            Create Your Store
          </h1>
          <p className="text-[14px] text-[#9496a1] mt-1 max-w-md mx-auto">
            Welcome, <strong className="text-white">{displayName}</strong>! Set up your restaurant or retail storefront to begin receiving orders and managing menu items.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-2xl text-[#f87171] text-[13px]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-semibold text-white mb-1.5">
              Store Name <span className="text-[#ef4444]">*</span>
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Maria's Kitchen, Downtown Coffee Co."
                className="w-full bg-[#13141f] border border-[#1f202e] rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#9496a1] mb-1.5">
              Tagline / Short Description
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-3.5" />
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Authentic home-cooked Filipino comfort meals & artisan desserts."
                className="w-full bg-[#13141f] border border-[#1f202e] rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#9496a1] mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0917 123 4567"
                  className="w-full bg-[#13141f] border border-[#1f202e] rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#9496a1] mb-1.5">
                Delivery Fee (₱)
              </label>
              <input
                type="number"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                placeholder="50"
                className="w-full bg-[#13141f] border border-[#1f202e] rounded-xl px-4 py-2.5 text-[14px] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#9496a1] mb-1.5">
              Store Address / Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 Main St, Bonifacio Global City, Taguig"
                className="w-full bg-[#13141f] border border-[#1f202e] rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !storeName.trim()}
            className="w-full py-3.5 bg-[#4f46e5] hover:bg-[#6366f1] text-white font-bold rounded-xl shadow-lg text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Your Store...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#fbbf24]" />
                <span>Launch Store & Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
