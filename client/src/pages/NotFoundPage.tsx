import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Home, Wrench, Search, PhoneCall } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Error Badge & Icon */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ede5f7] border border-[#dfd5e8] text-[#5e3e8b] shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-[#5e3e8b] bg-[#ede5f7] px-3 py-1 rounded-full border border-[#dfd5e8] uppercase tracking-wider">
              Error 404 • Resource Not Found
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#2e075d] tracking-tight">
              Page or Specification Not Found
            </h1>
            <p className="text-sm sm:text-base text-[#665f6e] max-w-lg mx-auto leading-relaxed">
              The requested catalogue address or technical page does not exist or has been relocated within the standard manufacturing programme.
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/catalogue"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#381c59] hover:bg-[#2e075d] text-white font-medium text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Browse complete catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white hover:bg-[#ede5f7] text-[#2e075d] font-medium text-xs rounded-xl border border-[#dfd5e8] shadow-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to homepage</span>
          </Link>
        </div>

        {/* Quick Category Directory */}
        <div className="bg-white rounded-2xl border border-[#dfd5e8] p-5 sm:p-6 text-left shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#dfd5e8]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2e075d] flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#5e3e8b]" />
              <span>Standard Product Categories</span>
            </span>
            <span className="text-[11px] text-[#6e568b]">Fast navigation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <Link
              to="/catalogue?category=valve-seat-grinding-tools"
              className="p-3 rounded-lg bg-[#f7f4fa] hover:bg-[#ede5f7] text-[#2e075d] font-medium border border-[#dfd5e8] transition-colors flex items-center justify-between group"
            >
              <span>Valve Seat Grinding Tools</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6e568b] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/catalogue?category=honing-and-boring-tools"
              className="p-3 rounded-lg bg-[#f7f4fa] hover:bg-[#ede5f7] text-[#2e075d] font-medium border border-[#dfd5e8] transition-colors flex items-center justify-between group"
            >
              <span>Honing & Boring Tools</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6e568b] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/catalogue?category=valve-seat-cutting-tools"
              className="p-3 rounded-lg bg-[#f7f4fa] hover:bg-[#ede5f7] text-[#2e075d] font-medium border border-[#dfd5e8] transition-colors flex items-center justify-between group"
            >
              <span>Valve Seat Cutting Tools</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6e568b] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/custom-enquiry"
              className="p-3 rounded-lg bg-[#f7f4fa] hover:bg-[#ede5f7] text-[#2e075d] font-medium border border-[#dfd5e8] transition-colors flex items-center justify-between group"
            >
              <span>Custom Tooling Specifications</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6e568b] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="pt-2 text-center text-xs text-[#665f6e] border-t border-[#dfd5e8]">
            Need immediate engineering assistance?{' '}
            <Link to="/contact" className="text-[#5e3e8b] font-semibold hover:underline inline-flex items-center gap-1">
              <PhoneCall className="w-3 h-3" />
              <span>Contact engineering support</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;
