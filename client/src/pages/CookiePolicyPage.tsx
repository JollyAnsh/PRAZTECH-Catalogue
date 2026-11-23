import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Shield, Settings2, CheckCircle2, Lock, Info } from 'lucide-react';

export const CookiePolicyPage: React.FC = () => {
  const openCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('open-cookie-settings'));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-[#dfd5e8] pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5e3e8b] font-semibold mb-1">
          <Cookie className="w-4 h-4 text-[#5e3e8b]" />
          <span>TRANSPARENCY & BROWSER STORAGE · EDITION 2026</span>
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#2e075d]">
          Cookie & Local Storage Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#665f6e] mt-2 leading-relaxed">
          This policy explains how PRAZTECH® Engineering uses cookies, browser local storage, and similar technologies to provide our online tooling catalogue and quotation system.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-[#dfd5e8] p-6 sm:p-8 space-y-7 text-xs sm:text-sm text-[#665f6e] leading-relaxed shadow-xs">
        
        {/* Section 1 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Info className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>1. What Are Cookies and Local Storage?</h2>
          </div>
          <p>
            Cookies and browser local storage are small data files stored securely on your computer, tablet, or mobile phone by your web browser when visiting web pages. They enable modern web applications to remember your selections as you browse across different catalogue sections.
          </p>
          <p>
            PRAZTECH® Engineering relies primarily on modern HTML5 <strong>browser local storage</strong> rather than legacy tracking cookies. Local storage remains client-side on your device and is not automatically transmitted to third-party ad networks on every request.
          </p>
        </section>

        {/* Section 2: Inventory */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Lock className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>2. Specific Data Keys Used on this Website</h2>
          </div>
          <p>
            We adhere to the principle of strict data minimization. The table below lists every storage item utilized across this portal:
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#dfd5e8]">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[#f2ecf7] text-[#2e075d] border-b border-[#dfd5e8]">
                  <th className="p-3 font-bold">Storage Key</th>
                  <th className="p-3 font-bold">Category</th>
                  <th className="p-3 font-bold">Purpose</th>
                  <th className="p-3 font-bold">Lifespan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfd5e8]">
                <tr className="bg-white">
                  <td className="p-3 font-mono font-semibold text-[#381c59]">praztech_enquiry_cart_v1</td>
                  <td className="p-3">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">Strictly Necessary</span>
                  </td>
                  <td className="p-3">Saves your selected tools, model numbers, and requested quantities so you can assemble and generate an itemized RFQ quotation PDF.</td>
                  <td className="p-3 font-mono">Persistent (Local)</td>
                </tr>
                <tr className="bg-[#fcfbfe]">
                  <td className="p-3 font-mono font-semibold text-[#381c59]">praztech_custom_enquiries_v1</td>
                  <td className="p-3">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">Strictly Necessary</span>
                  </td>
                  <td className="p-3">Stores any custom tooling dimensions, pilot lengths, or thread requirements added to your quotation.</td>
                  <td className="p-3 font-mono">Persistent (Local)</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3 font-mono font-semibold text-[#381c59]">praztech_compare_list_v1</td>
                  <td className="p-3">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">Strictly Necessary</span>
                  </td>
                  <td className="p-3">Retains the tools you have selected for side-by-side technical comparison on the /compare page.</td>
                  <td className="p-3 font-mono">Persistent (Local)</td>
                </tr>
                <tr className="bg-[#fcfbfe]">
                  <td className="p-3 font-mono font-semibold text-[#381c59]">praztech_cookie_consent_v1</td>
                  <td className="p-3">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">Strictly Necessary</span>
                  </td>
                  <td className="p-3">Records your cookie and consent preferences so you are not prompted repeatedly on every page reload.</td>
                  <td className="p-3 font-mono">12 Months</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Shield className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>3. Third-Party Tracking & Advertising</h2>
          </div>
          <p>
            PRAZTECH® Engineering <strong>does not use cross-site behavioral tracking cookies, Facebook pixels, Google Remarketing, or ad exchange beacons</strong>. We do not participate in cross-context behavioral ad networks and do not monetize visitor browsing data.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Settings2 className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>4. Managing and Changing Your Preferences</h2>
          </div>
          <p>
            You can modify your consent settings at any time using our on-site preference manager:
          </p>

          <div className="p-4 bg-[#f7f4fa] rounded-xl border border-[#dfd5e8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <strong className="block text-[#2e075d] text-xs font-bold">Cookie & Storage Preferences</strong>
              <span className="text-[11px] text-[#6e568b]">Re-open the preferences dialog to update your choices.</span>
            </div>
            <button
              type="button"
              onClick={openCookieSettings}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#381c59] hover:bg-[#2e075d] transition-colors shadow-xs cursor-pointer shrink-0"
            >
              Open Cookie Settings
            </button>
          </div>

          <p>
            Additionally, all modern desktop and mobile browsers provide controls to view, clear, or block local storage and cookies through browser settings (typically under <em>Privacy & Security → Cookies and Site Data</em>).
          </p>
        </section>

        {/* Contact Info */}
        <div className="pt-4 border-t border-[#dfd5e8] text-xs text-[#6e568b]">
          For technical or privacy inquiries, contact our data administrator at <a href="mailto:xiscoenterprises@gmail.com" className="text-[#2e075d] font-semibold underline">xiscoenterprises@gmail.com</a>.
        </div>

      </div>
    </div>
  );
};