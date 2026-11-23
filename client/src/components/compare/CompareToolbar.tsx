import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

interface CompareToolbarProps {
  compareCount: number;
  totalDifferences: number;
  highlightDiff: boolean;
  setHighlightDiff: (val: boolean) => void;
  hideIdentical: boolean;
  setHideIdentical: (val: boolean) => void;
  onClear: () => void;
}

export const CompareToolbar: React.FC<CompareToolbarProps> = ({
  compareCount,
  totalDifferences,
  highlightDiff,
  setHighlightDiff,
  hideIdentical,
  setHideIdentical,
  onClear
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-[#dfd5e8] gap-4">
      <div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#2e075d]">
          Technical Specification Comparison
        </h1>
        <p className="text-xs sm:text-sm text-[#665f6e] mt-1">
          Comparing <strong className="text-[#2e075d] font-semibold">{compareCount}</strong> tools •{' '}
          <span className="text-[#6e568b] font-medium">{totalDifferences} attributes differ</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center space-x-3 bg-[#ede5f7]/60 px-3 py-1.5 rounded-lg border border-[#dfd5e8] text-xs">
          <label className="flex items-center space-x-1.5 cursor-pointer text-[#2e075d] select-none font-medium">
            <input
              type="checkbox"
              checked={highlightDiff}
              onChange={(e) => setHighlightDiff(e.target.checked)}
              className="rounded text-[#381c59] focus:ring-[#5e3e8b] w-3.5 h-3.5 cursor-pointer"
            />
            <span>Highlight differences</span>
          </label>

          <span className="text-[#dfd5e8]">|</span>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[#2e075d] select-none font-medium">
            <input
              type="checkbox"
              checked={hideIdentical}
              onChange={(e) => setHideIdentical(e.target.checked)}
              className="rounded text-[#381c59] focus:ring-[#5e3e8b] w-3.5 h-3.5 cursor-pointer"
            />
            <span>Hide identical</span>
          </label>
        </div>

        <button
          onClick={onClear}
          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <Link
          to="/catalogue"
          className="px-3.5 py-1.5 text-xs font-semibold text-[#2e075d] bg-[#ede5f7] hover:bg-[#e2d5f2] rounded-lg border border-[#dfd5e8] transition-colors"
        >
          + Add product
        </Link>
      </div>
    </div>
  );
};
