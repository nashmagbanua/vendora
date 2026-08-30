import React, { useState } from 'react';
import {
  Store,
  Phone,
  MapPin,
  Tag,
  ArrowRight,
  ArrowLeft,
  Loader2,
  LogOut,
  AlertCircle,
  Sparkles,
  Utensils,
  Coffee,
  Shirt,
  ShoppingBag,
  Wrench,
  HelpCircle,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { User, Profile, MerchantCreateStoreData } from '../../types';

interface MerchantOnboardingProps {
  user: User | null;
  profile: Profile | null;
  onCreateStore: (data: MerchantCreateStoreData) => Promise<any>;
  onSignOut: () => void;
  onBackToStorefront?: () => void;
}

const BUSINESS_TYPES = [
  { id: 'Restaurant', label: 'Restaurant', icon: Utensils, desc: 'Dine-in, takeaway meals & combos' },
  { id: 'Food & Snacks', label: 'Food & Snacks', icon: Coffee, desc: 'Cafes, milk tea, bakeries & street food' },
  { id: 'Clothing', label: 'Clothing', icon: Shirt, desc: 'Apparel, footwear & fashion accessories' },
  { id: 'Retail', label: 'Retail', icon: ShoppingBag, desc: 'Groceries, gadgets & general merchandise' },
  { id: 'Services', label: 'Services', icon: Wrench, desc: 'Repairs, bookings & custom crafts' },
  { id: 'Other', label: 'Other', icon: HelpCircle, desc: 'Specialty goods & unique businesses' }
];

export const MerchantOnboarding: React.FC<MerchantOnboardingProps> = ({
  user,
  profile,
  onCreateStore,
  onSignOut,
  onBackToStorefront
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Form State (Preserved across all steps)
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency] = useState('₱');
  const [deliveryFee, setDeliveryFee] = useState(50);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = profile?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Merchant';

  const effectiveBusinessType = businessType === 'Other' && customBusinessType.trim()
    ? customBusinessType.trim()
    : businessType;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!storeName.trim()) {
        setError('Please enter your store or restaurant name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (businessType === 'Other' && !customBusinessType.trim()) {
        setError('Please specify your business type.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    } else if (step === 5) {
      setStep(6);
    } else if (step === 6) {
      setStep(7);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    }
  };

  const handleFinalSubmit = async () => {
    if (!storeName.trim()) {
      setError('Please enter a valid store name.');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const fullDescription = description.trim()
        ? description.trim()
        : `Welcome to ${storeName.trim()}! Quality ${effectiveBusinessType.toLowerCase()} and great service.`;

      await onCreateStore({
        storeName: storeName.trim(),
        description: fullDescription,
        phone: phone.trim(),
        address: address.trim(),
        currency: currency.trim() || '₱',
        deliveryFee: Number(deliveryFee) >= 0 ? Number(deliveryFee) : 50
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to create store. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return storeName.trim().length > 0;
    if (step === 2) return businessType !== 'Other' || customBusinessType.trim().length > 0;
    if (step === 6) return Number(deliveryFee) >= 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#e0e0e2] flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-[#4f46e5] selection:text-white">
      <div className="w-full max-w-xl bg-[#0a0a0f] border border-[#1f202e] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Section */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#13141f] to-[#0a0a0f] border-b border-[#1f202e] relative">
          <div className={`flex ${onBackToStorefront ? 'justify-between' : 'justify-end'} items-center mb-4`}>
            {onBackToStorefront && (
              <button
                type="button"
                onClick={onBackToStorefront}
                className="text-[13px] text-[#9496a1] hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Storefront
              </button>
            )}
            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center gap-1.5 text-[13px] text-[#ef4444] hover:text-[#f87171] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1e1e38] border border-[#2e3048] text-[#818cf8] mb-3 shadow-inner">
              <Store className="w-7 h-7" />
            </div>

            <h1 className="text-[22px] sm:text-[26px] font-bold text-white tracking-tight">
              {step === 7 ? 'Your store is ready!' : "Let's set up your store"}
            </h1>
            <p className="text-[13px] text-[#9496a1] mt-1 max-w-md mx-auto leading-relaxed">
              {step === 7
                ? `Review your details before launching ${storeName || 'your store'}.`
                : `Welcome, ${displayName}! We'll ask for a few details so your customers know where and how to order.`}
            </p>
          </div>

          {/* Step Progress Indicator (Steps 1 to 6) */}
          {step <= 6 && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#818cf8] tracking-wider uppercase">
                <span>Step {step} of 6</span>
                <span className="text-[#9496a1] font-medium lowercase">
                  {step === 1 && 'store name'}
                  {step === 2 && 'business type'}
                  {step === 3 && 'tagline & story'}
                  {step === 4 && 'contact phone'}
                  {step === 5 && 'location'}
                  {step === 6 && 'delivery fee'}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      stepNumber < step
                        ? 'bg-[#10b981]'
                        : stepNumber === step
                        ? 'bg-[#6366f1]'
                        : 'bg-[#1f202e]'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Form Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Error Notice */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-[#f87171] text-[13px] animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
              </div>
            </div>
          )}

          {step <= 6 ? (
            <form onSubmit={handleNextStep} className="space-y-5">
              {/* STEP 1: Store Name */}
              {step === 1 && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="space-y-1">
                    <h3 className="text-[17px] font-bold text-white tracking-tight">
                      What is your store or restaurant name?
                    </h3>
                    <p className="text-[13px] text-[#9496a1] leading-relaxed">
                      This is the main title customers will see at the top of your online storefront.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                      Store Name <span className="text-[#ef4444]">*</span>
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Maria's Kitchen, Downtown Coffee Co."
                        className="w-full bg-[#13141f] border border-[#1f202e] rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Business Type */}
              {step === 2 && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="space-y-1">
                    <h3 className="text-[17px] font-bold text-white tracking-tight">
                      What type of business are you?
                    </h3>
                    <p className="text-[13px] text-[#9496a1] leading-relaxed">
                      Choose the category that best matches your offerings.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {BUSINESS_TYPES.map((bt) => {
                      const Icon = bt.icon;
                      const isSelected = businessType === bt.id;
                      return (
                        <button
                          key={bt.id}
                          type="button"
                          onClick={() => setBusinessType(bt.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#4f46e5]/15 border-[#6366f1] text-white shadow-xs'
                              : 'bg-[#13141f] border-[#1f202e] text-[#9496a1] hover:text-white hover:border-[#2e3048]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#4f46e5] text-white' : 'bg-[#181926] text-[#818cf8]'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#6366f1]" />}
                          </div>
                          <div>
                            <span className="text-[13px] font-bold block">{bt.label}</span>
                            <span className="text-[11px] text-[#717382] leading-tight line-clamp-1">{bt.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {businessType === 'Other' && (
                    <div className="pt-1">
                      <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                        Specify Business Category
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus
                        value={customBusinessType}
                        onChange={(e) => setCustomBusinessType(e.target.value)}
                        placeholder="e.g. Handmade Candles, Pet Supplies"
                        className="w-full bg-[#13141f] border border-[#1f202e] rounded-xl px-4 py-2.5 text-[14px] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Short Description / Tagline */}
              {step === 3 && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="space-y-1">
                    <h3 className="text-[17px] font-bold text-white tracking-tight">
                      Add a tagline or short description
                    </h3>
                    <p className="text-[13px] text-[#9496a1] leading-relaxed">
                      Give customers a quick preview of what makes your store special.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                      Short Description (Optional)
                    </label>
                    <div className="relative">
                      <Tag className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-3.5" />
                      <textarea
                        rows={3}
                        autoFocus
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Authentic home-cooked Filipino comfort meals & artisan desserts crafted fresh daily."
                        className="w-full bg-[#13141f] border border-[#1f202e] rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Contact Number */}
              {step === 4 && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="space-y-1">
                    <h3 className="text-[17px] font-bold text-white tracking-tight">
                      What is your contact number?
                    </h3>
                    <p className="text-[13px] text-[#9496a1] leading-relaxed">
                      Customers or delivery riders can reach you at this number for order updates.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                      Contact Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0917 123 4567"
                        className="w-full bg-[#13141f] border border-[#1f202e] rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Store Address / Location */}
              {step === 5 && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="space-y-1">
                    <h3 className="text-[17px] font-bold text-white tracking-tight">
                      Where is your store located?
                    </h3>
                    <p className="text-[13px] text-[#9496a1] leading-relaxed">
                      Your store address or pickup location for customer orders and delivery mapping.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                      Store Address / Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 123 Main St, Bonifacio Global City, Taguig"
                        className="w-full bg-[#13141f] border border-[#1f202e] rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Delivery Fee */}
              {step === 6 && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="space-y-1">
                    <h3 className="text-[17px] font-bold text-white tracking-tight">
                      Set your default delivery fee
                    </h3>
                    <p className="text-[13px] text-[#9496a1] leading-relaxed">
                      Set the standard delivery fee in Philippine Pesos (₱) charged to customers at checkout.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                      Delivery Fee (₱)
                    </label>
                    <div className="relative">
                      <Truck className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(Number(e.target.value))}
                        placeholder="50"
                        className="w-full bg-[#13141f] border border-[#1f202e] rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="pt-2 flex items-center gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-3 bg-[#181926] hover:bg-[#202234] border border-[#27273a] text-[#c7d2fe] font-semibold rounded-xl text-[14px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!isStepValid()}
                  className="flex-1 py-3 bg-[#4f46e5] hover:bg-[#6366f1] text-white font-bold rounded-xl shadow-md text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{step === 6 ? 'Review Store Details' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 7: Final Review Screen */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 bg-[#13141f] border border-[#1f202e] rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-[#1f202e]">
                  <span className="text-[12px] font-semibold text-[#9496a1]">Store Summary</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#34d399] font-bold">
                    Ready to Launch
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                  <div className="flex items-start gap-2.5">
                    <Store className="w-4 h-4 text-[#818cf8] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-[#717382] block">Store Name</span>
                      <span className="font-semibold text-white">{storeName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Tag className="w-4 h-4 text-[#818cf8] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-[#717382] block">Business Type</span>
                      <span className="font-semibold text-white">{effectiveBusinessType}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-[#818cf8] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-[#717382] block">Contact Number</span>
                      <span className="font-semibold text-white">{phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-[#818cf8] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-[#717382] block">Delivery Fee</span>
                      <span className="font-semibold text-white">₱{deliveryFee}</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#818cf8] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-[#717382] block">Address / Location</span>
                      <span className="font-semibold text-white">{address || 'Metro Manila, Philippines'}</span>
                    </div>
                  </div>

                  {description.trim() && (
                    <div className="sm:col-span-2 pt-1 border-t border-[#1f202e]/60 text-[12px] text-[#9496a1]">
                      <span className="text-[11px] text-[#717382] block mb-0.5">Tagline</span>
                      <p className="italic text-[#c7d2fe]">&ldquo;{description}&rdquo;</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                  className="px-4 py-3.5 bg-[#181926] hover:bg-[#202234] border border-[#27273a] text-[#c7d2fe] font-semibold rounded-xl text-[14px] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-[#4f46e5] hover:bg-[#6366f1] text-white font-bold rounded-xl shadow-lg text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Your Store...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#fbbf24]" />
                      <span>Launch My Store</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

