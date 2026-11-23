import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Wrench, ShieldCheck, FileText } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-14 bg-[#f7f4fa]">
      {/* ── HERO SECTION: Rich Indigo Ink & Dark Amethyst ── */}
      <section className="bg-gradient-to-b from-[#2e075d] via-[#381c59] to-[#2d065c] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#5e3e8b]/40 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Asymmetric Hero Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 bg-[#2d065c]/80 border border-[#b5a8c8]/40 px-3 py-1 rounded-md text-xs text-[#dcd5e4]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b5a8c8]"></span>
                <span className="font-mono">PRAZTECH® Engineering • Catalogue edition 2026</span>
              </div>

              <h1 className="font-sans font-medium text-3xl sm:text-5xl tracking-tight leading-[1.1] text-white">
                Precision tooling for internal combustion engine rebuilding
              </h1>

              <p className="text-base text-[#dcd5e4] max-w-2xl leading-relaxed">
                Manufacturer of valve seat grinding kits, diamond dresser stands, cylinder honing stone holders, multi-angle carbide cutters, and kingpin reamers.
              </p>

              {/* Instant Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-lg pt-1">
                <div className="relative flex items-center rounded-lg border-2 border-[#5e3e8b] bg-[#2d065c]/90 focus-within:border-[#b5a8c8] transition-colors overflow-hidden shadow-inner">
                  <Search className="w-4 h-4 text-[#b5a8c8] ml-3.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by tool name, model or SKU..."
                    className="w-full px-3 py-2.5 text-white text-xs bg-transparent focus:outline-none placeholder-[#b5a8c8]/80"
                  />
                  <button
                    type="submit"
                    className="bg-[#5e3e8b] hover:bg-[#6e568b] text-white text-xs font-medium px-4 py-2.5 shrink-0 transition-colors border-l border-[#5e3e8b] cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 text-xs font-medium w-full sm:w-auto">
                <Link
                  to="/catalogue"
                  className="bg-[#5e3e8b] hover:bg-[#6e568b] text-white px-5 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors text-center shadow-md border border-[#b5a8c8]/30 cursor-pointer"
                >
                  <span>View all 41 products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/custom-enquiry"
                  className="bg-[#2d065c]/90 hover:bg-[#381c59] text-[#dcd5e4] border border-[#b5a8c8]/40 px-5 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 text-center"
                >
                  <Wrench className="w-3.5 h-3.5 text-[#b5a8c8]" />
                  <span>Custom tooling enquiry</span>
                </Link>
              </div>

              {/* Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#5e3e8b]/40">
                <div>
                  <div className="font-mono text-2xl font-medium text-[#b5a8c8] tabular-nums">41</div>
                  <div className="text-xs text-[#dcd5e4] mt-0.5">Tool kits & machines</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-medium text-[#b5a8c8] tabular-nums">130+</div>
                  <div className="text-xs text-[#dcd5e4] mt-0.5">Stock SKUs & sizes</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-medium text-white">Direct</div>
                  <div className="text-xs text-[#dcd5e4] mt-0.5">Factory quotation RFQ</div>
                </div>
              </div>
            </div>

            {/* Right Column: B2B Quotation Workflow Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-[#250d40] p-6 rounded-xl border border-[#5e3e8b]/60 space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#381c59]">
                  <div className="flex items-center space-x-2">
                    <img
                      src="/images/logo-white.png"
                      alt="PRAZTECH®"
                      className="h-6 w-auto"
                    />
                    <span className="text-xs text-[#dcd5e4]">Quotation procedure</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#dcd5e4] bg-[#381c59] border border-[#5e3e8b]/40 px-2 py-0.5 rounded">
                    RFQ process
                  </span>
                </div>

                <div className="space-y-3 text-xs text-[#dcd5e4]">
                  <div className="flex items-start space-x-3">
                    <span className="font-mono text-[#b5a8c8] shrink-0 mt-0.5 font-bold">01</span>
                    <span>Select catalogue tooling and specify quantities or stone grits</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="font-mono text-[#b5a8c8] shrink-0 mt-0.5 font-bold">02</span>
                    <span>Submit customer contact and workshop delivery information</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="font-mono text-[#b5a8c8] shrink-0 mt-0.5 font-bold">03</span>
                    <span>Receive unique reference ID with instant itemized PDF summary</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="font-mono text-[#b5a8c8] shrink-0 mt-0.5 font-bold">04</span>
                    <span>Sales engineering team contacts with commercial quotation and terms</span>
                  </div>
                </div>

                <Link
                  to="/catalogue"
                  className="w-full py-2.5 bg-[#5e3e8b] hover:bg-[#6e568b] text-white rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Start multi-product enquiry</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── EXPLORE ALL PRODUCTS SECTION: Dark Amethyst Gradient ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#2e075d] via-[#381c59] to-[#2d065c] rounded-xl border border-[#5e3e8b]/40 p-5 sm:p-7 text-center space-y-3.5 shadow-md">
          <span className="text-xs text-[#9080a5] font-mono uppercase tracking-wider">Standard manufacturing line</span>
          <h2 className="font-sans font-medium text-2xl sm:text-3xl text-white max-w-xl mx-auto leading-snug">
            Engine rebuilding and reconditioning tooling catalogue
          </h2>
          <p className="text-xs sm:text-sm text-[#dcd5e4] max-w-xl mx-auto leading-relaxed">
            Full range of valve seat grinding kits, diamond dresser stands, cylinder honing stone holders, multi-angle carbide cutters, and expanding reamers.
          </p>
          <div className="pt-1.5">
            <Link
              to="/catalogue"
              className="inline-flex items-center space-x-2 bg-white text-[#2e075d] hover:bg-[#ede8f5] px-6 py-2.5 rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <span>Browse catalogue</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#5e3e8b]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITION BANNER: Soft Lavender Surface with Purple Accents ── */}
      <section className="bg-[#f7f5fa] py-12 px-4 sm:px-6 lg:px-8 border-t border-[#e5e0eb]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="space-y-2 p-6 rounded-xl bg-white border border-[#dcd5e4] shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#ede8f5] text-[#5e3e8b] flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-sm text-[#2e075d]">Vitrified and carbide precision</h3>
            <p className="text-xs text-[#665f6e] leading-relaxed">
              Stones formulated with aluminium oxide and silicon carbide. Cutters manufactured with tungsten carbide tips for hardened seat materials.
            </p>
          </div>

          <div className="space-y-2 p-6 rounded-xl bg-white border border-[#dcd5e4] shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#ede8f5] text-[#5e3e8b] flex items-center justify-center mb-3">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-sm text-[#2e075d]">Engine-specific configurations</h3>
            <p className="text-xs text-[#665f6e] leading-relaxed">
              Pre-configured multi-angle cutter sets for Briggs & Stratton, Predator 212, Honda GX, Classic Mini, and Harley-Davidson engines.
            </p>
          </div>

          <div className="space-y-2 p-6 rounded-xl bg-white border border-[#dcd5e4] shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#ede8f5] text-[#5e3e8b] flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-sm text-[#2e075d]">Formal commercial quotations</h3>
            <p className="text-xs text-[#665f6e] leading-relaxed">
              All catalogue items generate itemized RFQ records with verifiable reference IDs and downloadable PDF summaries for commercial approval.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
