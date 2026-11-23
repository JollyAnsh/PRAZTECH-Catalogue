import React from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';

export const CompareEmptyState: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#ede5f7] text-[#2e075d] flex items-center justify-center mx-auto border border-[#dfd5e8]">
        <SlidersHorizontal className="w-8 h-8" />
      </div>
      <div>
        <h1 className="font-heading font-bold text-2xl text-[#2e075d]">
          No products selected for comparison
        </h1>
        <p className="text-sm text-[#665f6e] mt-2 max-w-md mx-auto leading-relaxed">
          Select up to 4 precision tooling products from our catalogue to compare technical parameters, valve seat grinding tolerances, and size configurations side-by-side.
        </p>
      </div>
      <Link
        to="/catalogue"
        className="inline-flex items-center space-x-2 px-6 py-3 bg-[#381c59] hover:bg-[#2e075d] text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
      >
        <span>Browse full catalogue</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
