import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cog, Wrench, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-industrial-200 pb-8 text-center sm:text-left">
        <div className="text-xs font-mono text-industrial-500 mb-2 tracking-normal">
          About PRAZTECH® Engineering
        </div>
        <h1 className="font-heading font-medium text-2xl sm:text-3xl text-industrial-900">
          Precision toolmakers for the engine rebuilding industry
        </h1>
        <p className="text-sm sm:text-base text-industrial-600 mt-3 max-w-3xl leading-relaxed">
          PRAZTECH® Engineering manufactures specialized tooling for internal combustion engine cylinder head restoration, valve seat grinding, cylinder honing, boring, and precision reaming.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-industrial-700 leading-relaxed">
          <h2 className="font-heading font-medium text-lg text-industrial-900">
            Engineered for accuracy and repeatability
          </h2>
          <p>
            Automotive machine shops and engine rebuilders demand extreme concentricity and dimensional precision when servicing valve guides and cutting valve seats. A fraction of a millimeter misalignment in valve guide reaming or seat dressing causes combustion leaks, compression loss, and premature component failure.
          </p>
          <p>
            PRAZTECH® tools are manufactured to rigid mechanical tolerances:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-industrial-800">
            <li>Dual ball-bearing valve grinding stone holders (Star and Hex drive).</li>
            <li>Premium aluminium oxide and silicon carbide abrasive formulations.</li>
            <li>Tungsten carbide tipped cutters for hardened stellite valve seats.</li>
            <li>HSS expanding reamers with long guide pilots and floating sleeves for line reaming of kingpin bushings.</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-[#2e075d] via-[#381c59] to-[#24064a] text-white rounded-xl p-6 sm:p-8 border border-[#5e3e8b]/50 space-y-6 shadow-md overflow-hidden">
          <div className="flex flex-col items-start gap-3">
            <img
              src="/images/logo-white.png"
              alt="PRAZTECH® Engineering"
              className="h-8 w-auto max-w-[180px] object-contain"
            />
            <span className="text-xs font-mono text-[#dcd5e4] bg-[#381c59] px-2.5 py-1 rounded border border-[#5e3e8b]/50">
              Tooling Catalogue · Edition 2026
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-[#dcd5e4] border-t border-[#5e3e8b]/40 pt-4 leading-relaxed">
            <p className="font-medium text-[#9080a5]">Primary manufacturing focus:</p>
            <p>• Engine valve seat grinding kits (11/16", 9/16", 7/16" thread systems)</p>
            <p>• Cylinder honing stone holders (34mm to 158mm bore range)</p>
            <p>• Multi-angle valve cutters (2-angle and 3-angle configurations)</p>
            <p>• HSS long pilot kingpin hand reamers (H4 to H17)</p>
          </div>

          <Link
            to="/catalogue"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#5e3e8b] hover:bg-[#6e568b] text-white rounded-lg font-medium text-xs transition-colors shadow-md border border-[#9080a5]/40"
          >
            <span>Explore master catalogue</span>
            <ArrowRight className="w-4 h-4 text-[#dcd5e4]" />
          </Link>
        </div>
      </div>

      {/* Workshop Applications Grid */}
      <div className="pt-8 border-t border-[#dfd5e8] space-y-6">
        <h2 className="font-heading font-medium text-xl text-[#2e075d] text-center sm:text-left">
          Industries and applications served
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-white border border-[#dfd5e8] space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#efe7f7] text-[#5e3e8b] flex items-center justify-center mb-3">
              <Cog className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-medium text-sm text-[#2e075d]">Commercial rebuilders</h3>
            <p className="text-xs text-[#6e568b] leading-relaxed">
              Automotive cylinder head overhaul plants, commercial vehicle fleets, diesel tractor workshops, and production engine reconditioning lines.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#dfd5e8] space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#efe7f7] text-[#5e3e8b] flex items-center justify-center mb-3">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-medium text-sm text-[#2e075d]">Motorcycle and small engines</h3>
            <p className="text-xs text-[#6e568b] leading-relaxed">
              Specialized cutters and reamers for 2-wheelers, 3-wheelers, ATVs, lawn mowers, Briggs & Stratton engines, and Predator 212 clone racing engines.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#dfd5e8] space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#efe7f7] text-[#5e3e8b] flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-medium text-sm text-[#2e075d]">Vintage and classic restoration</h3>
            <p className="text-xs text-[#6e568b] leading-relaxed">
              High carbon steel and custom-profile cutters tailored for classic vehicle restoration where original manufacturer tooling is obsolete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
