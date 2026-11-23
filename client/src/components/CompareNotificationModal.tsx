import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { SlidersHorizontal, AlertTriangle, X } from 'lucide-react';

export const CompareNotificationModal: React.FC = () => {
  const {
    compareNotification,
    dismissCompareNotification,
    compareList
  } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissCompareNotification();
      }
    };
    if (compareNotification) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [compareNotification, dismissCompareNotification]);

  if (!compareNotification) return null;

  const isCategoryMismatch = compareNotification.type === 'category_mismatch';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2e075d]/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          dismissCompareNotification();
        }
      }}
    >
      <div className="bg-white rounded-2xl border border-[#dfd5e8] shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 relative animate-in zoom-in-95 duration-150 text-left">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isCategoryMismatch
                ? 'bg-[#ede5f7] text-[#5e3e8b] border-[#dfd5e8]'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              {isCategoryMismatch ? (
                <SlidersHorizontal className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6e568b]">
                {isCategoryMismatch ? 'Category Constraint' : 'Comparison Limit'}
              </span>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#2e075d] leading-snug">
                {compareNotification.title}
              </h3>
            </div>
          </div>

          <button
            onClick={dismissCompareNotification}
            className="p-1.5 rounded-lg hover:bg-[#ede5f7] text-[#665f6e] hover:text-[#2e075d] transition-colors cursor-pointer"
            title="Close"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {isCategoryMismatch ? (
          <div className="space-y-3">
            <p className="text-xs text-[#665f6e] leading-relaxed">
              Comparison is only available between products within the same tooling category so that stone specifications, holder pilots, and dimensions align accurately.
            </p>

            {/* Visual Category Comparison Box */}
            <div className="bg-[#f7f4fa] rounded-xl p-3 border border-[#dfd5e8] space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#665f6e] text-[11px]">Currently in comparison:</span>
                <span className="font-semibold text-[#2e075d] bg-[#ede5f7] px-2 py-0.5 rounded text-[11px] truncate max-w-[190px]">
                  {compareNotification.activeCategory} ({compareList.length} tools)
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#dfd5e8]/60">
                <span className="text-[#665f6e] text-[11px]">Selected tool category:</span>
                <span className="font-semibold text-[#5e3e8b] bg-white border border-[#dfd5e8] px-2 py-0.5 rounded text-[11px] truncate max-w-[190px]">
                  {compareNotification.newCategory}
                </span>
              </div>
            </div>

            {/* Selected Tool Preview */}
            {compareNotification.pendingProduct && (
              <div className="flex items-center space-x-2.5 bg-[#ede5f7]/30 p-2.5 rounded-xl border border-[#dfd5e8] text-xs">
                <span className="font-mono font-bold text-[#2e075d] bg-white px-1.5 py-0.5 rounded border border-[#dfd5e8] text-[10px] shrink-0">
                  {compareNotification.pendingProduct.modelNo}
                </span>
                <span className="font-medium text-[#2e075d] truncate">
                  {compareNotification.pendingProduct.name}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#665f6e] leading-relaxed">
              {compareNotification.message}
            </p>
            <div className="bg-[#ede5f7]/40 rounded-xl p-3 border border-[#dfd5e8] text-xs text-[#2e075d]">
              Please remove at least one product from your comparison list before adding a new one.
            </div>
          </div>
        )}

        {/* Footer Action */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={dismissCompareNotification}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#381c59] hover:bg-[#2e075d] transition-colors shadow-xs cursor-pointer text-center"
          >
            Okay
          </button>
        </div>

      </div>
    </div>
  );
};