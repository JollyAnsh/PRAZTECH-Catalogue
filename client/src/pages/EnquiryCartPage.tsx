import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { CustomerInfo, CustomItem } from '../types';
import {
  FileText,
  Trash2,
  Plus,
  Minus,
  Wrench,
  Send,
  AlertCircle,
  ShieldCheck,
  Building,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export interface CountryDialCode {
  code: string;
  name: string;
  flag: string;
  placeholder: string;
}

export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  { code: '+91', name: 'India', flag: '🇮🇳', placeholder: '98765 43210' },
  { code: '+971', name: 'UAE', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: '+1', name: 'USA / Canada', flag: '🇺🇸', placeholder: '(555) 000-0000' },
  { code: '+44', name: 'UK', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', placeholder: '151 12345678' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', placeholder: '412 345 678' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', placeholder: '71 123 4567' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪', placeholder: '712 345678' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬', placeholder: '802 123 4567' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', placeholder: '8123 4567' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', placeholder: '12-345 6789' },
  { code: '+968', name: 'Oman', flag: '🇴🇲', placeholder: '9123 4567' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦', placeholder: '3312 3456' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼', placeholder: '9123 4567' },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭', placeholder: '3600 1234' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬', placeholder: '100 123 4567' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷', placeholder: '501 234 5678' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', placeholder: '1712-345678' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵', placeholder: '984-1234567' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', placeholder: '71 234 5678' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', placeholder: '300 1234567' },
  { code: '+33', name: 'France', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', placeholder: '312 345 6789' },
  { code: '+34', name: 'Spain', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱', placeholder: '6 12345678' },
  { code: '+48', name: 'Poland', flag: '🇵🇱', placeholder: '512 345 678' },
  { code: '+7', name: 'Kazakhstan / Russia', flag: '🇰🇿', placeholder: '701 123 4567' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', placeholder: '11 91234-5678' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', placeholder: '90-1234-5678' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷', placeholder: '10-1234-5678' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩', placeholder: '812-3456-7890' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳', placeholder: '91 234 5678' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭', placeholder: '917 123 4567' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭', placeholder: '81 234 5678' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿', placeholder: '21 123 4567' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿', placeholder: '712 345 678' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭', placeholder: '24 123 4567' }
];

export const EnquiryCartPage: React.FC = () => {
  const {
    items,
    customItems,
    removeFromCart,
    updateQuantity,
    updateNotes,
    addCustomItem,
    removeCustomItem,
    clearCart,
    totalItems
  } = useCart();

  const navigate = useNavigate();

  // Customer Form State
  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    whatsapp: '',
    country: 'India',
    state: '',
    city: '',
    address: '',
    gstin: ''
  });

  // Country Dial Code States
  const [selectedDialCode, setSelectedDialCode] = useState('+91');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [whatsappDialCode, setWhatsappDialCode] = useState('+91');
  const [whatsappLocal, setWhatsappLocal] = useState('');

  const [generalNotes, setGeneralNotes] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize phone with dial code
  const updatePhone = (dialCode: string, localNum: string) => {
    setSelectedDialCode(dialCode);
    setPhoneLocal(localNum);
    const combined = localNum.trim() ? `${dialCode} ${localNum.trim()}` : '';
    setCustomer(prev => {
      const next = { ...prev, phone: combined };
      if (sameAsPhone) {
        next.whatsapp = combined;
      }
      return next;
    });
  };

  const handlePhoneLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.startsWith('+')) {
      const matched = COUNTRY_DIAL_CODES.find(c => val.startsWith(c.code));
      if (matched) {
        const remaining = val.slice(matched.code.length).trim();
        updatePhone(matched.code, remaining);
        return;
      }
    }
    updatePhone(selectedDialCode, val);
  };

  const handleDialCodeChange = (newCode: string) => {
    updatePhone(newCode, phoneLocal);
    const matched = COUNTRY_DIAL_CODES.find(c => c.code === newCode);
    if (matched && (!customer.country || customer.country === 'India')) {
      setCustomer(prev => ({ ...prev, country: matched.name }));
    }
  };

  const updateWhatsapp = (dialCode: string, localNum: string) => {
    setWhatsappDialCode(dialCode);
    setWhatsappLocal(localNum);
    const combined = localNum.trim() ? `${dialCode} ${localNum.trim()}` : '';
    setCustomer(prev => ({ ...prev, whatsapp: combined }));
  };

  const handleWhatsappLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.startsWith('+')) {
      const matched = COUNTRY_DIAL_CODES.find(c => val.startsWith(c.code));
      if (matched) {
        const remaining = val.slice(matched.code.length).trim();
        updateWhatsapp(matched.code, remaining);
        return;
      }
    }
    updateWhatsapp(whatsappDialCode, val);
  };

  const handleToggleSameAsPhone = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      setWhatsappDialCode(selectedDialCode);
      setWhatsappLocal(phoneLocal);
      const combined = phoneLocal.trim() ? `${selectedDialCode} ${phoneLocal.trim()}` : '';
      setCustomer(prev => ({ ...prev, whatsapp: combined }));
    }
  };

  // New Custom Item Form Toggle & State
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [newCustom, setNewCustom] = useState<Omit<CustomItem, 'id'>>({
    productName: '',
    specifications: '',
    dimensions: '',
    material: '',
    quantity: 1,
    intendedApplication: '',
    notes: ''
  });

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustom.productName.trim()) {
      alert('Please enter a product name for the custom tool request.');
      return;
    }
    addCustomItem(newCustom);
    setNewCustom({
      productName: '',
      specifications: '',
      dimensions: '',
      material: '',
      quantity: 1,
      intendedApplication: '',
      notes: ''
    });
    setShowCustomForm(false);
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (items.length === 0 && customItems.length === 0) {
      setErrorMsg('Your enquiry cart is empty. Please add catalogue products or custom tool requests before submitting.');
      return;
    }

    const fullPhone = phoneLocal.trim() ? `${selectedDialCode} ${phoneLocal.trim()}` : customer.phone.trim();
    if (!fullPhone) {
      setErrorMsg('Please enter your mobile / phone number.');
      return;
    }

    if (!customer.fullName.trim() || !customer.email.trim() || !fullPhone || !customer.country.trim() || !customer.state.trim() || !customer.city.trim()) {
      setErrorMsg('Please complete all mandatory customer information fields (*).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!consentAccepted) {
      setErrorMsg('You must accept the data privacy policy and consent before submitting your quotation request.');
      return;
    }

    setSubmitting(true);

    try {
      const fullWhatsapp = sameAsPhone
        ? fullPhone
        : (whatsappLocal.trim() ? `${whatsappDialCode} ${whatsappLocal.trim()}` : ((customer.whatsapp || '').trim() || fullPhone));

      const payload = {
        customer: {
          ...customer,
          phone: fullPhone,
          whatsapp: fullWhatsapp
        },
        catalogueItems: items.map(it => ({
          productId: it.product.id || (it.product as any)._id || it.product.slug,
          modelNo: it.product.modelNo,
          name: it.product.name,
          category: it.product.category,
          selectedSubModel: it.selectedSubModel,
          quantity: it.quantity,
          notes: it.notes
        })),
        customItems: customItems.map(c => ({
          productName: c.productName,
          specifications: c.specifications,
          dimensions: c.dimensions,
          material: c.material,
          quantity: c.quantity,
          intendedApplication: c.intendedApplication,
          notes: c.notes
        })),
        generalNotes,
        consent: {
          accepted: true,
          policyVersion: '1.0'
        }
      };

      const res = await api.submitEnquiry(payload);
      clearCart();
      navigate(`/confirmation/${res.referenceNumber}`, { state: { enquiryData: res } });
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCountry = COUNTRY_DIAL_CODES.find(c => c.code === selectedDialCode) || COUNTRY_DIAL_CODES[0];
  const activeWhatsappCountry = COUNTRY_DIAL_CODES.find(c => c.code === whatsappDialCode) || COUNTRY_DIAL_CODES[0];

  if (items.length === 0 && customItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-14 h-14 rounded bg-industrial-100 text-industrial-500 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="font-heading font-medium text-2xl text-industrial-900">
          Your enquiry cart is empty
        </h2>
        <p className="text-sm text-industrial-600 max-w-md mx-auto leading-relaxed">
          Select products from our catalogue or submit a custom tool drawing to request a formal quotation.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link
            to="/catalogue"
            className="px-5 py-2.5 bg-industrial-900 hover:bg-industrial-800 text-white font-medium text-xs rounded transition-colors"
          >
            Browse catalogue (41)
          </Link>
          <Link
            to="/custom-enquiry"
            className="px-6 py-3 bg-industrial-100 hover:bg-industrial-200 text-industrial-800 font-bold text-xs rounded-lg transition-all"
          >
            Submit Custom Tool Request
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-industrial-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-sans font-medium text-2xl sm:text-3xl text-industrial-950">
              Quotation enquiry review
            </h1>
            <p className="text-xs sm:text-sm text-industrial-600 mt-1">
              Review selected tooling items and provide contact details for a formal RFQ quotation.
            </p>
          </div>
          <div className="text-xs font-mono text-industrial-700 bg-industrial-100 px-2.5 py-1 rounded border border-industrial-200 self-start tabular-nums">
            Total items: {totalItems} units ({items.length} catalogue, {customItems.length} custom)
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-3 shadow-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Please check your submission:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitEnquiry} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Cart Items & Custom Items */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. CATALOGUE PRODUCTS */}
          {items.length > 0 && (
            <div className="bg-white rounded-xl border border-[#dfd5e8] overflow-hidden shadow-xs">
              <div className="bg-[#f2ecf7] px-5 py-3 border-b border-[#dfd5e8] flex items-center justify-between">
                <span className="font-heading font-medium text-sm text-[#2e075d] flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#5e3e8b]" />
                  <span>Catalogue products ({items.length})</span>
                </span>
                <Link to="/catalogue" className="text-xs font-medium text-[#5e3e8b] hover:text-[#381c59] underline">
                  + Add more products
                </Link>
              </div>

              <div className="divide-y divide-industrial-200">
                {items.map(item => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    
                    {/* Thumbnail */}
                    <div className="w-16 h-16 bg-white border border-industrial-200 rounded p-1 overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={item.product.images[0] || `/images/placeholders/${item.product.slug}.svg`}
                        alt={item.product.modelNo}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="font-mono text-xs font-medium text-industrial-950">
                        {item.product.modelNo}
                      </div>
                      <h4 className="font-medium text-xs sm:text-sm text-industrial-900 truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-[11px] text-industrial-500">
                        Category: {item.product.category}
                      </div>

                      {/* Selected Sub-model & Stone badge */}
                      {item.selectedSubModel && (() => {
                        const sub = item.selectedSubModel;
                        const optParts = sub.options
                          ? Object.values(sub.options).map(v => String(v).trim()).filter(Boolean)
                          : [];
                        const variantLabel = (optParts.length > 0 ? optParts.join(' • ') : '') ||
                          sub.label ||
                          (sub.sizeInches ? `${sub.sizeInches} (${sub.sizeMm || ''})` : (sub.modelNo || sub.size || sub.sizeMm || sub.sku || 'Selected'));

                        const hasExplicitOptions = optParts.length > 0;
                        const explicitColor = sub.options?.['Color'] || sub.options?.['color'] || sub.options?.['Finish'] || sub.options?.['finish'] || '';
                        const colorVal = hasExplicitOptions ? explicitColor : (sub.color || sub.stoneColor || '');
                        const isRecognizedColor = Boolean(
                          colorVal && ['pink', 'black', 'white', 'ruby', 'red', 'blue', 'green', 'gold', 'yellow', 'grey', 'gray']
                            .some(c => colorVal.toLowerCase().includes(c))
                        );

                        return (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="bg-industrial-100 border border-industrial-200 text-industrial-800 text-[10px] font-mono px-2 py-0.5 rounded">
                              Variant: {variantLabel}
                            </span>
                            {isRecognizedColor && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded border border-industrial-300 bg-white text-industrial-800 flex items-center gap-1">
                                <span
                                  className="w-2 h-2 rounded-full border border-black/20"
                                  style={{
                                    backgroundColor:
                                      colorVal.toLowerCase() === 'pink' ? '#ec4899' :
                                      colorVal.toLowerCase() === 'black' ? '#18181b' :
                                      colorVal.toLowerCase() === 'white' ? '#ffffff' :
                                      colorVal.toLowerCase() === 'ruby' || colorVal.toLowerCase().includes('red') ? '#dc2626' :
                                      colorVal.toLowerCase() === 'blue' ? '#2563eb' :
                                      colorVal.toLowerCase() === 'green' ? '#16a34a' :
                                      colorVal.toLowerCase() === 'gold' || colorVal.toLowerCase().includes('yellow') ? '#eab308' :
                                      '#a1a1aa'
                                  }}
                                />
                                {colorVal}
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* Item-specific Notes Input */}
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => updateNotes(item.id, e.target.value)}
                        placeholder="Add special notes for this item (e.g. customized length, wooden box)..."
                        className="w-full text-xs px-2.5 py-1.5 border border-industrial-200 rounded focus:outline-none focus:border-industrial-700 bg-white mt-1 placeholder-industrial-400"
                      />
                    </div>

                    {/* Quantity & Delete */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0">
                      <div className="flex items-center border border-industrial-300 rounded-lg overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-industrial-600 hover:bg-industrial-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-bold text-xs text-industrial-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-industrial-600 hover:bg-industrial-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-industrial-400 hover:text-red-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. CUSTOM PRODUCT ENQUIRIES */}
          <div className="bg-white rounded-xl border border-[#dfd5e8] overflow-hidden shadow-xs">
            <div className="bg-[#f2ecf7] px-5 py-3 border-b border-[#dfd5e8] flex items-center justify-between">
              <span className="font-heading font-medium text-sm text-[#2e075d] flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-[#5e3e8b]" />
                <span>Custom non-catalogue tooling requests ({customItems.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="text-xs font-medium text-[#5e3e8b] hover:text-[#381c59] underline flex items-center space-x-1 cursor-pointer"
              >
                <span>{showCustomForm ? 'Cancel' : '+ Add custom tool'}</span>
              </button>
            </div>

            {/* List of Existing Custom Items */}
            {customItems.length > 0 && (
              <div className="divide-y divide-industrial-200">
                {customItems.map((cItem) => (
                  <div key={cItem.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-brand-mauve/20 text-brand-indigo border border-brand-mauve/30 text-[10px] font-mono px-2 py-0.5 rounded">
                          CUSTOM REQUEST
                        </span>
                        <h4 className="font-medium text-sm text-industrial-900">{cItem.productName}</h4>
                      </div>
                      <div className="text-xs text-industrial-600 space-y-0.5 pt-1">
                        {cItem.specifications && <div><strong>Specs:</strong> {cItem.specifications}</div>}
                        {cItem.dimensions && <div><strong>Dimensions:</strong> {cItem.dimensions}</div>}
                        {cItem.material && <div><strong>Material:</strong> {cItem.material}</div>}
                        {cItem.intendedApplication && <div><strong>Application:</strong> {cItem.intendedApplication}</div>}
                        {cItem.notes && <div><strong>Notes:</strong> {cItem.notes}</div>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0 self-end sm:self-center">
                      <div className="text-xs font-bold text-industrial-800 bg-industrial-100 px-2.5 py-1 rounded">
                        Qty: {cItem.quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCustomItem(cItem.id)}
                        className="text-industrial-400 hover:text-red-600 p-1"
                        title="Remove custom item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Custom Tool Form Accordion */}
            {showCustomForm && (
              <div className="p-5 bg-brand-50 border-t border-brand-200 space-y-3">
                <h5 className="font-medium text-xs text-brand-indigo font-mono">
                  Specify custom tool requirements:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-industrial-700 block mb-1">
                      Tool Name / Description *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCustom.productName}
                      onChange={(e) => setNewCustom({ ...newCustom, productName: e.target.value })}
                      placeholder="e.g. 3-Angle Valve Seat Cutter for Race Head"
                      className="w-full text-xs p-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-industrial-700 block mb-1">
                      Quantity Needed *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newCustom.quantity}
                      onChange={(e) => setNewCustom({ ...newCustom, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full text-xs p-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-industrial-700 block mb-1">
                      Dimensions / Angles / Bore Sizes
                    </label>
                    <input
                      type="text"
                      value={newCustom.dimensions}
                      onChange={(e) => setNewCustom({ ...newCustom, dimensions: e.target.value })}
                      placeholder="e.g. 45° seat, 30° top, 5.5mm pilot diameter"
                      className="w-full text-xs p-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-industrial-700 block mb-1">
                      Material Preference
                    </label>
                    <input
                      type="text"
                      value={newCustom.material}
                      onChange={(e) => setNewCustom({ ...newCustom, material: e.target.value })}
                      placeholder="e.g. Tungsten Carbide, HSS, Aluminium Oxide"
                      className="w-full text-xs p-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-industrial-700 block mb-1">
                      Intended Application / Engine Model
                    </label>
                    <input
                      type="text"
                      value={newCustom.intendedApplication}
                      onChange={(e) => setNewCustom({ ...newCustom, intendedApplication: e.target.value })}
                      placeholder="e.g. Honda GX200, Harley Shovelhead, Line boring tractor block"
                      className="w-full text-xs p-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-industrial-700 block mb-1">
                      Additional Notes / Technical Details
                    </label>
                    <textarea
                      rows={2}
                      value={newCustom.notes}
                      onChange={(e) => setNewCustom({ ...newCustom, notes: e.target.value })}
                      placeholder="Enter tolerances, pilot lengths, or thread requirements..."
                      className="w-full text-xs p-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(false)}
                    className="px-3 py-1.5 text-xs text-industrial-600 hover:bg-industrial-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="px-4 py-2 bg-brand-amethyst hover:bg-brand-purple text-brand-white font-medium text-xs rounded transition-colors shadow-xs cursor-pointer"
                  >
                    Add to enquiry list
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. GENERAL INSTRUCTIONS */}
          <div className="bg-white rounded-xl border border-industrial-200 p-5 shadow-sm space-y-2">
            <label className="font-heading font-bold text-xs uppercase tracking-wider text-industrial-900 block">
              General Procurement Instructions / Delivery Timeline (Optional):
            </label>
            <textarea
              rows={3}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="e.g. Request quote for export packaging, express air freight, or bulk volume discount tiers..."
              className="w-full text-xs p-3 border border-industrial-300 rounded-lg focus:outline-none focus:border-industrial-700 bg-industrial-50/30"
            />
          </div>

        </div>

        {/* Right Column: Customer Info & Submission */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-[#dfd5e8] p-6 space-y-5 lg:sticky lg:top-28 shadow-sm">
            
            <div className="pb-3 border-b border-[#dfd5e8]">
              <h3 className="font-heading font-medium text-base text-[#2e075d] flex items-center space-x-2">
                <User className="w-4 h-4 text-[#5e3e8b]" />
                <span>Customer and business details</span>
              </h3>
              <p className="text-[11px] text-[#6e568b] mt-0.5">
                Required for issuing your formal reference ID and quotation PDF.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Full Name */}
              <div>
                <label className="font-medium text-industrial-700 block mb-1">
                  Full name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={customer.fullName}
                    onChange={handleCustomerChange}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full pl-8 pr-3 py-2 border border-industrial-300 rounded-lg focus:outline-none focus:border-industrial-700"
                  />
                  <User className="w-3.5 h-3.5 text-industrial-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="font-bold text-industrial-800 block mb-1">
                  Company / Business Name (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="company"
                    value={customer.company}
                    onChange={handleCustomerChange}
                    placeholder="e.g. Apex Precision Machine Works"
                    className="w-full pl-8 pr-3 py-2 border border-industrial-300 rounded-lg focus:outline-none focus:border-industrial-700"
                  />
                  <Building className="w-3.5 h-3.5 text-industrial-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="font-bold text-industrial-800 block mb-1">
                  Business Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    name="email"
                    value={customer.email}
                    onChange={handleCustomerChange}
                    placeholder="e.g. rajesh@apexprecision.com"
                    className="w-full pl-8 pr-3 py-2 border border-industrial-300 rounded-lg focus:outline-none focus:border-industrial-700"
                  />
                  <Mail className="w-3.5 h-3.5 text-industrial-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Phone Number with Country Calling Code Dropdown */}
              <div>
                <label className="font-bold text-industrial-800 block mb-1">
                  Mobile / Phone Number *
                </label>
                <div className="flex rounded-lg border border-industrial-300 focus-within:border-industrial-700 focus-within:ring-1 focus-within:ring-industrial-700 bg-white overflow-hidden shadow-2xs">
                  <select
                    value={selectedDialCode}
                    onChange={(e) => handleDialCodeChange(e.target.value)}
                    className="bg-industrial-50 text-industrial-800 text-xs font-mono font-medium px-2.5 py-2 border-r border-industrial-200 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[145px] shrink-0"
                    aria-label="Country calling code"
                  >
                    {COUNTRY_DIAL_CODES.map((c) => (
                      <option key={c.code + c.name} value={c.code}>
                        {c.flag} {c.code} ({c.name})
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      required
                      name="phoneLocal"
                      value={phoneLocal}
                      onChange={handlePhoneLocalChange}
                      placeholder={`e.g. ${activeCountry.placeholder}`}
                      className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm text-industrial-900 placeholder-industrial-400 focus:outline-none bg-transparent"
                    />
                    <Phone className="w-3.5 h-3.5 text-industrial-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-industrial-500 mt-1">
                  <span>Selected: {activeCountry.flag} {activeCountry.name} ({activeCountry.code})</span>
                  {phoneLocal.trim() && (
                    <span className="font-mono text-industrial-700">Preview: {selectedDialCode} {phoneLocal.trim()}</span>
                  )}
                </div>
              </div>

              {/* WhatsApp Number with "Same as Phone Number" Checkbox */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-industrial-700">
                    WhatsApp number (optional)
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-industrial-600 hover:text-industrial-900 select-none font-medium">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => handleToggleSameAsPhone(e.target.checked)}
                      className="rounded accent-industrial-900 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Same as phone</span>
                  </label>
                </div>
                {sameAsPhone ? (
                  <div className="px-3 py-2 border border-industrial-200 bg-industrial-100 rounded-lg text-xs text-industrial-600 flex items-center justify-between font-mono">
                    <span>{phoneLocal.trim() ? `${selectedDialCode} ${phoneLocal.trim()}` : 'Same as Mobile / Phone number'}</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">Synced</span>
                  </div>
                ) : (
                  <div className="flex rounded-lg border border-industrial-300 focus-within:border-industrial-700 focus-within:ring-1 focus-within:ring-industrial-700 bg-white overflow-hidden shadow-2xs">
                    <select
                      value={whatsappDialCode}
                      onChange={(e) => updateWhatsapp(e.target.value, whatsappLocal)}
                      className="bg-industrial-50 text-industrial-800 text-xs font-mono font-medium px-2.5 py-2 border-r border-industrial-200 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[145px] shrink-0"
                      aria-label="WhatsApp country calling code"
                    >
                      {COUNTRY_DIAL_CODES.map((c) => (
                        <option key={c.code + c.name} value={c.code}>
                          {c.flag} {c.code} ({c.name})
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        name="whatsappLocal"
                        value={whatsappLocal}
                        onChange={handleWhatsappLocalChange}
                        placeholder={`e.g. ${activeWhatsappCountry.placeholder}`}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-industrial-900 placeholder-industrial-400 focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-industrial-500 mt-1">
                  For instant PDF quotation & dispatch updates via WhatsApp.
                </p>
              </div>

              {/* Country, State, City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-industrial-800 block mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    name="country"
                    value={customer.country}
                    onChange={handleCustomerChange}
                    placeholder="India"
                    className="w-full px-2 py-2 border border-industrial-300 rounded-lg focus:outline-none focus:border-industrial-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-industrial-800 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={customer.state}
                    onChange={handleCustomerChange}
                    placeholder="State"
                    className="w-full px-2 py-2 border border-industrial-300 rounded-lg focus:outline-none focus:border-industrial-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-industrial-800 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={customer.city}
                    onChange={handleCustomerChange}
                    placeholder="City"
                    className="w-full px-2 py-2 border border-industrial-300 rounded-lg focus:outline-none focus:border-industrial-700"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="font-bold text-industrial-800 block mb-1">
                  Delivery / Workshop Address (Optional)
                </label>
                <input
                  type="text"
                  name="address"
                  value={customer.address}
                  onChange={handleCustomerChange}
                  placeholder="Street, Industrial Area, PIN Code"
                  className="w-full px-3 py-2 border border-industrial-300 rounded-lg focus:outline-none focus:border-industrial-700"
                />
              </div>

              {/* GSTIN */}
              <div>
                <label className="font-bold text-industrial-800 block mb-1">
                  GSTIN / Tax Registration (Optional)
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={customer.gstin}
                  onChange={handleCustomerChange}
                  placeholder="For B2B commercial invoice records"
                  className="w-full px-3 py-2 border border-industrial-300 rounded-lg focus:outline-none focus:border-industrial-700"
                />
              </div>

              {/* Mandatory Consent Checkbox */}
              <div className="pt-2 bg-[#f7f4fa] p-3 rounded-xl border border-[#dfd5e8]">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#381c59] focus:ring-[#5e3e8b] border-[#dfd5e8] cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] text-[#665f6e] leading-snug">
                    I confirm that I am requesting an official technical quotation for the selected tooling items. I agree to the{' '}
                    <Link to="/privacy" target="_blank" className="text-[#2e075d] font-semibold underline">
                      Privacy Policy
                    </Link>
                    ,{' '}
                    <Link to="/terms" target="_blank" className="text-[#2e075d] font-semibold underline">
                      Terms and Conditions
                    </Link>
                    , and{' '}
                    <Link to="/refund-policy" target="_blank" className="text-[#2e075d] font-semibold underline">
                      Refund Policy
                    </Link>
                    , and consent to PRAZTECH® contacting me regarding this commercial enquiry.
                  </span>
                </label>
              </div>

            </div>

            {/* Submission CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-4 rounded text-xs font-medium text-brand-white flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs ${
                  submitting
                    ? 'bg-brand-amethyst/60 text-brand-white/80 cursor-not-allowed'
                    : 'bg-brand-amethyst hover:bg-brand-purple'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-brand-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating quotation reference...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit quotation request</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-center text-industrial-500 mt-2">
                Official quotation reference ID and PDF generated upon submission
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
};
