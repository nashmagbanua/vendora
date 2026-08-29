import React, { useState } from 'react';
import { Store, Lock, Mail, User, AlertCircle, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { MerchantSignUpData, MerchantLoginCredentials } from '../../types';

interface MerchantAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (credentials: MerchantLoginCredentials) => Promise<any>;
  onSignUp: (data: MerchantSignUpData) => Promise<any>;
  error: string | null;
  onClearError: () => void;
  isLoading: boolean;
}

export const MerchantAuthModal: React.FC<MerchantAuthModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
  onSignUp,
  error,
  onClearError,
  isLoading
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  if (!isOpen) return null;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClearError();
    try {
      await onSignIn({
        email: loginEmail.trim(),
        password: loginPassword
      });
    } catch {
      // Handled in useAuth hook
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClearError();
    try {
      await onSignUp({
        fullName: fullName.trim(),
        storeName: storeName.trim(),
        email: signupEmail.trim(),
        password: signupPassword
      });
    } catch {
      // Handled in useAuth hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0a0a0f] border border-[#1f202e] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-[#e0e0e2] my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Gradient Banner & Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#13141f] to-[#0a0a0f] border-b border-[#1f202e] relative">
          <button
            onClick={onClose}
            className="absolute top-6 left-6 w-9 h-9 rounded-full bg-[#181926] border border-[#27273a] flex items-center justify-center text-[#9496a1] hover:text-white hover:bg-[#202234] transition-all cursor-pointer"
            aria-label="Back to customer view"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1e1e38] border border-[#2e3048] text-[#818cf8] mb-3 shadow-inner">
              <Store className="w-7 h-7" />
            </div>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-white tracking-tight">
              Merchant Portal
            </h2>
            <p className="text-[13px] text-[#9496a1] mt-1">
              Manage your live menu catalog, orders & store settings
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#13141f] p-1 rounded-xl border border-[#1f202e] mt-6">
            <button
              type="button"
              onClick={() => {
                onClearError();
                setTab('signin');
              }}
              className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
                tab === 'signin'
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'text-[#9496a1] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                onClearError();
                setTab('signup');
              }}
              className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'text-[#9496a1] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-[#f87171] text-[13px]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
              </div>
            </div>
          )}

          {tab === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="merchant@yourstore.ph"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-[#13141f] text-white text-[14px] pl-10 pr-4 py-2.5 rounded-xl border border-[#1f202e] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#13141f] text-white text-[14px] pl-10 pr-10 py-2.5 rounded-xl border border-[#1f202e] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9496a1]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#4f46e5] hover:bg-[#6366f1] text-white font-bold rounded-xl shadow-md text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In as Merchant</span>
                )}
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Juan Dela Cruz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#13141f] text-white text-[14px] pl-10 pr-4 py-2.5 rounded-xl border border-[#1f202e] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                  Store / Restaurant Name
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Juan's Kitchen Makati"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-[#13141f] text-white text-[14px] pl-10 pr-4 py-2.5 rounded-xl border border-[#1f202e] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="owner@yourstore.ph"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full bg-[#13141f] text-white text-[14px] pl-10 pr-4 py-2.5 rounded-xl border border-[#1f202e] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full bg-[#13141f] text-white text-[14px] pl-10 pr-10 py-2.5 rounded-xl border border-[#1f202e] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9496a1]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#4f46e5] hover:bg-[#6366f1] text-white font-bold rounded-xl shadow-md text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Store...</span>
                  </>
                ) : (
                  <span>Create Store & Launch Dashboard</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
