import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldAlert, Scale, CheckCircle2, Building, Wrench } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-[#dfd5e8] pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5e3e8b] font-semibold mb-1">
          <Scale className="w-4 h-4 text-[#5e3e8b]" />
          <span>LEGAL & COMMERCIAL FRAMEWORK · EDITION 2026</span>
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#2e075d]">
          Terms and Conditions
        </h1>
        <p className="text-xs sm:text-sm text-[#665f6e] mt-2 leading-relaxed">
          These Terms and Conditions govern your use of the PRAZTECH® Engineering website, digital product catalogue, and technical Request for Quotation (RFQ) portal.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-[#dfd5e8] p-6 sm:p-8 space-y-7 text-xs sm:text-sm text-[#665f6e] leading-relaxed shadow-xs">
        
        {/* Section 1 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Building className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>1. Nature of Website & Commercial Operation</h2>
          </div>
          <p>
            PRAZTECH® Engineering operates this portal strictly as a <strong>Business-to-Business (B2B) digital tooling showcase and technical quotation portal</strong>. This website is not a retail consumer e-commerce store and does not accept or process direct payment cards or online transactions.
          </p>
          <p>
            Submissions made through the Enquiry Cart or Custom Tooling forms constitute a non-binding <em>Request for Quotation (RFQ)</em>. No binding contract of sale is formed until PRAZTECH® Engineering issues an official commercial proforma invoice and quotation agreement confirmed in writing by both parties.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Wrench className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>2. Technical Specifications & Precision Tolerances</h2>
          </div>
          <p>
            All products listed in this catalogue—including valve seat grinding stones, diamond dressers, dual-drive stone holders (Star and Hex drive), cylinder hones, and HSS expanding pilot reamers—are manufactured to rigid workshop tolerances.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#2e075d]">
            <li>
              <strong>Standard catalog dimensions:</strong> Dimensions, threads (e.g. 11/16″, 7/16″), pilot diameters (4 mm–12 mm), and grit grades (120, 180, 220, 320) are provided as engineering specifications for workshop machinery compatibility.
            </li>
            <li>
              <strong>Custom tooling submissions:</strong> When submitting custom tool requests, reamer expansion ranges, or pilot drawings, the customer is responsible for the dimensional accuracy, guide bushing tolerances, and metallurgical suitability of the specified workpiece.
            </li>
            <li>
              PRAZTECH® Engineering reserves the right to modify non-critical component finishes or manufacturing markings without compromising functional concentricity or operational performance.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Scale className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>3. Commercial Quotations & Pricing</h2>
          </div>
          <p>
            Catalog reference items do not display fixed retail prices because commercial pricing depends on order volumes, delivery locations, custom pilot dimensions, and applicable export duties or GST.
          </p>
          <p>
            Itemized quotations provided by our commercial team are valid for the timeframe stated in the formal proforma document (typically 30 calendar days from issuance) unless raw material or freight surcharges necessitate prior written revision.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <FileText className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>4. Intellectual Property & Brand Ownership</h2>
          </div>
          <p>
            All trademarks, logos, brand assets, product catalog photographs, technical schematics, model designations (e.g., PSH-VGKP, PSVSC, PSS-HEX), and software code on this website are the proprietary intellectual property of <strong>PRAZTECH® Engineering</strong>.
          </p>
          <p>
            No portion of this catalogue may be copied, reproduced, redistributed, scraped, or republished for unauthorized commercial resale or imitation tooling manufacture without prior written consent from PRAZTECH® Engineering.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <ShieldAlert className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>5. Workshop Safety & Tooling Operation Disclaimer</h2>
          </div>
          <p>
            Internal combustion engine valve seat grinding, cylinder honing, and high-speed pilot reaming involve industrial machine shop operations. Tools must only be operated by qualified machinists utilizing recommended eye, lung, and personal protective equipment (PPE).
          </p>
          <p>
            PRAZTECH® Engineering is not liable for indirect, incidental, or consequential damages resulting from improper workpiece clamping, machine spindle misalignment, incorrect abrasive grit selection, or exceeding recommended RPM guidelines.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>6. Governing Jurisdiction & Legal Contact</h2>
          </div>
          <p>
            These Terms and any technical quotation agreements arising from this portal shall be governed by and construed in accordance with the substantive laws of <strong>India</strong>. Any disputes arising in connection with commercial transactions shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Delhi, India</strong>.
          </p>
          <div className="bg-[#f7f4fa] p-4 rounded-xl border border-[#dfd5e8] space-y-1 font-mono text-xs text-[#2e075d]">
            <div><strong>PRAZTECH® Engineering</strong></div>
            <div>Facility: Asaf Ali Rd, Delhi, 110002, India</div>
            <div>Commercial Inquiries: <a href="mailto:xiscoenterprises@gmail.com" className="underline text-[#5e3e8b]">xiscoenterprises@gmail.com</a></div>
            <div>Telephone / WhatsApp: +91 8744020102</div>
          </div>
        </section>

      </div>
    </div>
  );
};