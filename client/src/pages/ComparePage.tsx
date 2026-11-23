import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { CompareEmptyState } from '../components/compare/CompareEmptyState';
import { CompareToolbar } from '../components/compare/CompareToolbar';
import {
  SlidersHorizontal,
  Plus,
  Minus,
  X,
  ArrowRight,
  Trash2,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Wrench,
  Layers
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, addToCart, updateQuantity, removeFromCart, items } = useCart();
  
  // Toolbar controls
  const [highlightDiff, setHighlightDiff] = useState(true);
  const [hideIdentical, setHideIdentical] = useState(false);
  const [activeSection, setActiveSection] = useState('general-specifications');

  // Accordion open/close state for mobile sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'general-specifications': true,
    'technical-details': true,
    'features-functionality': true,
    'applications-compatibility': true,
    'variants-options': true
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const expandAll = () => {
    setOpenSections({
      'general-specifications': true,
      'technical-details': true,
      'features-functionality': true,
      'applications-compatibility': true,
      'variants-options': true
    });
  };

  const collapseAll = () => {
    setOpenSections({
      'general-specifications': false,
      'technical-details': false,
      'features-functionality': false,
      'applications-compatibility': false,
      'variants-options': false
    });
  };

  // Check if at least one product has sub-model variants
  const hasAnyVariants = useMemo(() => {
    return compareList.some(p => p.subModels && p.subModels.length > 0);
  }, [compareList]);

  // Collect all unique keys from itemSpecifics across all compared products
  const allItemSpecificKeys = useMemo(() => {
    const keySet = new Set<string>();
    compareList.forEach(p => {
      if (p.itemSpecifics) {
        Object.keys(p.itemSpecifics).forEach(k => keySet.add(k));
      }
    });
    return Array.from(keySet).sort();
  }, [compareList]);

  // Helper difference detection functions
  const isStringDiff = (extractor: (p: Product) => string | number | undefined | null): boolean => {
    if (compareList.length <= 1) return false;
    const first = String(extractor(compareList[0]) || '').trim().toLowerCase();
    return compareList.slice(1).some(p => String(extractor(p) || '').trim().toLowerCase() !== first);
  };

  const isListDiff = (extractor: (p: Product) => string[] | undefined): boolean => {
    if (compareList.length <= 1) return false;
    const first = (extractor(compareList[0]) || []).map(s => s.trim().toLowerCase()).sort().join(' | ');
    return compareList.slice(1).some(p => {
      const current = (extractor(p) || []).map(s => s.trim().toLowerCase()).sort().join(' | ');
      return current !== first;
    });
  };

  // Smooth scroll handler for mobile horizontal category navigation
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -155; // Offset to clear navbar and sticky toolbar
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionId);
      setOpenSections(prev => ({ ...prev, [sectionId]: true }));
    }
  };

  // Scroll spy to highlight active section on mobile
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'general-specifications',
        'technical-details',
        'features-functionality',
        'applications-compatibility',
        ...(hasAnyVariants ? ['variants-options'] : [])
      ];

      const scrollPos = window.scrollY + 180;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnyVariants]);

  // If no products selected
  if (compareList.length === 0) {
    return <CompareEmptyState />;
  }

  // Pre-calculate differences
  const diffCategory = isStringDiff(p => p.category);
  const diffPage = isStringDiff(p => p.cataloguePage);
  const diffDesc = isStringDiff(p => p.description);
  const diffSizes = isListDiff(p => p.sizesDetail);
  const diffSet = isListDiff(p => p.setIncludes);
  const diffFeatures = isListDiff(p => p.keyFeatures);
  const diffApps = isListDiff(p => p.applications);
  const diffCompat = isStringDiff(p => p.compatibility);
  const diffVariants = isStringDiff(p => p.subModels?.length || 0);
  const diffSpecifics = isStringDiff(p => JSON.stringify(p.itemSpecifics || {}));

  const diffItemSpecifics: Record<string, boolean> = {};
  allItemSpecificKeys.forEach(key => {
    diffItemSpecifics[key] = isStringDiff(p => p.itemSpecifics?.[key]);
  });

  const countGeneralDiffs = [diffCategory, diffPage, diffDesc].filter(Boolean).length;
  const countTechDiffs = [diffSizes, diffSet, ...Object.values(diffItemSpecifics)].filter(Boolean).length;
  const countFeaturesDiffs = [diffFeatures].filter(Boolean).length;
  const countAppsDiffs = [diffApps, diffCompat].filter(Boolean).length;
  const countVariantDiffs = [diffVariants].filter(Boolean).length;
  const totalDifferences = countGeneralDiffs + countTechDiffs + countFeaturesDiffs + countAppsDiffs + countVariantDiffs;

  // Mobile product column layout calculations
  const numProds = compareList.length;
  const isMultiMobile = numProds > 2;
  const mobileColWidth = isMultiMobile ? 'w-[150px] xs:w-[170px] shrink-0' : 'flex-1 min-w-0';
  const mobileRowClass = isMultiMobile
    ? 'flex divide-x divide-[#dfd5e8] min-w-max'
    : 'grid grid-cols-2 divide-x divide-[#dfd5e8]';

  // Navigation tab definitions for mobile
  const navTabs = [
    { id: 'general-specifications', label: 'Specifications', icon: FileText, diffs: countGeneralDiffs },
    { id: 'technical-details', label: 'Technical Details', icon: SlidersHorizontal, diffs: countTechDiffs },
    { id: 'features-functionality', label: 'Features', icon: Sparkles, diffs: countFeaturesDiffs },
    { id: 'applications-compatibility', label: 'Applications', icon: Wrench, diffs: countAppsDiffs },
    ...(hasAnyVariants ? [{ id: 'variants-options', label: 'Variants & Options', icon: Layers, diffs: countVariantDiffs }] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (Classic side-by-side comparison matrix table)            */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Desktop Header & Toolbar */}
        <CompareToolbar
          compareCount={compareList.length}
          totalDifferences={totalDifferences}
          highlightDiff={highlightDiff}
          setHighlightDiff={setHighlightDiff}
          hideIdentical={hideIdentical}
          setHideIdentical={setHideIdentical}
          onClear={clearCompare}
        />

        {/* Desktop Comparison Matrix Table */}
        <div className="bg-white rounded-xl border border-[#dfd5e8] overflow-x-auto shadow-sm">
          <table className="w-full border-collapse text-left text-xs min-w-max">
            <tbody>
              {/* Row 1: Product Header & Thumbnail */}
              <tr className="border-b border-[#dfd5e8] bg-[#f7f4fa]/70">
                <td className="w-48 lg:w-56 p-4 font-bold text-[#2e075d] bg-[#f2ecf7] shrink-0 border-r border-[#dfd5e8] align-top">
                  <span className="text-sm">Specification</span>
                </td>
                {compareList.map(prod => {
                  const prodId = prod.id || (prod as any)._id || prod.slug;
                  const cartItemsForProduct = items.filter(it => (it.product?.id || (it.product as any)?._id || it.product?.slug) === prodId);
                  const currentQuantity = cartItemsForProduct.reduce((sum, it) => sum + it.quantity, 0);

                  return (
                    <td key={prodId} className="p-4 align-top w-64 border-l border-[#dfd5e8] relative">
                      <button
                        onClick={() => removeFromCompare(prodId)}
                        className="absolute top-3 right-3 p-1.5 rounded-md bg-white/80 hover:bg-[#ede5f7] text-[#665f6e] hover:text-[#2e075d] border border-[#dfd5e8] transition-colors cursor-pointer"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-full h-32 bg-white border border-[#dfd5e8] rounded-lg p-2 overflow-hidden mb-2.5 flex items-center justify-center">
                        <img
                          src={prod.images[0] || `/images/placeholders/${prod.slug}.svg`}
                          alt={prod.modelNo}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <span className="font-mono text-xs font-semibold text-[#2e075d] bg-[#ede5f7] px-1.5 py-0.5 rounded inline-block mb-1">
                        {prod.modelNo}
                      </span>
                      <Link to={`/products/${prod.slug}`} className="block font-semibold text-sm text-[#2e075d] hover:text-[#5e3e8b] line-clamp-2 leading-snug">
                        {prod.name}
                      </Link>

                      {/* Quantity Stepper or Add to Enquiry */}
                      <div className="mt-3">
                        {currentQuantity > 0 ? (
                          <div className="w-full flex items-center justify-between bg-[#f7f4fa] border border-[#dfd5e8] rounded-lg p-0.5 h-8">
                            <button
                              type="button"
                              onClick={() => {
                                const targetItem = items.find(it => it.id === `${prodId}_standard`) || cartItemsForProduct[cartItemsForProduct.length - 1];
                                if (targetItem) {
                                  if (targetItem.quantity > 1) {
                                    updateQuantity(targetItem.id, targetItem.quantity - 1);
                                  } else {
                                    removeFromCart(targetItem.id);
                                  }
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-[#ede5f7] text-[#2e075d] border border-[#dfd5e8] transition-colors cursor-pointer"
                              title={currentQuantity === 1 ? 'Remove from enquiry' : 'Decrease quantity'}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <div className="text-center px-1 select-none font-mono text-xs text-[#2e075d] font-bold tabular-nums">
                              {currentQuantity}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const targetItem = items.find(it => it.id === `${prodId}_standard`) || cartItemsForProduct[0];
                                if (targetItem) {
                                  updateQuantity(targetItem.id, targetItem.quantity + 1);
                                } else {
                                  addToCart(prod, null, 1);
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded bg-[#381c59] hover:bg-[#2e075d] text-white transition-colors cursor-pointer"
                              title="Increase quantity"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(prod, null, 1)}
                            className="w-full py-1.5 px-3 bg-[#381c59] hover:bg-[#2e075d] text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors shadow-sm cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to enquiry</span>
                          </button>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Category */}
              {(!hideIdentical || diffCategory) && (
                <tr className={`border-b border-[#dfd5e8] transition-colors ${
                  highlightDiff && diffCategory ? 'bg-[#ede5f7]/30' : 'bg-[#f7f4fa]/20'
                }`}>
                  <td className={`p-4 font-bold border-r border-[#dfd5e8] ${
                    highlightDiff && diffCategory ? 'bg-[#ede5f7] border-l-4 border-l-[#5e3e8b] text-[#381c59]' : 'bg-[#f2ecf7] text-[#2e075d]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Category</span>
                      {highlightDiff && diffCategory && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#9080a5]/25 text-[#2e075d] font-semibold border border-[#9080a5]/40">
                          Diff
                        </span>
                      )}
                    </div>
                  </td>
                  {compareList.map(prod => (
                    <td key={prod.id} className={`p-4 border-l border-[#dfd5e8] ${
                      highlightDiff && diffCategory ? 'text-[#2e075d] font-semibold' : 'text-[#665f6e]'
                    }`}>
                      {prod.category}
                    </td>
                  ))}
                </tr>
              )}

              {/* Row 3: Catalogue Page */}
              {(!hideIdentical || diffPage) && (
                <tr className={`border-b border-[#dfd5e8] transition-colors ${
                  highlightDiff && diffPage ? 'bg-[#ede5f7]/30' : ''
                }`}>
                  <td className={`p-4 font-bold border-r border-[#dfd5e8] ${
                    highlightDiff && diffPage ? 'bg-[#ede5f7] border-l-4 border-l-[#5e3e8b] text-[#381c59]' : 'bg-[#f2ecf7] text-[#2e075d]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Catalogue Page</span>
                      {highlightDiff && diffPage && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#9080a5]/25 text-[#2e075d] font-semibold border border-[#9080a5]/40">
                          Diff
                        </span>
                      )}
                    </div>
                  </td>
                  {compareList.map(prod => (
                    <td key={prod.id} className="p-4 border-l border-[#dfd5e8] font-mono text-xs text-[#2e075d]">
                      Page {prod.cataloguePage}
                    </td>
                  ))}
                </tr>
              )}

              {/* Row 4: Description */}
              {(!hideIdentical || diffDesc) && (
                <tr className={`border-b border-[#dfd5e8] transition-colors ${
                  highlightDiff && diffDesc ? 'bg-[#ede5f7]/30' : 'bg-[#f7f4fa]/20'
                }`}>
                  <td className={`p-4 font-bold border-r border-[#dfd5e8] ${
                    highlightDiff && diffDesc ? 'bg-[#ede5f7] border-l-4 border-l-[#5e3e8b] text-[#381c59]' : 'bg-[#f2ecf7] text-[#2e075d]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Description</span>
                      {highlightDiff && diffDesc && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#9080a5]/25 text-[#2e075d] font-semibold border border-[#9080a5]/40">
                          Diff
                        </span>
                      )}
                    </div>
                  </td>
                  {compareList.map(prod => (
                    <td key={prod.id} className="p-4 border-l border-[#dfd5e8] text-[#665f6e] leading-relaxed">
                      {prod.description}
                    </td>
                  ))}
                </tr>
              )}

              {/* Row 5: Key Features */}
              {(!hideIdentical || diffFeatures) && (
                <tr className={`border-b border-[#dfd5e8] transition-colors ${
                  highlightDiff && diffFeatures ? 'bg-[#ede5f7]/30' : ''
                }`}>
                  <td className={`p-4 font-bold border-r border-[#dfd5e8] ${
                    highlightDiff && diffFeatures ? 'bg-[#ede5f7] border-l-4 border-l-[#5e3e8b] text-[#381c59]' : 'bg-[#f2ecf7] text-[#2e075d]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Key Features</span>
                      {highlightDiff && diffFeatures && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#9080a5]/25 text-[#2e075d] font-semibold border border-[#9080a5]/40">
                          Diff
                        </span>
                      )}
                    </div>
                  </td>
                  {compareList.map(prod => (
                    <td key={prod.id} className="p-4 border-l border-[#dfd5e8]">
                      {prod.keyFeatures && prod.keyFeatures.length > 0 ? (
                        <ul className="space-y-1.5 text-[#665f6e]">
                          {prod.keyFeatures.map((f, i) => (
                            <li key={i} className="flex items-start space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5e3e8b] shrink-0 mt-1"></span>
                              <span className="leading-snug">{f}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-[#9080a5] italic">Not explicitly specified</span>
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {/* Row 6: Applications */}
              {(!hideIdentical || diffApps) && (
                <tr className={`border-b border-[#dfd5e8] transition-colors ${
                  highlightDiff && diffApps ? 'bg-[#ede5f7]/30' : 'bg-[#f7f4fa]/20'
                }`}>
                  <td className={`p-4 font-bold border-r border-[#dfd5e8] ${
                    highlightDiff && diffApps ? 'bg-[#ede5f7] border-l-4 border-l-[#5e3e8b] text-[#381c59]' : 'bg-[#f2ecf7] text-[#2e075d]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Applications</span>
                      {highlightDiff && diffApps && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#9080a5]/25 text-[#2e075d] font-semibold border border-[#9080a5]/40">
                          Diff
                        </span>
                      )}
                    </div>
                  </td>
                  {compareList.map(prod => (
                    <td key={prod.id} className="p-4 border-l border-[#dfd5e8]">
                      {prod.applications && prod.applications.length > 0 ? (
                        <ul className="space-y-1.5 text-[#665f6e]">
                          {prod.applications.map((app, i) => (
                            <li key={i} className="flex items-start space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5e3e8b] shrink-0 mt-1"></span>
                              <span className="leading-snug">{app}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-[#9080a5] italic">General workshop use</span>
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {/* Row 7: Set Includes */}
              {(!hideIdentical || diffSet) && (
                <tr className={`border-b border-[#dfd5e8] transition-colors ${
                  highlightDiff && diffSet ? 'bg-[#ede5f7]/30' : ''
                }`}>
                  <td className={`p-4 font-bold border-r border-[#dfd5e8] ${
                    highlightDiff && diffSet ? 'bg-[#ede5f7] border-l-4 border-l-[#5e3e8b] text-[#381c59]' : 'bg-[#f2ecf7] text-[#2e075d]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Set Contents</span>
                      {highlightDiff && diffSet && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#9080a5]/25 text-[#2e075d] font-semibold border border-[#9080a5]/40">
                          Diff
                        </span>
                      )}
                    </div>
                  </td>
                  {compareList.map(prod => (
                    <td key={prod.id} className="p-4 border-l border-[#dfd5e8]">
                      {prod.setIncludes && prod.setIncludes.length > 0 ? (
                        <ul className="space-y-1 text-[#665f6e]">
                          {prod.setIncludes.map((it, i) => (
                            <li key={i} className="leading-snug">• {it}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-[#9080a5] italic">Single tooling unit / component</span>
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {/* Row 8: Sizes & Dimensions Detail */}
              {(!hideIdentical || diffSizes) && (
                <tr className={`border-b border-[#dfd5e8] transition-colors ${
                  highlightDiff && diffSizes ? 'bg-[#ede5f7]/30' : 'bg-[#f7f4fa]/20'
                }`}>
                  <td className={`p-4 font-bold border-r border-[#dfd5e8] ${
                    highlightDiff && diffSizes ? 'bg-[#ede5f7] border-l-4 border-l-[#5e3e8b] text-[#381c59]' : 'bg-[#f2ecf7] text-[#2e075d]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Sizes Detail</span>
                      {highlightDiff && diffSizes && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#9080a5]/25 text-[#2e075d] font-semibold border border-[#9080a5]/40">
                          Diff
                        </span>
                      )}
                    </div>
                  </td>
                  {compareList.map(prod => (
                    <td key={prod.id} className="p-4 border-l border-[#dfd5e8] font-mono text-[11px] text-[#2e075d]">
                      {prod.sizesDetail && prod.sizesDetail.length > 0 ? (
                        prod.sizesDetail.map((sz, i) => <div key={i} className="mb-1 leading-snug">{sz}</div>)
                      ) : (
                        <span className="text-[#9080a5] italic font-sans text-xs">See sub-models table</span>
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {/* Row 9: Compatibility */}
              {(!hideIdentical || diffCompat) && (
                <tr className={`border-b border-[#dfd5e8] transition-colors ${
                  highlightDiff && diffCompat ? 'bg-[#ede5f7]/30' : ''
                }`}>
                  <td className={`p-4 font-bold border-r border-[#dfd5e8] ${
                    highlightDiff && diffCompat ? 'bg-[#ede5f7] border-l-4 border-l-[#5e3e8b] text-[#381c59]' : 'bg-[#f2ecf7] text-[#2e075d]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Compatibility</span>
                      {highlightDiff && diffCompat && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#9080a5]/25 text-[#2e075d] font-semibold border border-[#9080a5]/40">
                          Diff
                        </span>
                      )}
                    </div>
                  </td>
                  {compareList.map(prod => (
                    <td key={prod.id} className="p-4 border-l border-[#dfd5e8] text-[#665f6e]">
                      {prod.compatibility || <span className="text-[#9080a5] italic">Standard industrial</span>}
                    </td>
                  ))}
                </tr>
              )}

              {/* Row 10: Sub-Model / Variants Count */}
              {(!hideIdentical || diffVariants) && (
                <tr className={`border-b border-[#dfd5e8] transition-colors ${
                  highlightDiff && diffVariants ? 'bg-[#ede5f7]/30' : 'bg-[#f7f4fa]/20'
                }`}>
                  <td className={`p-4 font-bold border-r border-[#dfd5e8] ${
                    highlightDiff && diffVariants ? 'bg-[#ede5f7] border-l-4 border-l-[#5e3e8b] text-[#381c59]' : 'bg-[#f2ecf7] text-[#2e075d]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Variant Options</span>
                      {highlightDiff && diffVariants && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#9080a5]/25 text-[#2e075d] font-semibold border border-[#9080a5]/40">
                          Diff
                        </span>
                      )}
                    </div>
                  </td>
                  {compareList.map(prod => (
                    <td key={prod.id} className="p-4 border-l border-[#dfd5e8] text-xs">
                      {prod.subModels && prod.subModels.length > 0 ? (
                        <span className="inline-block bg-[#ede5f7] text-[#2e075d] font-mono text-xs font-semibold px-2 py-0.5 rounded border border-[#dfd5e8]">
                          {prod.subModels.length} variants
                        </span>
                      ) : (
                        <span className="text-[#665f6e]">Standard single model</span>
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {/* Row 11: Technical Item Specifics */}
              {(!hideIdentical || diffSpecifics) && (
                <tr className={`transition-colors ${
                  highlightDiff && diffSpecifics ? 'bg-[#ede5f7]/30' : ''
                }`}>
                  <td className={`p-4 font-bold border-r border-[#dfd5e8] ${
                    highlightDiff && diffSpecifics ? 'bg-[#ede5f7] border-l-4 border-l-[#5e3e8b] text-[#381c59]' : 'bg-[#f2ecf7] text-[#2e075d]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Item Specifics</span>
                      {highlightDiff && diffSpecifics && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#9080a5]/25 text-[#2e075d] font-semibold border border-[#9080a5]/40">
                          Diff
                        </span>
                      )}
                    </div>
                  </td>
                  {compareList.map(prod => (
                    <td key={prod.id} className="p-4 border-l border-[#dfd5e8] space-y-1">
                      {prod.itemSpecifics && Object.keys(prod.itemSpecifics).length > 0 ? (
                        Object.entries(prod.itemSpecifics).map(([k, v]) => (
                          <div key={k} className="text-[11px] leading-snug">
                            <strong className="text-[#2e075d] font-semibold">{k}:</strong> <span className="text-[#665f6e]">{String(v)}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[#9080a5] italic text-[11px]">None specified</span>
                      )}
                    </td>
                  ))}
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>


      {/* ========================================================================= */}
      {/* 2. MOBILE VIEW (No Swiping • Full Width Headers • Expandable Accordions) */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-5">
        
        {/* Mobile Header Title */}
        <div className="pb-1">
          <h1 className="font-heading font-bold text-xl text-[#2e075d]">
            Technical Specification Comparison
          </h1>
          <p className="text-xs text-[#665f6e] mt-0.5">
            Comparing <strong className="text-[#2e075d] font-semibold">{compareList.length}</strong> tools •{' '}
            <span className="text-[#6e568b] font-medium">{totalDifferences} attributes differ</span>
          </p>
        </div>

        {/* 1. PRODUCT OVERVIEW (Side-by-Side Product Cards) */}
        <section className="bg-white rounded-xl border border-[#dfd5e8] p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#dfd5e8]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2e075d]">
              Selected Tools ({compareList.length}/4)
            </span>
            {isMultiMobile ? (
              <span className="text-[10px] text-[#5e3e8b] font-medium flex items-center space-x-1 bg-[#ede5f7] px-2 py-0.5 rounded-full border border-[#dfd5e8]">
                <span>← Swipe to compare all →</span>
              </span>
            ) : (
              <span className="text-[10px] text-[#6e568b]">
                Side-by-side overview
              </span>
            )}
          </div>

          <div className={isMultiMobile ? "overflow-x-auto scrollbar-thin pb-1.5 -mx-1 px-1" : ""}>
            <div className={isMultiMobile ? "flex gap-2.5 min-w-max" : "grid grid-cols-2 gap-2"}>
              {compareList.map(prod => {
                const prodId = prod.id || (prod as any)._id || prod.slug;
                const cartItemsForProduct = items.filter(it => (it.product?.id || (it.product as any)?._id || it.product?.slug) === prodId);
                const currentQuantity = cartItemsForProduct.reduce((sum, it) => sum + it.quantity, 0);

                return (
                  <div
                    key={prodId}
                    className={`bg-[#fdfcfe] border border-[#dfd5e8] hover:border-[#5e3e8b] rounded-xl p-2.5 flex flex-col justify-between transition-all shadow-xs group ${mobileColWidth}`}
                  >
                    <div>
                      {/* Thumbnail & Remove button */}
                      <div className="relative w-full aspect-square max-h-28 bg-white border border-[#dfd5e8] rounded-lg p-1.5 mb-1.5 flex items-center justify-center overflow-hidden">
                        <button
                          onClick={() => removeFromCompare(prodId)}
                          className="absolute top-1 right-1 p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-md bg-white/95 hover:bg-[#ede5f7] text-[#665f6e] hover:text-[#2e075d] border border-[#dfd5e8] transition-colors shadow-xs z-10 cursor-pointer"
                          title="Remove product"
                          aria-label="Remove product from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <img
                          src={prod.images[0] || `/images/placeholders/${prod.slug}.svg`}
                          alt={prod.modelNo}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Model & Name */}
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] font-bold text-[#2e075d] bg-[#ede5f7] px-1.5 py-0.5 rounded inline-block">
                          {prod.modelNo}
                        </span>
                        <Link
                          to={`/products/${prod.slug}`}
                          className="block font-semibold text-xs text-[#2e075d] hover:text-[#5e3e8b] line-clamp-2 leading-snug min-h-[1.75rem]"
                          title={prod.name}
                        >
                          {prod.name}
                        </Link>
                      </div>
                    </div>

                    {/* Enquiry Action / Quantity Stepper */}
                    <div className="mt-2 pt-1.5 border-t border-[#dfd5e8]">
                      {currentQuantity > 0 ? (
                        <div className="w-full flex items-center justify-between bg-[#f7f4fa] border border-[#dfd5e8] rounded-lg p-0.5 h-8">
                          <button
                            type="button"
                            onClick={() => {
                              const targetItem = items.find(it => it.id === `${prodId}_standard`) || cartItemsForProduct[cartItemsForProduct.length - 1];
                              if (targetItem) {
                                if (targetItem.quantity > 1) {
                                  updateQuantity(targetItem.id, targetItem.quantity - 1);
                                } else {
                                  removeFromCart(targetItem.id);
                                }
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-[#ede5f7] text-[#2e075d] border border-[#dfd5e8] transition-colors cursor-pointer"
                            title={currentQuantity === 1 ? 'Remove from enquiry' : 'Decrease quantity'}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold text-[#2e075d] tabular-nums">
                            {currentQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const targetItem = items.find(it => it.id === `${prodId}_standard`) || cartItemsForProduct[0];
                              if (targetItem) {
                                updateQuantity(targetItem.id, targetItem.quantity + 1);
                              } else {
                                addToCart(prod, null, 1);
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded bg-[#381c59] hover:bg-[#2e075d] text-white transition-colors cursor-pointer"
                            title="Increase quantity"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(prod, null, 1)}
                          className="w-full py-1.5 px-2 min-h-[32px] bg-[#381c59] hover:bg-[#2e075d] text-white rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Enquire</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. HORIZONTAL CATEGORY NAVIGATION TABS */}
        <nav aria-label="Comparison categories" className="overflow-x-auto scrollbar-none py-1 -mx-4 px-4">
          <div className="flex items-center space-x-1.5 min-w-max">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#381c59] text-white shadow-xs font-semibold'
                      : 'bg-white hover:bg-[#ede5f7] text-[#2e075d] border border-[#dfd5e8]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#5e3e8b]'}`} />
                  <span>{tab.label}</span>
                  {tab.diffs > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#ede5f7] text-[#2e075d]'
                    }`}>
                      {tab.diffs}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* 3. STICKY COMPARISON TOOLBAR */}
        <div className="sticky top-[86px] z-30 bg-white/95 backdrop-blur-md border border-[#dfd5e8] rounded-xl px-3 py-2 shadow-sm transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Controls: Highlight Diff & Hide Identical */}
            <div className="flex items-center space-x-2.5">
              <label className="flex items-center space-x-1.5 cursor-pointer text-[#2e075d] font-medium select-none text-[11px]">
                <input
                  type="checkbox"
                  checked={highlightDiff}
                  onChange={(e) => setHighlightDiff(e.target.checked)}
                  className="rounded text-[#381c59] focus:ring-[#5e3e8b] w-3.5 h-3.5 cursor-pointer"
                />
                <span>Highlight diff</span>
              </label>

              <span className="text-[#dfd5e8]">|</span>

              <label className="flex items-center space-x-1.5 cursor-pointer text-[#2e075d] font-medium select-none text-[11px]">
                <input
                  type="checkbox"
                  checked={hideIdentical}
                  onChange={(e) => setHideIdentical(e.target.checked)}
                  className="rounded text-[#381c59] focus:ring-[#5e3e8b] w-3.5 h-3.5 cursor-pointer"
                />
                <span>Hide identical</span>
              </label>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={clearCompare}
                className="inline-flex items-center space-x-1 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
                title="Clear all"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>

              <Link
                to="/catalogue"
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-[#2e075d] bg-[#ede5f7] hover:bg-[#dfd5e8] rounded-lg border border-[#dfd5e8] transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add tool</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4. EXPANDABLE ACCORDION SECTIONS */}
        <div className="space-y-3.5">
          
          {/* Accordion 1: General Specifications */}
          <section id="general-specifications" className="scroll-mt-44 bg-white rounded-xl border border-[#dfd5e8] overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('general-specifications')}
              className="w-full flex items-center justify-between p-3 bg-[#ede5f7]/60 hover:bg-[#ede5f7] transition-colors border-b border-[#dfd5e8] cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#5e3e8b]" />
                <h2 className="font-heading font-bold text-sm text-[#2e075d]">
                  General Specifications
                </h2>
                {countGeneralDiffs > 0 && (
                  <span className="text-[10px] font-mono font-semibold bg-[#9080a5]/25 text-[#2e075d] px-1.5 py-0.2 rounded-full border border-[#9080a5]/40">
                    {countGeneralDiffs} diff
                  </span>
                )}
              </div>
              {openSections['general-specifications'] ? <ChevronUp className="w-4 h-4 text-[#6e568b]" /> : <ChevronDown className="w-4 h-4 text-[#6e568b]" />}
            </button>

            {openSections['general-specifications'] && (
              <div className={isMultiMobile ? "overflow-x-auto scrollbar-thin" : ""}>
                <div className={isMultiMobile ? "min-w-max" : ""}>
                  {/* Category */}
                  {(!hideIdentical || diffCategory) && (
                    <div className={`border-b border-[#dfd5e8] ${highlightDiff && diffCategory ? 'bg-[#ede5f7]/30 border-l-4 border-l-[#5e3e8b]' : 'bg-white'}`}>
                      <div className="bg-[#f2ecf7]/90 px-3 py-1 flex items-center justify-between border-b border-[#dfd5e8]/70 text-[11px] font-bold text-[#2e075d] sticky left-0">
                        <span>Category</span>
                        {highlightDiff && diffCategory && (
                          <span className="text-[9px] font-mono uppercase bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded font-semibold border border-[#5e3e8b]/30">Diff</span>
                        )}
                      </div>
                      <div className={mobileRowClass}>
                        {compareList.map(p => (
                          <div key={p.id} className={`p-2.5 text-xs text-[#2e075d] ${mobileColWidth}`}>
                            <span className="font-mono text-[9px] text-[#6e568b] block mb-0.5 font-semibold">{p.modelNo}</span>
                            <span className="font-medium">{p.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Catalogue Page */}
                  {(!hideIdentical || diffPage) && (
                    <div className={`border-b border-[#dfd5e8] ${highlightDiff && diffPage ? 'bg-[#ede5f7]/30 border-l-4 border-l-[#5e3e8b]' : 'bg-white'}`}>
                      <div className="bg-[#f2ecf7]/90 px-3 py-1 flex items-center justify-between border-b border-[#dfd5e8]/70 text-[11px] font-bold text-[#2e075d] sticky left-0">
                        <span>Catalogue Page</span>
                        {highlightDiff && diffPage && (
                          <span className="text-[9px] font-mono uppercase bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded font-semibold border border-[#5e3e8b]/30">Diff</span>
                        )}
                      </div>
                      <div className={mobileRowClass}>
                        {compareList.map(p => (
                          <div key={p.id} className={`p-2.5 text-xs text-[#2e075d] ${mobileColWidth}`}>
                            <span className="font-mono text-[9px] text-[#6e568b] block mb-0.5 font-semibold">{p.modelNo}</span>
                            <span className="font-mono text-xs font-semibold">Page {p.cataloguePage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {(!hideIdentical || diffDesc) && (
                    <div className={`${highlightDiff && diffDesc ? 'bg-[#ede5f7]/30 border-l-4 border-l-[#5e3e8b]' : 'bg-white'}`}>
                      <div className="bg-[#f2ecf7]/90 px-3 py-1 flex items-center justify-between border-b border-[#dfd5e8]/70 text-[11px] font-bold text-[#2e075d] sticky left-0">
                        <span>Description</span>
                        {highlightDiff && diffDesc && (
                          <span className="text-[9px] font-mono uppercase bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded font-semibold border border-[#5e3e8b]/30">Diff</span>
                        )}
                      </div>
                      <div className={mobileRowClass}>
                        {compareList.map(p => (
                          <div key={p.id} className={`p-2.5 text-xs text-[#665f6e] leading-relaxed ${mobileColWidth}`}>
                            <span className="font-mono text-[9px] text-[#6e568b] block mb-0.5 font-semibold">{p.modelNo}</span>
                            {p.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Accordion 2: Technical Details */}
          <section id="technical-details" className="scroll-mt-44 bg-white rounded-xl border border-[#dfd5e8] overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('technical-details')}
              className="w-full flex items-center justify-between p-3 bg-[#ede5f7]/60 hover:bg-[#ede5f7] transition-colors border-b border-[#dfd5e8] cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-[#5e3e8b]" />
                <h2 className="font-heading font-bold text-sm text-[#2e075d]">
                  Technical Details
                </h2>
                {countTechDiffs > 0 && (
                  <span className="text-[10px] font-mono font-semibold bg-[#9080a5]/25 text-[#2e075d] px-1.5 py-0.2 rounded-full border border-[#9080a5]/40">
                    {countTechDiffs} diff
                  </span>
                )}
              </div>
              {openSections['technical-details'] ? <ChevronUp className="w-4 h-4 text-[#6e568b]" /> : <ChevronDown className="w-4 h-4 text-[#6e568b]" />}
            </button>

            {openSections['technical-details'] && (
              <div className={isMultiMobile ? "overflow-x-auto scrollbar-thin" : ""}>
                <div className={isMultiMobile ? "min-w-max" : ""}>
                  {/* Dynamic Item Specifics */}
                  {allItemSpecificKeys.map(key => {
                    const isDiff = !!diffItemSpecifics[key];
                    if (hideIdentical && !isDiff) return null;
                    return (
                      <div key={key} className={`border-b border-[#dfd5e8] ${highlightDiff && isDiff ? 'bg-[#ede5f7]/30 border-l-4 border-l-[#5e3e8b]' : 'bg-white'}`}>
                        <div className="bg-[#f2ecf7]/90 px-3 py-1 flex items-center justify-between border-b border-[#dfd5e8]/70 text-[11px] font-bold text-[#2e075d] sticky left-0">
                          <span>{key}</span>
                          {highlightDiff && isDiff && (
                            <span className="text-[9px] font-mono uppercase bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded font-semibold border border-[#5e3e8b]/30">Diff</span>
                          )}
                        </div>
                        <div className={mobileRowClass}>
                          {compareList.map(p => (
                            <div key={p.id} className={`p-2.5 text-xs text-[#2e075d] ${mobileColWidth}`}>
                              <span className="font-mono text-[9px] text-[#6e568b] block mb-0.5 font-semibold">{p.modelNo}</span>
                              <span className="font-medium">{p.itemSpecifics?.[key] || <span className="text-[#6e568b] italic font-normal">Not specified</span>}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Sizes Detail */}
                  {(!hideIdentical || diffSizes) && (
                    <div className={`border-b border-[#dfd5e8] ${highlightDiff && diffSizes ? 'bg-[#ede5f7]/30 border-l-4 border-l-[#5e3e8b]' : 'bg-white'}`}>
                      <div className="bg-[#f2ecf7]/90 px-3 py-1 flex items-center justify-between border-b border-[#dfd5e8]/70 text-[11px] font-bold text-[#2e075d] sticky left-0">
                        <span>Sizes & Dimensions</span>
                        {highlightDiff && diffSizes && (
                          <span className="text-[9px] font-mono uppercase bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded font-semibold border border-[#5e3e8b]/30">Diff</span>
                        )}
                      </div>
                      <div className={mobileRowClass}>
                        {compareList.map(p => (
                          <div key={p.id} className={`p-2.5 text-xs text-[#2e075d] font-mono text-[11px] ${mobileColWidth}`}>
                            <span className="font-mono text-[9px] text-[#6e568b] block mb-0.5 font-semibold">{p.modelNo}</span>
                            {p.sizesDetail && p.sizesDetail.length > 0 ? (
                              p.sizesDetail.map((sz, i) => <div key={i} className="mb-0.5 leading-snug">{sz}</div>)
                            ) : (
                              <span className="text-[#6e568b] italic font-sans text-xs">See sub-models table</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Set Contents */}
                  {(!hideIdentical || diffSet) && (
                    <div className={`${highlightDiff && diffSet ? 'bg-[#ede5f7]/30 border-l-4 border-l-[#5e3e8b]' : 'bg-white'}`}>
                      <div className="bg-[#f2ecf7]/90 px-3 py-1 flex items-center justify-between border-b border-[#dfd5e8]/70 text-[11px] font-bold text-[#2e075d] sticky left-0">
                        <span>Set Contents</span>
                        {highlightDiff && diffSet && (
                          <span className="text-[9px] font-mono uppercase bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded font-semibold border border-[#5e3e8b]/30">Diff</span>
                        )}
                      </div>
                      <div className={mobileRowClass}>
                        {compareList.map(p => (
                          <div key={p.id} className={`p-2.5 text-xs text-[#665f6e] ${mobileColWidth}`}>
                            <span className="font-mono text-[9px] text-[#6e568b] block mb-0.5 font-semibold">{p.modelNo}</span>
                            {p.setIncludes && p.setIncludes.length > 0 ? (
                              <ul className="space-y-1">
                                {p.setIncludes.map((it, i) => <li key={i} className="leading-snug">• {it}</li>)}
                              </ul>
                            ) : (
                              <span className="text-[#6e568b] italic">Individual tooling unit</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Accordion 3: Features & Functionality */}
          <section id="features-functionality" className="scroll-mt-44 bg-white rounded-xl border border-[#dfd5e8] overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('features-functionality')}
              className="w-full flex items-center justify-between p-3 bg-[#ede5f7]/60 hover:bg-[#ede5f7] transition-colors border-b border-[#dfd5e8] cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#5e3e8b]" />
                <h2 className="font-heading font-bold text-sm text-[#2e075d]">
                  Features & Functionality
                </h2>
                {countFeaturesDiffs > 0 && (
                  <span className="text-[10px] font-mono font-semibold bg-[#9080a5]/25 text-[#2e075d] px-1.5 py-0.2 rounded-full border border-[#9080a5]/40">
                    {countFeaturesDiffs} diff
                  </span>
                )}
              </div>
              {openSections['features-functionality'] ? <ChevronUp className="w-4 h-4 text-[#6e568b]" /> : <ChevronDown className="w-4 h-4 text-[#6e568b]" />}
            </button>

            {openSections['features-functionality'] && (
              <div className={isMultiMobile ? "overflow-x-auto scrollbar-thin" : ""}>
                <div className={isMultiMobile ? "min-w-max" : ""}>
                  {(!hideIdentical || diffFeatures) && (
                    <div className={`${highlightDiff && diffFeatures ? 'bg-[#ede5f7]/30 border-l-4 border-l-[#5e3e8b]' : 'bg-white'}`}>
                      <div className="bg-[#f2ecf7]/90 px-3 py-1 flex items-center justify-between border-b border-[#dfd5e8]/70 text-[11px] font-bold text-[#2e075d] sticky left-0">
                        <span>Key Features</span>
                        {highlightDiff && diffFeatures && (
                          <span className="text-[9px] font-mono uppercase bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded font-semibold border border-[#5e3e8b]/30">Diff</span>
                        )}
                      </div>
                      <div className={mobileRowClass}>
                        {compareList.map(p => (
                          <div key={p.id} className={`p-2.5 text-xs text-[#665f6e] ${mobileColWidth}`}>
                            <span className="font-mono text-[9px] text-[#6e568b] block mb-0.5 font-semibold">{p.modelNo}</span>
                            {p.keyFeatures && p.keyFeatures.length > 0 ? (
                              <ul className="space-y-1">
                                {p.keyFeatures.map((f, i) => (
                                  <li key={i} className="flex items-start space-x-1">
                                    <Check className="w-3 h-3 text-[#5e3e8b] shrink-0 mt-0.5" />
                                    <span className="leading-snug">{f}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-[#6e568b] italic">Standard industrial tooling features</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Accordion 4: Applications & Compatibility */}
          <section id="applications-compatibility" className="scroll-mt-44 bg-white rounded-xl border border-[#dfd5e8] overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('applications-compatibility')}
              className="w-full flex items-center justify-between p-3 bg-[#ede5f7]/60 hover:bg-[#ede5f7] transition-colors border-b border-[#dfd5e8] cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-[#5e3e8b]" />
                <h2 className="font-heading font-bold text-sm text-[#2e075d]">
                  Applications & Compatibility
                </h2>
                {countAppsDiffs > 0 && (
                  <span className="text-[10px] font-mono font-semibold bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded-full border border-[#5e3e8b]/30">
                    {countAppsDiffs} diff
                  </span>
                )}
              </div>
              {openSections['applications-compatibility'] ? <ChevronUp className="w-4 h-4 text-[#6e568b]" /> : <ChevronDown className="w-4 h-4 text-[#6e568b]" />}
            </button>

            {openSections['applications-compatibility'] && (
              <div className={isMultiMobile ? "overflow-x-auto scrollbar-thin" : ""}>
                <div className={isMultiMobile ? "min-w-max" : ""}>
                  {/* Applications */}
                  {(!hideIdentical || diffApps) && (
                    <div className={`border-b border-[#dfd5e8] ${highlightDiff && diffApps ? 'bg-[#ede5f7]/30 border-l-4 border-l-[#5e3e8b]' : 'bg-white'}`}>
                      <div className="bg-[#f2ecf7]/90 px-3 py-1 flex items-center justify-between border-b border-[#dfd5e8]/70 text-[11px] font-bold text-[#2e075d] sticky left-0">
                        <span>Applications</span>
                        {highlightDiff && diffApps && (
                          <span className="text-[9px] font-mono uppercase bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded font-semibold border border-[#5e3e8b]/30">Diff</span>
                        )}
                      </div>
                      <div className={mobileRowClass}>
                        {compareList.map(p => (
                          <div key={p.id} className={`p-2.5 text-xs text-[#665f6e] ${mobileColWidth}`}>
                            <span className="font-mono text-[9px] text-[#6e568b] block mb-0.5 font-semibold">{p.modelNo}</span>
                            {p.applications && p.applications.length > 0 ? (
                              <ul className="space-y-1">
                                {p.applications.map((app, i) => (
                                  <li key={i} className="flex items-start space-x-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#5e3e8b] shrink-0 mt-1"></span>
                                    <span className="leading-snug">{app}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-[#6e568b] italic">General engine workshop use</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compatibility */}
                  {(!hideIdentical || diffCompat) && (
                    <div className={`${highlightDiff && diffCompat ? 'bg-[#ede5f7]/30 border-l-4 border-l-[#5e3e8b]' : 'bg-white'}`}>
                      <div className="bg-[#f2ecf7]/90 px-3 py-1 flex items-center justify-between border-b border-[#dfd5e8]/70 text-[11px] font-bold text-[#2e075d] sticky left-0">
                        <span>Compatibility</span>
                        {highlightDiff && diffCompat && (
                          <span className="text-[9px] font-mono uppercase bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded font-semibold border border-[#5e3e8b]/30">Diff</span>
                        )}
                      </div>
                      <div className={mobileRowClass}>
                        {compareList.map(p => (
                          <div key={p.id} className={`p-2.5 text-xs text-[#665f6e] ${mobileColWidth}`}>
                            <span className="font-mono text-[9px] text-[#6e568b] block mb-0.5 font-semibold">{p.modelNo}</span>
                            {p.compatibility || <span className="text-[#6e568b] italic">Standard industrial specification</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Accordion 5: Variants & Options */}
          {hasAnyVariants && (
            <section id="variants-options" className="scroll-mt-44 bg-white rounded-xl border border-[#dfd5e8] overflow-hidden shadow-xs">
              <button
                onClick={() => toggleSection('variants-options')}
                className="w-full flex items-center justify-between p-3 bg-[#ede5f7]/60 hover:bg-[#ede5f7] transition-colors border-b border-[#dfd5e8] cursor-pointer text-left"
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#5e3e8b]" />
                  <h2 className="font-heading font-bold text-sm text-[#2e075d]">
                    Variants & Configurations
                  </h2>
                  {countVariantDiffs > 0 && (
                    <span className="text-[10px] font-mono font-semibold bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded-full border border-[#5e3e8b]/30">
                      {countVariantDiffs} diff
                    </span>
                  )}
                </div>
                {openSections['variants-options'] ? <ChevronUp className="w-4 h-4 text-[#6e568b]" /> : <ChevronDown className="w-4 h-4 text-[#6e568b]" />}
              </button>

              {openSections['variants-options'] && (
                <div className={isMultiMobile ? "overflow-x-auto scrollbar-thin" : ""}>
                  <div className={isMultiMobile ? "min-w-max" : ""}>
                    <div className={`border-b border-[#dfd5e8] ${highlightDiff && diffVariants ? 'bg-[#ede5f7]/30 border-l-4 border-l-[#5e3e8b]' : 'bg-white'}`}>
                      <div className="bg-[#f2ecf7]/90 px-3 py-1 flex items-center justify-between border-b border-[#dfd5e8]/70 text-[11px] font-bold text-[#2e075d] sticky left-0">
                        <span>Variant Count</span>
                        {highlightDiff && diffVariants && (
                          <span className="text-[9px] font-mono uppercase bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded font-semibold border border-[#5e3e8b]/30">Diff</span>
                        )}
                      </div>
                      <div className={mobileRowClass}>
                        {compareList.map(p => (
                          <div key={p.id} className={`p-2.5 text-xs text-[#2e075d] ${mobileColWidth}`}>
                            <span className="font-mono text-[9px] text-[#6e568b] block mb-0.5 font-semibold">{p.modelNo}</span>
                            {p.subModels && p.subModels.length > 0 ? (
                              <span className="inline-block bg-[#ede5f7] text-[#2e075d] font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded border border-[#dfd5e8]">
                                {p.subModels.length} variants
                              </span>
                            ) : (
                              <span className="text-[#665f6e]">Standard single model</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`${highlightDiff && diffVariants ? 'bg-[#ede5f7]/30 border-l-4 border-l-[#5e3e8b]' : 'bg-white'}`}>
                      <div className="bg-[#f2ecf7]/90 px-3 py-1 flex items-center justify-between border-b border-[#dfd5e8]/70 text-[11px] font-bold text-[#2e075d] sticky left-0">
                        <span>Configuration Details</span>
                        {highlightDiff && diffVariants && (
                          <span className="text-[9px] font-mono uppercase bg-[#5e3e8b]/15 text-[#2e075d] px-1.5 py-0.2 rounded font-semibold border border-[#5e3e8b]/30">Diff</span>
                        )}
                      </div>
                      <div className={mobileRowClass}>
                        {compareList.map(p => (
                          <div key={p.id} className={`p-2.5 text-xs text-[#2e075d] ${mobileColWidth}`}>
                            <span className="font-mono text-[9px] text-[#6e568b] block mb-1 font-semibold">{p.modelNo}</span>
                            {p.subModels && p.subModels.length > 0 ? (
                              <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                                {p.subModels.map((sm, i) => (
                                  <div key={i} className="bg-[#f7f4fa] p-1.5 rounded border border-[#dfd5e8] text-[10px] font-mono">
                                    <div className="font-bold text-[#2e075d]">{sm.modelNo || `Var #${i + 1}`}</div>
                                    {sm.size && <div className="text-[#665f6e]">Sz: {sm.size}</div>}
                                    {sm.range && <div className="text-[#665f6e]">Rng: {sm.range}</div>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[#6e568b] italic text-xs">No sub-models</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

        </div>

      </div>

    </div>
  );
};