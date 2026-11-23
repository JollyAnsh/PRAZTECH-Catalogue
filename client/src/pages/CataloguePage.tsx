import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, LayoutGrid, List, SlidersHorizontal, X, Wrench, ArrowUpDown } from 'lucide-react';

export const CataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedCategory = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'indexNumber';

  const [searchInput, setSearchInput] = useState(searchParam);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, prodRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({
            category: selectedCategory,
            search: searchParam,
            sort: sortParam
          })
        ]);
        setCategories(cats);
        setProducts(prodRes.products);
      } catch (err) {
        console.error('Error fetching catalogue data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory, searchParam, sortParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category', slug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', e.target.value);
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
    setMobileFiltersOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#e5e0eb] pb-5 sm:pb-6">
        <h1 className="font-sans font-medium text-2xl sm:text-3xl text-[#2e075d] tracking-tight">
          Product catalogue
        </h1>
        <p className="text-xs sm:text-sm text-[#665f6e] mt-1 leading-relaxed">
          Standard manufacturing programme for valve seat grinding, cylinder honing, boring, and kingpin reaming tools.
        </p>
      </div>

      {/* Mobile Swipeable Category Pills Bar */}
      <div className="lg:hidden space-y-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
          <button
            type="button"
            onClick={() => handleCategorySelect('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 border transition-colors ${
              !selectedCategory
                ? 'bg-[#381c59] text-white border-[#381c59] shadow-xs'
                : 'bg-[#ede8f5] text-[#2e075d] border-[#dcd5e4] hover:bg-[#dcd5e4]'
            }`}
          >
            All products (41)
          </button>
          {categories.map(c => (
            <button
              key={c.slug}
              type="button"
              onClick={() => handleCategorySelect(c.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 border transition-colors ${
                selectedCategory === c.slug
                  ? 'bg-[#381c59] text-white border-[#381c59] shadow-xs'
                  : 'bg-[#ede8f5] text-[#2e075d] border-[#dcd5e4] hover:bg-[#dcd5e4]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Mobile Search & Filter Trigger Bar */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search catalogue..."
              className="w-full pl-8 pr-7 py-2 text-xs border border-[#cfc6d8] rounded-lg focus:outline-none focus:border-[#5e3e8b] bg-white text-[#2e075d]"
            />
            <Search className="w-3.5 h-3.5 text-[#6e568b] absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  const p = new URLSearchParams(searchParams);
                  p.delete('search');
                  setSearchParams(p);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6e568b] hover:text-[#2e075d] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors ${
              mobileFiltersOpen || selectedCategory || searchParam
                ? 'bg-[#381c59] text-white border-[#381c59]'
                : 'bg-white text-[#2e075d] border-[#cfc6d8] hover:bg-[#ede8f5]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Filters & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Filters */}
        <aside className={`lg:col-span-1 space-y-4 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-xl border border-[#dcd5e4] p-4 space-y-5 shadow-xs">
            
            {/* Desktop Search Box */}
            <div className="hidden lg:block">
              <label className="text-xs font-medium text-[#2e075d] block mb-1.5">
                Search catalogue
              </label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tool name or SKU..."
                  className="w-full pl-8 pr-7 py-2 text-xs border border-[#cfc6d8] rounded-lg focus:outline-none focus:border-[#5e3e8b] bg-white text-[#2e075d]"
                />
                <Search className="w-3.5 h-3.5 text-[#6e568b] absolute left-2.5 top-1/2 -translate-y-1/2" />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      const p = new URLSearchParams(searchParams);
                      p.delete('search');
                      setSearchParams(p);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6e568b] hover:text-[#2e075d]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>

            {/* Category Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#2e075d]">
                  Categories
                </label>
                {selectedCategory && (
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="text-[11px] text-[#5e3e8b] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => { handleCategorySelect(''); setMobileFiltersOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-[#381c59] text-white shadow-xs'
                      : 'text-[#2e075d] hover:bg-[#ede8f5]'
                  }`}
                >
                  All categories (41)
                </button>

                {categories.map(c => (
                  <button
                    key={c.slug}
                    onClick={() => { handleCategorySelect(c.slug); setMobileFiltersOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === c.slug
                        ? 'bg-[#381c59] text-white shadow-xs'
                        : 'text-[#2e075d] hover:bg-[#ede8f5]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Tooling Callout in Sidebar */}
            <div className="bg-[#f0edf5] border border-[#dcd5e4] rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 font-medium text-[#2e075d]">
                <Wrench className="w-3.5 h-3.5 text-[#5e3e8b]" />
                <span>Custom specifications</span>
              </div>
              <p className="text-[#665f6e] text-[11px] leading-relaxed">
                Need specialized angles or custom pilot diameters? Add custom specifications directly to your quotation enquiry.
              </p>
            </div>

            {/* Active Filter Clear */}
            {(selectedCategory || searchParam) && (
              <button
                onClick={clearAllFilters}
                className="w-full py-1.5 text-center text-xs text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            )}

          </div>
        </aside>

        {/* Right Content: Products Grid & Controls */}
        <main className="lg:col-span-3 space-y-5">
          
          {/* Top Bar Controls: Count, Sort, View Toggle */}
          <div className="bg-white rounded-xl border border-[#dfd5e8] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="text-xs text-[#6e568b]">
              Showing <span className="font-mono font-medium text-[#2e075d]">{products.length}</span> tools
              {selectedCategory && (
                <span className="ml-1 text-[#2e075d] font-medium">
                  in {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                </span>
              )}
              {searchParam && (
                <span className="ml-1 text-[#2e075d] font-medium">
                  matching "{searchParam}"
                </span>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-2.5 w-full sm:w-auto">
              {/* Sort Dropdown */}
              <div className="flex items-center space-x-1.5 text-xs text-[#6e568b] flex-1 sm:flex-none">
                <ArrowUpDown className="w-3.5 h-3.5 shrink-0 text-[#6e568b]" />
                <select
                  value={sortParam}
                  onChange={handleSortChange}
                  className="w-full sm:w-auto border border-[#c5b6d5] rounded-md py-1 px-2.5 bg-white text-xs focus:outline-none focus:border-[#5e3e8b] font-medium text-[#2e075d]"
                >
                  <option value="indexNumber">Sort: Catalogue page</option>
                  <option value="name">Sort: Name (A to Z)</option>
                  <option value="name_desc">Sort: Name (Z to A)</option>
                  <option value="model">Sort: Model SKU</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="flex items-center border border-[#dfd5e8] rounded-md overflow-hidden shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-[#381c59] text-white' : 'bg-white text-[#6e568b] hover:bg-[#ede5f7]'}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-[#381c59] text-white' : 'bg-white text-[#6e568b] hover:bg-[#ede5f7]'}`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Listing */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-[#5e3e8b] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-[#6e568b] font-mono">Loading catalogue records...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#dfd5e8] p-10 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#ede5f7] text-[#5e3e8b] flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-base text-[#2e075d]">
                No tools match your query
              </h3>
              <p className="text-xs text-[#6e568b] max-w-sm mx-auto">
                No tooling items matched your search filter. Try searching for a model SKU (e.g. PSH-VGKP, VSCCT, HONE).
              </p>
              <button
                onClick={clearAllFilters}
                className="px-3.5 py-1.5 bg-[#381c59] hover:bg-[#5e3e8b] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
              {products.map(p => (
                <ProductCard key={p.id} product={p} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map(p => (
                <ProductCard key={p.id} product={p} viewMode="list" />
              ))}
            </div>
          )}

        </main>

      </div>
    </div>
  );
};
