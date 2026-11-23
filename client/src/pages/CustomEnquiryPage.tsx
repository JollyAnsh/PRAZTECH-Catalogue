import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Plus, CheckCircle2 } from 'lucide-react';

export const CustomEnquiryPage: React.FC = () => {
  const { addCustomItem } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productName: '',
    specifications: '',
    dimensions: '',
    material: '',
    quantity: 1,
    intendedApplication: '',
    notes: ''
  });

  const [added, setAdded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim()) {
      alert('Please enter a tool or product name.');
      return;
    }
    addCustomItem(form);
    setAdded(true);
    setTimeout(() => {
      navigate('/enquiry');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-industrial-200 pb-6 text-center sm:text-left">
        <div className="text-xs font-mono text-industrial-500 mb-2">
          Bespoke engineering and toolmaking
        </div>
        <h1 className="font-heading font-medium text-2xl sm:text-3xl text-industrial-900">
          Custom tooling and non-catalogue inquiries
        </h1>
        <p className="text-sm text-industrial-600 mt-2 max-w-2xl leading-relaxed">
          If your workshop requires non-standard valve seat cutter angles, specific expanding pilot diameters, custom cylinder honing sticks, or specialized boring bits not listed in our standard 41-product catalogue, submit your technical requirements below.
        </p>
      </div>

      {added && (
        <div className="p-3.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Custom tool added to your enquiry cart. Redirecting to review...</span>
        </div>
      )}

      {/* Custom Specification Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#dfd5e8] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          
          <div className="sm:col-span-2">
            <label className="font-medium text-industrial-700 block mb-1.5">
              Custom tool name or required profile *
            </label>
            <input
              type="text"
              required
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              placeholder="e.g. 3-Angle Carbide Valve Seat Cutter (45° / 30° / 60°) with 6.5mm pilot"
              className="w-full px-3 py-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 text-xs text-industrial-900 placeholder:text-industrial-400 bg-white"
            />
          </div>

          <div>
            <label className="font-medium text-industrial-700 block mb-1.5">
              Required quantity (units) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3 py-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 text-xs text-industrial-900 font-mono bg-white"
            />
          </div>

          <div>
            <label className="font-medium text-industrial-700 block mb-1.5">
              Material specification
            </label>
            <input
              type="text"
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
              placeholder="e.g. Tungsten carbide tip, HSS M2, Silicon carbide, Diamond"
              className="w-full px-3 py-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 text-xs text-industrial-900 placeholder:text-industrial-400 bg-white"
            />
          </div>

          <div>
            <label className="font-medium text-industrial-700 block mb-1.5">
              Critical dimensions and angles
            </label>
            <input
              type="text"
              value={form.dimensions}
              onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
              placeholder="e.g. Seat angle: 45°, Throat: 20°, Pilot stem: 7.14mm, Length: 150mm"
              className="w-full px-3 py-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 text-xs text-industrial-900 placeholder:text-industrial-400 bg-white"
            />
          </div>

          <div>
            <label className="font-medium text-industrial-700 block mb-1.5">
              Engine model or machine application
            </label>
            <input
              type="text"
              value={form.intendedApplication}
              onChange={(e) => setForm({ ...form, intendedApplication: e.target.value })}
              placeholder="e.g. Vintage Austin Mini 1275, Predator 212 Non-Hemi, Cummins block"
              className="w-full px-3 py-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 text-xs text-industrial-900 placeholder:text-industrial-400 bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-medium text-industrial-700 block mb-1.5">
              Detailed specifications and tolerances
            </label>
            <textarea
              rows={4}
              value={form.specifications}
              onChange={(e) => setForm({ ...form, specifications: e.target.value })}
              placeholder="Enter comprehensive technical details, hardness requirements, thread compatibility (11/16 in, 9/16 in, or 7/16 in), or surface finish requirements..."
              className="w-full px-3 py-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 text-xs text-industrial-900 placeholder:text-industrial-400 bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-medium text-industrial-700 block mb-1.5">
              Additional notes or delivery instructions
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Wooden box packaging preferred, expedited dispatch requested..."
              className="w-full px-3 py-2 border border-industrial-300 rounded focus:outline-none focus:border-industrial-700 text-xs text-industrial-900 placeholder:text-industrial-400 bg-white"
            />
          </div>

        </div>

        <div className="pt-4 border-t border-[#dfd5e8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#6e568b]">
            Custom blueprints and specifications are handled confidentially under our{' '}
            <Link to="/privacy" className="text-[#2e075d] font-semibold underline">Privacy Policy</Link>{' '}
            and{' '}
            <Link to="/terms" className="text-[#2e075d] font-semibold underline">Terms and Conditions</Link>.
          </p>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#381c59] hover:bg-[#5e3e8b] text-white font-medium text-xs rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add custom tool to enquiry</span>
          </button>
        </div>
      </form>
    </div>
  );
};
