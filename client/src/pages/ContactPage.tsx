import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Frontend validation
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setStatusMessage({ type: 'error', text: 'Please provide your full name (minimum 2 characters).' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      setStatusMessage({ type: 'error', text: 'Please provide a detailed inquiry message (minimum 10 characters).' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: form.phone.trim(),
          company: form.company.trim(),
          message: trimmedMessage
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || 'Your inquiry has been successfully delivered to our engineering advisory team.'
        });
        setForm({ name: '', email: '', phone: '', company: '', message: '' });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.message || 'Unable to submit your inquiry. Please try again or reach us directly via telephone or WhatsApp.'
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network connection error. Please verify your internet connection or contact us directly at +91 8744020102.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-industrial-200 pb-6 text-center sm:text-left">
        <div className="text-xs font-mono text-industrial-500 mb-2">
          Contact PRAZTECH® Engineering
        </div>
        <h1 className="font-heading font-medium text-2xl sm:text-3xl text-industrial-900">
          Factory direct contact and technical advisory
        </h1>
        <p className="text-sm text-industrial-600 mt-2 max-w-2xl leading-relaxed">
          Contact our engineering team for technical guidance on valve guide pilots, seat grinding abrasive formulations, custom reamer sizing, or export shipments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Direct Contacts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-[#dfd5e8] p-6 space-y-6 shadow-sm">
            <h2 className="font-heading font-medium text-base text-[#2e075d] border-b border-[#dfd5e8] pb-3">
              Direct contact details
            </h2>

            <div className="space-y-5 text-xs">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-industrial-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-industrial-900 font-medium text-sm">Manufacturing facility and office</strong>
                  <span className="text-industrial-600 leading-relaxed block mt-0.5">
                    PRAZTECH® Engineering<br />
                    Asaf Ali Rd, Delhi, 110002
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-industrial-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-industrial-900 font-medium text-sm">Email address</strong>
                  <a href="mailto:xiscoenterprises@gmail.com" className="text-industrial-800 hover:text-industrial-950 underline font-mono">
                    xiscoenterprises@gmail.com
                  </a>
                  <span className="text-industrial-400 block text-[11px] mt-0.5">Quotations and engineering inquiries</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-industrial-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-industrial-900 font-medium text-sm">Telephone</strong>
                  <a href="tel:+918744020102" className="text-industrial-800 hover:text-industrial-950 font-mono font-medium">
                    +91 8744020102
                  </a>
                  <span className="text-industrial-400 block text-[11px] mt-0.5">Monday to Saturday: 9:00 AM – 6:30 PM IST</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-mono font-bold">
                  W
                </div>
                <div>
                  <strong className="block text-industrial-900 font-medium text-sm">WhatsApp technical chat</strong>
                  <a
                    href="https://wa.me/918744020102?text=Hello%20PRAZTECH%C2%AE%20Engineering%2C%20I%20would%20like%20to%20enquire%20about%20your%20tooling%20catalogue."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-800 hover:underline font-mono font-medium block text-xs mt-0.5"
                  >
                    +91 8744020102
                  </a>
                  <span className="text-industrial-400 block text-[11px] mt-0.5">Direct chat for rapid technical checks</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-industrial-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-industrial-900 font-medium text-sm">Response turnaround</strong>
                  <span className="text-industrial-600 leading-relaxed block mt-0.5">
                    Formal quotation requests submitted via the portal are processed within 24 business hours.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded bg-industrial-50 border border-industrial-200 text-xs text-industrial-700 leading-relaxed">
              <strong>Need a formal product quote?</strong> Add products directly to the <a href="/catalogue" className="underline font-medium text-industrial-900">Enquiry Cart</a> to generate an itemized reference PDF.
            </div>
          </div>
        </div>

        {/* Right Column: General Enquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-[#dfd5e8] p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="font-heading font-medium text-base text-[#2e075d]">
              Send a technical inquiry
            </h2>

            {statusMessage && (
              <div
                className={`p-3.5 rounded-lg text-xs flex items-start space-x-2.5 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-900'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-[#2e075d] block mb-1.5">Your name *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-[#c5b6d5] rounded-lg focus:outline-none focus:border-[#5e3e8b] text-xs text-[#2e075d] placeholder-[#6e568b]/75 bg-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#2e075d] block mb-1.5">Email address *</label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 border border-[#c5b6d5] rounded-lg focus:outline-none focus:border-[#5e3e8b] text-xs text-[#2e075d] placeholder-[#6e568b]/75 bg-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-[#2e075d] block mb-1.5">Phone number</label>
                  <input
                    type="tel"
                    disabled={isSubmitting}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-2 border border-[#c5b6d5] rounded-lg focus:outline-none focus:border-[#5e3e8b] text-xs text-[#2e075d] placeholder-[#6e568b]/75 bg-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#2e075d] block mb-1.5">Company or workshop</label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-[#c5b6d5] rounded-lg focus:outline-none focus:border-[#5e3e8b] text-xs text-[#2e075d] placeholder-[#6e568b]/75 bg-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-[#2e075d] block mb-1.5">Message or technical query *</label>
                <textarea
                  required
                  rows={4}
                  disabled={isSubmitting}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Specify valve head specs, machine model, required pilot stems, stone threads, or delivery location..."
                  className="w-full px-3 py-2 border border-[#c5b6d5] rounded-lg focus:outline-none focus:border-[#5e3e8b] text-xs text-[#2e075d] placeholder-[#6e568b]/75 bg-white disabled:opacity-60"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#381c59] hover:bg-[#5e3e8b] disabled:opacity-60 text-white font-medium text-xs rounded-lg flex items-center space-x-2 transition-colors cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? 'Transmitting inquiry...' : 'Send message'}</span>
                </button>
              </div>

              <div className="pt-2 text-[11px] text-[#6e568b] leading-relaxed">
                By submitting this inquiry, you agree to our{' '}
                <Link to="/privacy" className="text-[#2e075d] font-semibold underline">
                  Privacy Policy
                </Link>{' '}
                and consent to PRAZTECH® Engineering processing your details to reply to your inquiry.
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
