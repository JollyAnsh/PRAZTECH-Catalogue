import React from 'react';
import { Lock, AlertCircle, RefreshCw } from 'lucide-react';

interface ExecutiveAuthGateProps {
  isAuthChecking: boolean;
  isLoggingIn: boolean;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  errorMsg: string;
  onLogin: (e: React.FormEvent) => void;
}

export const ExecutiveAuthGate: React.FC<ExecutiveAuthGateProps> = ({
  isAuthChecking,
  isLoggingIn,
  passwordInput,
  setPasswordInput,
  errorMsg,
  onLogin
}) => {
  if (isAuthChecking) {
    return (
      <div className="executive-page min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#f7f5fa]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-7 h-7 text-[#5e3e8b] animate-spin mx-auto" />
          <p className="text-xs text-[#6e568b]">Verifying administrative session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="executive-page min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#f7f5fa]">
      <div className="executive-login-card w-full max-w-md bg-white rounded-xl border border-[#dfd5e8] p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#efe7f7] text-[#5e3e8b] flex items-center justify-center mx-auto border border-[#dfd5e8]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-medium text-xl text-[#2e075d]">
            Executive Dashboard
          </h1>
          <p className="text-xs text-[#6e568b] max-w-xs mx-auto leading-relaxed">
            Restricted portal for PRAZTECH® management, sales engineers, and quotation review.
          </p>
        </div>

        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#2e075d] mb-1.5">
              Executive Access Key
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter access password"
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#cfc6d8] focus:border-[#5e3e8b] focus:outline-none transition-colors"
              autoFocus
              disabled={isLoggingIn}
            />
            {errorMsg && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2.5 bg-[#5e3e8b] hover:bg-[#6e568b] disabled:opacity-60 text-white rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer flex items-center justify-center space-x-2"
          >
            {isLoggingIn && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{isLoggingIn ? 'Authenticating...' : 'Authenticate session'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-[#9080a5] border-t border-[#f0ebf5]">
          PRAZTECH® Engineering • Internal Commercial Portal
        </div>
      </div>
    </div>
  );
};
