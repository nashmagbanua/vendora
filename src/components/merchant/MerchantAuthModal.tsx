import React, { useState } from 'react';
import { Store, Lock, Mail, User, AlertCircle, ArrowLeft, ArrowRight, Loader2, Eye, EyeOff, MailCheck, CheckCircle2 } from 'lucide-react';
import { MerchantSignUpData, MerchantLoginCredentials } from '../../types';

interface MerchantAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSignIn: (credentials: MerchantLoginCredentials) => Promise<any>;
  onSignUp: (data: MerchantSignUpData) => Promise<any>;
  error: string | null;
  onClearError: () => void;
  isLoading: boolean;
  isStandalone?: boolean;
}

export const MerchantAuthModal: React.FC<MerchantAuthModalProps> = ({
  isOpen = true,
  onClose,
  onSignIn,
  onSignUp,
  error,
  onClearError,
  isLoading,
  isStandalone = false
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [signupStep, setSignupStep] = useState<1 | 2 | 3 | 4>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState<string | null>(null);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State (Preserved across steps)
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  if (!isOpen && !isStandalone) return null;

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

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    onClearError();

    if (signupStep === 1) {
      if (!fullName.trim()) return;
      setSignupStep(2);
    } else if (signupStep === 2) {
      if (!storeName.trim()) return;
      setSignupStep(3);
    } else if (signupStep === 3) {
      if (!signupEmail.trim() || !signupEmail.includes('@')) return;
      setSignupStep(4);
    } else if (signupStep === 4) {
      handleFinalSignUp();
    }
  };

  const handlePrevStep = () => {
    onClearError();
    if (signupStep > 1) {
      setSignupStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleFinalSignUp = async () => {
    if (signupPassword.length < 6) return;
    onClearError();
    setEmailConfirmationSent(null);
    try {
      const res = await onSignUp({
        fullName: fullName.trim(),
        storeName: storeName.trim(),
        email: signupEmail.trim(),
        password: signupPassword
      });
      if (res?.requiresEmailConfirmation) {
        setEmailConfirmationSent(res.confirmationEmail || signupEmail.trim());
      }
    } catch {
      // Handled in useAuth hook
    }
  };

  const handleClose = () => {
    setEmailConfirmationSent(null);
    if (onClose) {
      onClose();
    }
  };

  const isStepValid = () => {
    if (signupStep === 1) return fullName.trim().length > 0;
    if (signupStep === 2) return storeName.trim().length > 0;
    if (signupStep === 3) return signupEmail.trim().length > 0 && signupEmail.includes('@');
    if (signupStep === 4) return signupPassword.length >= 6;
    return false;
  };

  const cardContent = (
    <div className="relative w-full max-w-md bg-[#0a0a0f] border border-[#1f202e] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-[#e0e0e2] animate-in fade-in zoom-in-95 duration-200">
      {/* Top Gradient Banner & Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-[#13141f] to-[#0a0a0f] border-b border-[#1f202e] relative">
        {onClose && !isStandalone && (
          <button
            onClick={handleClose}
            className="absolute top-6 left-6 w-9 h-9 rounded-full bg-[#181926] border border-[#27273a] flex items-center justify-center text-[#9496a1] hover:text-white hover:bg-[#202234] transition-all cursor-pointer"
            aria-label="Back to previous view"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

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
        {!emailConfirmationSent && (
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
        )}
      </div>

      {/* Form Body */}
      <div className="p-6 sm:p-8 space-y-5">
        {/* Email Confirmation Notice Screen */}
        {emailConfirmationSent ? (
          <div className="text-center space-y-5 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] mx-auto shadow-inner">
              <MailCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[20px] font-bold text-white tracking-tight">
                Check Your Email
              </h3>
              <p className="text-[13px] text-[#9496a1] leading-relaxed max-w-sm mx-auto">
                Your account was created successfully. We sent a confirmation link to{' '}
                <span className="font-semibold text-white">{emailConfirmationSent}</span>.
              </p>
              <p className="text-[12px] text-[#717382]">
                Please confirm your email before signing in to continue setting up your store.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setLoginEmail(emailConfirmationSent);
                  setEmailConfirmationSent(null);
                  setTab('signin');
                  onClearError();
                }}
                className="w-full py-3 bg-[#4f46e5] hover:bg-[#6366f1] text-white font-bold rounded-xl shadow-md text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Sign In</span>
              </button>
              {onClose && !isStandalone && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 text-[13px] font-semibold text-[#9496a1] hover:text-white transition-colors cursor-pointer"
                >
                  Back to Storefront
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-3.5 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-[#f87171] text-[13px] animate-in fade-in duration-150">
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
              /* ONE-AT-A-TIME Guided Sign Up Wizard */
              <form onSubmit={handleNextStep} className="space-y-5">
                {/* Step Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#818cf8] tracking-wider uppercase">
                    <span>Step {signupStep} of 4</span>
                    <span className="text-[#9496a1] font-medium lowercase">
                      {signupStep === 1 && 'your name'}
                      {signupStep === 2 && 'business name'}
                      {signupStep === 3 && 'email'}
                      {signupStep === 4 && 'secure password'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((stepNumber) => (
                      <div
                        key={stepNumber}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          stepNumber < signupStep
                            ? 'bg-[#10b981]'
                            : stepNumber === signupStep
                            ? 'bg-[#6366f1]'
                            : 'bg-[#1f202e]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Step 1: Full Name */}
                {signupStep === 1 && (
                  <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="space-y-1">
                      <h3 className="text-[17px] font-bold text-white tracking-tight">
                        What&apos;s your name?
                      </h3>
                      <p className="text-[13px] text-[#9496a1] leading-relaxed">
                        Enter your full name. This will be used for your Vendora account.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#9496a1] mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          autoFocus
                          placeholder="Juan Dela Cruz"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#13141f] text-white text-[14px] pl-10 pr-4 py-3 rounded-xl border border-[#1f202e] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Store Name */}
                {signupStep === 2 && (
                  <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="space-y-1">
                      <h3 className="text-[17px] font-bold text-white tracking-tight">
                        What&apos;s your business called?
                      </h3>
                      <p className="text-[13px] text-[#9496a1] leading-relaxed">
                        This is the name your customers will see on your online store.
                      </p>
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
                          autoFocus
                          placeholder="e.g., Juan's Kitchen Makati"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="w-full bg-[#13141f] text-white text-[14px] pl-10 pr-4 py-3 rounded-xl border border-[#1f202e] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Email Address */}
                {signupStep === 3 && (
                  <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="space-y-1">
                      <h3 className="text-[17px] font-bold text-white tracking-tight">
                        What&apos;s your email address?
                      </h3>
                      <p className="text-[13px] text-[#9496a1] leading-relaxed">
                        We&apos;ll use this email to secure your account and help you sign in.
                      </p>
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
                          autoFocus
                          placeholder="owner@yourstore.ph"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="w-full bg-[#13141f] text-white text-[14px] pl-10 pr-4 py-3 rounded-xl border border-[#1f202e] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Password */}
                {signupStep === 4 && (
                  <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="space-y-1">
                      <h3 className="text-[17px] font-bold text-white tracking-tight">
                        Create your password
                      </h3>
                      <p className="text-[13px] text-[#9496a1] leading-relaxed">
                        Use at least 6 characters. Keep it private and secure.
                      </p>
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
                          autoFocus
                          minLength={6}
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full bg-[#13141f] text-white text-[14px] pl-10 pr-10 py-3 rounded-xl border border-[#1f202e] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
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
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  {signupStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={isLoading}
                      className="px-4 py-3 bg-[#181926] hover:bg-[#202234] border border-[#27273a] text-[#c7d2fe] font-semibold rounded-xl text-[14px] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={!isStepValid() || isLoading}
                    className="flex-1 py-3 bg-[#4f46e5] hover:bg-[#6366f1] text-white font-bold rounded-xl shadow-md text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : signupStep === 4 ? (
                      <>
                        <span>Create My Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-[#050507] text-[#e0e0e2] flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-[#4f46e5] selection:text-white">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="my-8 w-full max-w-md">
        {cardContent}
      </div>
    </div>
  );
};

