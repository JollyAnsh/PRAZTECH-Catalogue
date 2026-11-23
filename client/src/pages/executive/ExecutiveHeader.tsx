import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, FileSpreadsheet, ExternalLink, Lock } from 'lucide-react';

interface ExecutiveHeaderProps {
  loadingData: boolean;
  onSync: () => void;
  onExportExcel: () => void;
  onLogout: () => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  loadingData,
  onSync,
  onExportExcel,
  onLogout
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center space-x-2 bg-white border border-[#dfd5e8] px-3 py-1.5 rounded-lg text-xs text-[#5e3e8b] font-medium shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Commercial Portal • Active Session</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={onSync}
          disabled={loadingData}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#f7f5fa] text-[#2e075d] text-xs font-medium border border-[#dfd5e8] transition-colors cursor-pointer"
          title="Reload live database collections"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
          <span>{loadingData ? 'Syncing...' : 'Sync Atlas'}</span>
        </button>

        <button
          onClick={onExportExcel}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium transition-colors cursor-pointer"
          title="Download complete B2B Excel workbook"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Export All Excel</span>
        </button>

        <Link
          to="/catalogue"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#f7f5fa] text-[#2e075d] text-xs font-medium border border-[#dfd5e8] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#5e3e8b]" />
          <span>Storefront</span>
        </Link>

        <button
          onClick={onLogout}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#2e075d] hover:bg-[#381c59] text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock</span>
        </button>
      </div>
    </div>
  );
};
