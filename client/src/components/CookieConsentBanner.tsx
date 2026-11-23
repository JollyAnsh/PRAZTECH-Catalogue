import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Cookie, X, Settings2 } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'praztech_cookie_consent_v1';

export const CookieConsentBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [functionalConsent, setFunctionalConsent] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Small delay so it appears smoothly after page load
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      } else {
        const parsed: CookiePreferences = JSON.parse(saved);
        setFunctionalConsent(parsed.functional ?? true);
        setAnalyticsConsent(parsed.analytics ?? false);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  // Listen for custom event to open preferences from anywhere (e.g. Footer, Cookie Policy page)
  useEffect(() => {
    const handleOpenSettings = () => {
      setShowPreferences(true);
      setIsOpen(true);
    };
    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
  }, []);

  const savePreferences = (functional: boolean, analytics: boolean) => {
    const prefs: CookiePreferences = {
      essential: true, // Always required for cart/quotations
      functional,
      analytics,
      timestamp: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Unable to save cookie preferences', e);
    }
    setFunctionalConsent(functional);
    setAnalyticsConsent(analytics);
    setIsOpen(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    savePreferences(true, true);
  };

  const handleRejectNonEssential = () => {
    savePreferences(false, false);
  };

  const handleSaveCustom = () => {
    savePreferences(functionalConsent, analyticsConsent);
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-3 animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-4xl mx-auto bg-white border border-[#dfd5e8] rounded-xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] p-2.5 sm:p-3.5 text-left text-xs relative">
        
        {!showPreferences ? (
          /* Sleek Compact Banner View */
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-center space-x-2 text-[11px] sm:text-xs text-slate-700 leading-tight">
              <Cookie className="w-4 h-4 text-[#381c59] shrink-0" />
              <span>
                <strong className="text-[#18022e] font-bold">Cookies & Storage:</strong>{' '}
                We use essential browser storage for your quotation cart and tool comparison. See our{' '}
                <Link to="/privacy" className="text-[#381c59] font-bold underline hover:text-[#5e3e8b]">
                  Privacy Policy
                </Link>
                .
              </span>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-auto text-[11px]">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-[#2e075d] underline cursor-pointer"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-2.5 py-1 rounded-lg font-semibold text-slate-700 hover:text-black bg-[#f7f4fa] hover:bg-[#ede5f7] border border-[#dfd5e8] transition-colors cursor-pointer"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-3 py-1 rounded-lg font-semibold text-white bg-[#381c59] hover:bg-[#24064a] transition-colors shadow-xs cursor-pointer"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          /* Detailed Preferences Modal View */
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#dfd5e8]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-[#ede5f7] text-[#381c59] flex items-center justify-center border border-[#dfd5e8]">
                  <Settings2 className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-heading font-bold text-xs sm:text-sm text-[#18022e]">
                  Manage Storage Preferences
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="p-1 rounded hover:bg-[#ede5f7] text-slate-600 hover:text-black transition-colors cursor-pointer"
                aria-label="Close preferences"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {/* Category 1: Strictly Necessary */}
              <div className="p-2.5 bg-[#f7f4fa] rounded-lg border border-[#dfd5e8] space-y-0.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-bold text-[#2e075d]">
                    <Shield className="w-3.5 h-3.5 text-[#5e3e8b]" />
                    <span>Strictly Necessary Storage</span>
                  </div>
                  <span className="text-[9px] font-mono font-semibold bg-[#ede5f7] text-[#2e075d] px-1.5 py-0.2 rounded border border-[#dfd5e8]">
                    Always Active
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug">
                  Persists your quotation cart items (<code className="text-[#381c59]">praztech_enquiry_cart_v1</code>), tool comparison list, and consent memory.
                </p>
              </div>

              {/* Category 2: Functional Preferences */}
              <div className="p-2.5 bg-white rounded-lg border border-[#dfd5e8] space-y-0.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <label htmlFor="functional-toggle" className="font-bold text-[#2e075d] cursor-pointer">
                    Functional Preferences
                  </label>
                  <input
                    id="functional-toggle"
                    type="checkbox"
                    checked={functionalConsent}
                    onChange={(e) => setFunctionalConsent(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#381c59] focus:ring-[#5e3e8b] cursor-pointer"
                  />
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug">
                  Retains preferred display view modes (Grid vs. List) and custom tooling drafts.
                </p>
              </div>

              {/* Category 3: Analytical Metrics */}
              <div className="p-2.5 bg-white rounded-lg border border-[#dfd5e8] space-y-0.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <label htmlFor="analytics-toggle" className="font-bold text-[#2e075d] cursor-pointer">
                    Anonymous Performance Metrics
                  </label>
                  <input
                    id="analytics-toggle"
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#381c59] focus:ring-[#5e3e8b] cursor-pointer"
                  />
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug">
                  Allows anonymous performance diagnostics. No cross-site tracking or advertising pixels.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#dfd5e8] flex items-center justify-between gap-2 text-[11px]">
              <Link
                to="/cookies"
                onClick={() => { setIsOpen(false); setShowPreferences(false); }}
                className="text-[#5e3e8b] hover:text-[#2e075d] underline font-medium"
              >
                Full Cookie Policy
              </Link>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-black border border-[#dfd5e8] transition-colors cursor-pointer font-medium"
                >
                  Reject All
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-3 py-1 rounded-lg text-white bg-[#381c59] hover:bg-[#24064a] transition-colors shadow-xs cursor-pointer font-semibold"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};