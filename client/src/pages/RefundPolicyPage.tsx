import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCcw, ShieldCheck, AlertCircle, CheckCircle2, Truck, Wrench } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-[#dfd5e8] pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5e3e8b] font-semibold mb-1">
          <RefreshCcw className="w-4 h-4 text-[#5e3e8b]" />
          <span>COMMERCIAL TOOLING POLICIES · EDITION 2026</span>
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#2e075d]">
          Refund and Cancellation Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#665f6e] mt-2 leading-relaxed">
          Clear, transparent commercial terms governing quotations, order cancellations, transit inspections, and warranty replacements for precision tooling manufactured by PRAZTECH® Engineering.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-[#dfd5e8] p-6 sm:p-8 space-y-7 text-xs sm:text-sm text-[#665f6e] leading-relaxed shadow-xs">
        
        {/* Section 1 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>1. Quotation & Pre-Order Cancellation</h2>
          </div>
          <p>
            Generating an itemized quotation through the Enquiry Cart is completely complimentary and imposes no commercial purchase obligation. You may cancel, modify, or decline a quotation request at any time prior to formal proforma confirmation without incurring fees or charges.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Wrench className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>2. Standard Catalog Tools vs. Custom Tooling</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-[#dfd5e8] bg-[#fcfbfe] space-y-2">
              <strong className="block text-[#2e075d] font-bold text-xs uppercase tracking-wider">
                Standard Catalog Stock
              </strong>
              <p className="text-xs text-[#665f6e] leading-relaxed">
                Standard catalog products (such as off-the-shelf grinding stones, diamond dressers, standard pilot holders, and cylinder hones) may be canceled prior to dispatch for a full refund or credit note.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#dfd5e8] bg-[#fcfbfe] space-y-2">
              <strong className="block text-[#2e075d] font-bold text-xs uppercase tracking-wider">
                Custom-Machined Tooling
              </strong>
              <p className="text-xs text-[#665f6e] leading-relaxed">
                Special order items—including custom expanding reamers, non-standard pilot stems, specialized stone holders, or custom threaded tooling manufactured to customer blueprints—cannot be canceled once lathe turning, grinding, or heat treatment has commenced.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Truck className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>3. Delivery Inspection & Transit Damage Protocol</h2>
          </div>
          <p>
            All precision tooling is packed in robust, export-grade packaging with protective coatings. Upon receiving your shipment:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#2e075d]">
            <li>Inspect the consignment packaging immediately upon carrier delivery.</li>
            <li>If external transit damage or crushed wooden/cardboard cases are observed, endorse the carrier receipt as <em>"Damaged in Transit"</em>.</li>
            <li>Report visible transit defects or missing items to PRAZTECH® Engineering within <strong>7 calendar days</strong> of delivery with clear photographs and consignment notes.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <ShieldCheck className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>4. Manufacturing Warranty & Defect Replacements</h2>
          </div>
          <p>
            PRAZTECH® Engineering guarantees that all supplied tools conform to published dimensional specifications and are free from metallurgical defects or concentricity runout errors when used under standard workshop conditions.
          </p>
          <p>
            If a tool exhibits a verified manufacturing discrepancy (such as out-of-spec pilot runout, unhardened reamer blades, or defective holder ball bearings):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#2e075d]">
            <li>We will issue a Return Merchandise Authorization (RMA) number.</li>
            <li>Upon factory inspection of the returned component, PRAZTECH® will immediately dispatch a replacement unit or issue a full credit note at our expense.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <AlertCircle className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>5. Non-Eligible Conditions</h2>
          </div>
          <p>
            Refunds or warranty claims are not granted in situations involving:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#665f6e]">
            <li>Standard abrasive stone wear, stone consumption, or normal tool attrition resulting from operational grinding and honing.</li>
            <li>Tool breakage resulting from excessive machine feed rates, improper spindle alignment, or dropping tools on workshop floors.</li>
            <li>Customer-specified custom dimensions that were correctly produced according to customer-supplied blueprints.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>6. Initiating an RMA or Cancellation</h2>
          </div>
          <p>
            To initiate an order cancellation or report a delivery issue, please contact our commercial customer support team:
          </p>
          <div className="bg-[#f7f4fa] p-4 rounded-xl border border-[#dfd5e8] space-y-1 font-mono text-xs text-[#2e075d]">
            <div><strong>PRAZTECH® Engineering Commercial Claims</strong></div>
            <div>Facility: Asaf Ali Rd, Delhi, 110002, India</div>
            <div>Email: <a href="mailto:xiscoenterprises@gmail.com" className="underline text-[#5e3e8b]">xiscoenterprises@gmail.com</a></div>
            <div>WhatsApp / Telephone: +91 8744020102</div>
            <div>Hours: Monday to Saturday, 9:00 AM – 6:30 PM IST</div>
          </div>
        </section>

      </div>
    </div>
  );
};