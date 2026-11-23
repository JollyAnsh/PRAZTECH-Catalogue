import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, UserCheck, Mail, Building } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-[#dfd5e8] pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5e3e8b] font-semibold mb-1">
          <Shield className="w-4 h-4 text-[#5e3e8b]" />
          <span>DATA PROTECTION & PRIVACY STANDARDS · EDITION 2026</span>
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#2e075d]">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#665f6e] mt-2 leading-relaxed">
          How PRAZTECH® Engineering collects, protects, processes, and respects commercial customer information in compliance with the Digital Personal Data Protection (DPDP) Act 2023 and international privacy standards.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-[#dfd5e8] p-6 sm:p-8 space-y-7 text-xs sm:text-sm text-[#665f6e] leading-relaxed shadow-xs">
        
        {/* Section 1 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Building className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>1. Identity of the Data Fiduciary</h2>
          </div>
          <p>
            This website is owned and operated by <strong>PRAZTECH® Engineering</strong>, located at Asaf Ali Rd, Delhi, 110002, India. For all privacy, data processing, and compliance inquiries, you may reach our designated data administrator directly at <a href="mailto:xiscoenterprises@gmail.com" className="text-[#2e075d] font-semibold underline font-mono">xiscoenterprises@gmail.com</a>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Database className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>2. Purpose & Principles of Data Collection</h2>
          </div>
          <p>
            PRAZTECH® Engineering operates strictly as a <strong>Business-to-Business (B2B) digital tooling showcase and technical quotation portal</strong>. <em>This is not a retail e-commerce website</em>: we do not accept, collect, or store payment cards, debit card numbers, CVVs, or financial credentials.
          </p>
          <p>
            We strictly limit data collection to what is necessary for responding to commercial inquiries and preparing engineering quotations:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#2e075d]">
            <li><strong>Mandatory RFQ information:</strong> Full Name, Business Email Address, Phone Number, Country, State, and City.</li>
            <li><strong>Optional commercial details:</strong> Company Name, WhatsApp Number, Delivery Street Address, and GSTIN / Tax Registration ID (utilized strictly for commercial invoice documentation).</li>
            <li><strong>Technical tooling requirements:</strong> Selected catalog tool models, requested quantities, workpiece application notes, and custom reamer specifications.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Eye className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>3. Third-Party Sharing & Marketing Prohibitions</h2>
          </div>
          <p>
            PRAZTECH® Engineering maintains a strict anti-monetization stance on customer data:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#2e075d]">
            <li>We do not sell, rent, lease, or monetize customer records to third-party data brokers or advertisers.</li>
            <li>We do not employ cross-site tracking pixels (such as Meta pixel or Google Ads remarketing).</li>
            <li>Your contact information is shared strictly with essential transactional infrastructure (such as transactional email delivery for sending quotation reference PDFs).</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Lock className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>4. Security Safeguards & Data Retention</h2>
          </div>
          <p>
            All data transmitted between your web browser and our servers is encrypted in transit using <strong>Transport Layer Security (TLS/HTTPS)</strong>. Stored customer quotation requests are protected by restricted, authenticated database access.
          </p>
          <p>
            <strong>Retention Period:</strong> Quotation requests and custom tooling specifications are retained for a period of up to three (3) years to facilitate repeat tooling orders, warranty verification, and commercial recordkeeping, after which records are securely archived or expunged upon customer request.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <UserCheck className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>5. Your Rights as a Data Principal</h2>
          </div>
          <p>
            Under applicable data protection laws (including the India DPDP Act 2023 and GDPR for international visitors), you have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#2e075d]">
            <li><strong>Right to Access:</strong> Request a summary of personal information and quotation history stored in our records.</li>
            <li><strong>Right to Correction:</strong> Request updates or corrections to misspelled company names, delivery addresses, or contact details.</li>
            <li><strong>Right to Erasure:</strong> Request the deletion of your contact profile from our active marketing and communication channels.</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw previously granted consent for technical quotation follow-ups at any time.</li>
          </ul>
          <p>
            To exercise any of these rights, email your request to <a href="mailto:xiscoenterprises@gmail.com" className="text-[#381c59] font-bold underline font-mono">xiscoenterprises@gmail.com</a> with the subject line <em>"Data Privacy Request"</em>. Requests are processed within 15 business days.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2.5">
          <div className="flex items-center space-x-2 text-[#2e075d] font-bold text-sm sm:text-base">
            <Mail className="w-4 h-4 text-[#5e3e8b] shrink-0" />
            <h2>6. Cookie & Local Storage Notice</h2>
          </div>
          <p>
            This website uses local browser storage for strictly necessary functions, including saving your selected enquiry items and tool comparisons. For complete details on specific storage keys and how to manage your consent, view our dedicated <Link to="/cookies" className="text-[#5e3e8b] font-bold underline">Cookie Policy</Link>.
          </p>
        </section>

        {/* Contact Footer */}
        <div className="pt-4 border-t border-[#dfd5e8] text-xs text-[#6e568b] font-mono">
          PRAZTECH® Engineering · Asaf Ali Rd, Delhi, 110002, India · Direct data inquiries: xiscoenterprises@gmail.com
        </div>

      </div>
    </div>
  );
};