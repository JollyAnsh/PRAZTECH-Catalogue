import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SlidersHorizontal, X, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export const CompareDrawer: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCart();
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);

  // Hidden on compare page or when list is empty
  if (compareList.length === 0 || location.pathname === '/compare') return null;

  return (
    <aside
      aria-label="Product comparison tray"
      className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#24064a] via-[#381c59] to-[#2e075d] border-t border-[#5e3e8b]/60 text-white shadow-2xl transition-all duration-300"
      style={{
        paddingBottom: 'max(0.5rem, calc(0.375rem + env(safe-area-inset-bottom, 0px)))'
      }}
    >
      {isMinimized ? (
        // Minimized / Collapsed Mobile Pill View
        <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center justify-between text-xs">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center space-x-2 text-white hover:text-[#dcd5e4] transition-colors cursor-pointer"
            aria-expanded="false"
            aria-label="Expand comparison tray"
          >
            <div className="p-1 bg-[#1e053d] rounded-md border border-[#5e3e8b]/50">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#b5a8c8]" />
            </div>
            <span className="font-medium text-xs">Compare Tools ({compareList.length}/4)</span>
            <ChevronUp className="w-3.5 h-3.5 text-[#b5a8c8]" />
          </button>

          <Link
            to="/compare"
            className="inline-flex items-center space-x-1 px-3 py-1 bg-[#5e3e8b] hover:bg-[#6e568b] text-white rounded-md text-xs font-medium transition-colors border border-[#b5a8c8]/40 shadow-xs"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        // Expanded Full Tray View
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 xs:gap-3 sm:gap-4">
          
          {/* Left: Compact Indicator, Title & Minimize Toggle */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="p-1.5 bg-[#1e053d] rounded-md shrink-0 border border-[#5e3e8b]/50">
              <SlidersHorizontal className="w-4 h-4 text-[#b5a8c8]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-xs sm:text-sm text-white">Compare</span>
                <span className="bg-[#381c59] border border-[#5e3e8b]/50 text-[11px] px-1.5 py-0.2 rounded font-mono text-[#dcd5e4]">
                  {compareList.length}/4
                </span>
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="sm:hidden p-1 text-[#b5a8c8] hover:text-white rounded transition-colors"
                  title="Minimize drawer"
                  aria-label="Minimize comparison tray"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Middle: Horizontal Thumbnails */}
          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-[110px] xs:max-w-[150px] sm:max-w-md py-0.5 scrollbar-none">
            {compareList.map(prod => {
              const prodId = prod.id || (prod as any)._id || prod.slug;
              return (
                <div
                  key={prodId}
                  className="relative bg-[#1e053d] border border-[#5e3e8b]/40 rounded-md p-1 flex items-center space-x-1.5 shrink-0 pr-4 sm:pr-5 shadow-xs"
                >
                  <img
                    src={prod.images[0] || `/images/placeholders/${prod.slug}.svg`}
                    alt={prod.modelNo}
                    className="w-6 h-6 rounded object-contain bg-white p-0.5 border border-[#dfd5e8]"
                  />
                  <span className="text-[11px] font-mono text-[#dcd5e4] max-w-[70px] truncate hidden sm:inline">
                    {prod.modelNo}
                  </span>
                  <button
                    onClick={() => removeFromCompare(prodId)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-[#b5a8c8] hover:text-white cursor-pointer"
                    title={`Remove ${prod.modelNo}`}
                    aria-label={`Remove ${prod.modelNo} from comparison`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              onClick={clearCompare}
              className="px-2 py-1 text-xs text-[#dcd5e4] hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>

            <Link
              to="/compare"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#5e3e8b] hover:bg-[#6e568b] text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap shadow-md border border-[#b5a8c8]/40 cursor-pointer"
            >
              <span>Compare</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      )}
    </aside>
  );
};
