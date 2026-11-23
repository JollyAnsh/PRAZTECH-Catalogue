import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { EnquiryResponseData } from '../types';
import { formatDateDDMMYY } from '../utils/dateFormat';
import { generateClientSideEnquiryPDF } from '../utils/clientPdfGenerator';
import {
  CheckCircle2,
  Download,
  Printer,
  FileText,
  Mail,
  ArrowRight,
  Clock,
  RefreshCw
} from 'lucide-react';

export const ConfirmationPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const location = useLocation();

  const [enquiry, setEnquiry] = useState<EnquiryResponseData | null>(() => {
    return (location.state as any)?.enquiryData || null;
  });
  const [loading, setLoading] = useState(!enquiry);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!enquiry && reference) {
      setLoading(true);
      api.getEnquiry(reference)
        .then(data => setEnquiry(data))
        .catch(err => console.error('Failed to load enquiry record', err))
        .finally(() => setLoading(false));
    }
  }, [reference, enquiry]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    const ref = reference || enquiry?.referenceNumber;

    // 1. Attempt official backend PDF download
    if (ref) {
      try {
        const res = await fetch(`/api/enquiries/${ref}/download`, {
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/pdf')) {
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `PRAZTECH_Enquiry_${ref}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
            setIsDownloadingPdf(false);
            return;
          }
        }
      } catch (backendErr) {
        console.warn('Backend PDF endpoint unavailable, generating client-side PDF fallback:', backendErr);
      }
    }

    // 2. Client-side PDF fallback via jsPDF
    try {
      generateClientSideEnquiryPDF(enquiry, ref);
    } catch (fallbackErr) {
      console.error('Failed to generate client-side PDF:', fallbackErr);
      alert('Could not download PDF. Please use the Print Receipt button to print or save as PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-industrial-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-industrial-600">Retrieving submitted quotation record...</p>
      </div>
    );
  }

  const cust = enquiry?.customer || (enquiry as any)?.customerSnapshot || {};
  const catItems = enquiry?.catalogueItems || [];
  const custItems = enquiry?.customItems || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 print-receipt-container">
      
      {/* Hidden during screen, displayed exclusively when printing via @media print */}
      <div className="hidden print-header text-left">
        <div className="flex justify-between items-center pb-4 border-b border-industrial-900">
          <img
            src="/images/logo-black.png?v=2"
            alt="PRAZTECH® ENGINEERING"
            className="h-10 w-auto object-contain"
            style={{ maxHeight: '45px', width: 'auto' }}
          />
          <div className="text-right text-xs leading-tight">
            <strong className="text-sm font-bold text-black">PRAZTECH® ENGINEERING</strong><br />
            <span>Asaf Ali Rd, Delhi, 110002</span><br />
            <span>Email: xiscoenterprises@gmail.com | Phone: +91 8744020102</span>
          </div>
        </div>
        <h2 className="text-base font-medium text-center mt-3 border-t border-b py-1.5 font-mono">
          Product Enquiry / Request for Quotation Summary
        </h2>
      </div>

      {/* Top Success Banner (Screen Only) */}
      <div className="bg-white rounded-xl border border-[#dfd5e8] p-6 sm:p-8 text-center space-y-4 no-print shadow-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        
        <h1 className="font-sans font-medium text-2xl sm:text-3xl text-[#2e075d]">
          Quotation enquiry submitted
        </h1>

        <p className="text-xs sm:text-sm text-[#665f6e] max-w-lg mx-auto leading-relaxed">
          Your request for quotation has been recorded. Our engineering team will review your tool specifications and reply with a formal quotation.
        </p>

        {/* Unique Reference Number Badge */}
        <div className="inline-block bg-gradient-to-r from-[#2e075d] via-[#381c59] to-[#2d065c] text-white rounded-xl p-3 sm:px-6 sm:py-3 border border-[#5e3e8b]/50 shadow-md">
          <div className="text-[11px] text-[#9080a5] mb-0.5">
            Enquiry reference ID
          </div>
          <div className="font-mono text-xl sm:text-2xl font-medium text-white tracking-wider tabular-nums">
            {reference || enquiry?.referenceNumber}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap justify-center gap-2.5">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPdf}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#381c59] hover:bg-[#5e3e8b] disabled:opacity-60 text-white font-medium text-xs rounded-lg transition-colors shadow-md border border-[#9080a5]/40 cursor-pointer"
          >
            {isDownloadingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isDownloadingPdf ? 'Preparing official PDF...' : 'Download official PDF summary'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-industrial-100 text-industrial-700 font-medium text-xs rounded-lg border border-industrial-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print receipt</span>
          </button>
        </div>
      </div>

      {/* Confirmation & Status Notification Card (Screen Only) */}
      <div className="bg-white rounded-xl border border-industrial-200 p-5 space-y-2 no-print">
        <div className="flex items-center space-x-2 text-xs font-medium text-industrial-900">
          <Mail className="w-4 h-4 text-industrial-600" />
          <span>Email confirmation sent</span>
        </div>
        <p className="text-xs text-industrial-600 leading-relaxed">
          An email containing your complete itemized breakdown and attached PDF has been dispatched to <strong className="text-industrial-900 font-medium">{cust.email}</strong>.
        </p>
      </div>

      {/* Itemized Enquiry Summary Card (Prints Cleanly) */}
      <div className="bg-white rounded-lg border border-industrial-200 overflow-hidden">
        <div className="bg-industrial-50 px-6 py-4 border-b border-industrial-200 flex items-center justify-between">
          <h3 className="font-heading font-medium text-sm text-industrial-900 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-industrial-500 no-print" />
            <span>Submitted selections summary</span>
          </h3>
          <span className="text-xs font-mono text-industrial-500">
            Reference: <strong className="text-industrial-900">{reference || enquiry?.referenceNumber}</strong> • Date: {formatDateDDMMYY(enquiry?.submittedAt || Date.now())}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Details Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded bg-industrial-50 text-xs border border-industrial-100">
            <div>
              <span className="text-industrial-500 block mb-0.5">Contact Name</span>
              <strong className="text-industrial-900 text-sm">{cust.fullName}</strong>
            </div>
            <div>
              <span className="text-industrial-500 block mb-0.5">Company / Business</span>
              <strong className="text-industrial-900 text-sm">{cust.company || 'Individual / Non-commercial'}</strong>
            </div>
            <div>
              <span className="text-industrial-500 block mb-0.5">Email Address</span>
              <strong className="text-industrial-900 font-mono">{cust.email}</strong>
            </div>
            <div>
              <span className="text-industrial-500 block mb-0.5">Phone / Location</span>
              <strong className="text-industrial-900 font-mono">{cust.phone} • {cust.city}, {cust.country}</strong>
            </div>
            {cust.address && (
              <div className="sm:col-span-2">
                <span className="text-industrial-500 block mb-0.5">Workshop / Delivery Address</span>
                <span className="text-industrial-800">{cust.address}</span>
              </div>
            )}
            {cust.gstin && (
              <div>
                <span className="text-industrial-500 block mb-0.5">GSTIN / Tax ID</span>
                <strong className="text-industrial-900 font-mono">{cust.gstin}</strong>
              </div>
            )}
          </div>

          {/* Requested Items Table */}
          <div className="border border-industrial-200 rounded overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead className="bg-industrial-900 text-white font-medium">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">SKU / Tool Model</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-200">
                {catItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-industrial-50">
                    <td className="p-3 text-industrial-400 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-mono font-medium text-industrial-900 uppercase">{(item.modelNo || '').toUpperCase()}</div>
                      <div className="text-[11px] text-industrial-500">{item.name}</div>
                    </td>
                    <td className="p-3 text-industrial-600">{item.category}</td>
                    <td className="p-3 text-center font-medium font-mono text-industrial-900">{item.quantity}</td>
                    <td className="p-3 text-industrial-500 text-[11px]">{item.notes || '—'}</td>
                  </tr>
                ))}
                {custItems.map((cItem, cIdx) => (
                  <tr key={`c-${cIdx}`} className="bg-brand-100/40 hover:bg-brand-100/70">
                    <td className="p-3 text-brand-amethyst font-mono">C{cIdx + 1}</td>
                    <td className="p-3">
                      <div className="font-medium text-brand-indigo">[Custom tool] {cItem.productName}</div>
                      <div className="text-[11px] text-industrial-500">{cItem.specifications || cItem.dimensions}</div>
                    </td>
                    <td className="p-3 text-brand-purple font-medium">Custom Tooling</td>
                    <td className="p-3 text-center font-medium font-mono text-industrial-900">{cItem.quantity}</td>
                    <td className="p-3 text-industrial-500 text-[11px]">{cItem.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded bg-industrial-100/70 border border-industrial-200 text-[11px] text-industrial-600">
            <strong>B2B Notice:</strong> This document represents a formal quotation request submitted electronically. Formal commercial pricing, delivery schedules, and payment terms will be provided in a customized quotation document.
          </div>
        </div>
      </div>

      {/* Next Steps Card (Screen Only) */}
      <div className="bg-industrial-50 rounded-lg border border-industrial-200 p-6 text-xs text-industrial-700 space-y-3 no-print">
        <h4 className="font-heading font-medium text-sm text-industrial-900 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-industrial-500" />
          <span>What happens next</span>
        </h4>
        <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
          <li><strong>Engineering verification:</strong> PRAZTECH® engineers verify tooling stock, cutter angles, and custom pilot dimensions.</li>
          <li><strong>Commercial quotation:</strong> We calculate volume discount pricing, lead times, and dispatch a formal quotation.</li>
          <li><strong>Order confirmation:</strong> Once you review and approve the quotation, we initiate workshop packaging and dispatch.</li>
        </ol>
      </div>

      {/* Footer Navigation (Screen Only) */}
      <div className="text-center pt-4 no-print">
        <Link
          to="/catalogue"
          className="inline-flex items-center space-x-2 text-xs font-medium text-industrial-700 hover:text-industrial-950 underline"
        >
          <span>Return to product catalogue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
