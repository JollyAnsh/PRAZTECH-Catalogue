import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FileText, Menu, X, ChevronDown } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

export const Navbar: React.FC = () => {
  const { totalItems, compareList, justAdded } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const location = useLocation();

  const catContainerRef = useRef<HTMLDivElement>(null);
  const catButtonRef = useRef<HTMLButtonElement>(null);
  const catMenuRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: 'Valve Seat Grinding Tools', slug: 'valve-seat-grinding-tools' },
    { name: 'Honing & Boring Tools', slug: 'honing-and-boring-tools' },
    { name: 'Valve Seat Cutting Tools', slug: 'valve-seat-cutting-tools' },
    { name: 'Kingpin Reaming Tools', slug: 'kingpin-reaming-tools' }
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close categories dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (catContainerRef.current && !catContainerRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    };
    if (catDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [catDropdownOpen]);

  // Handle keyboard interaction on Category toggle button
  const handleButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setCatDropdownOpen(true);
      setTimeout(() => {
        const firstItem = catMenuRef.current?.querySelector<HTMLAnchorElement>('[role="menuitem"]');
        firstItem?.focus();
      }, 50);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCatDropdownOpen(false);
    }
  };

  // Handle keyboard navigation inside Category dropdown menu
  const handleMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setCatDropdownOpen(false);
      catButtonRef.current?.focus();
      return;
    }

    const items = Array.from(catMenuRef.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') || []);
    const currentIndex = items.indexOf(document.activeElement as HTMLAnchorElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      items[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      items[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === 'Tab') {
      // Close dropdown if user tabs out
      setCatDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#2e075d] border-b border-[#381c59] text-white shadow-sm">
      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-2.5 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18 flex-nowrap">
          
          {/* Left: Logo Artwork */}
          <Link to="/" className="flex items-center shrink-0 py-1" title="PRAZTECH® Engineering">
            <img
              src="/images/logo-white.png"
              alt="PRAZTECH® Engineering"
              className="h-7 xs:h-8 sm:h-9 lg:h-10 w-auto object-contain"
            />
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            <Link
              to="/"
              className={`h-9 px-3.5 inline-flex items-center rounded-lg text-xs font-medium transition-colors ${
                isActive('/') ? 'text-white bg-[#381c59] border border-[#5e3e8b]/40' : 'text-[#dcd5e4] hover:text-white hover:bg-[#381c59]'
              }`}
            >
              Home
            </Link>

            <Link
              to="/catalogue"
              className={`h-9 px-3.5 inline-flex items-center rounded-lg text-xs font-medium transition-colors ${
                isActive('/catalogue') && !location.search ? 'text-white bg-[#381c59] border border-[#5e3e8b]/40' : 'text-[#dcd5e4] hover:text-white hover:bg-[#381c59]'
              }`}
            >
              All Products
            </Link>

            {/* Accessible Category Dropdown with Full ARIA Disclosure & Keyboard Support */}
            <div className="relative" ref={catContainerRef}>
              <button
                ref={catButtonRef}
                type="button"
                id="navbar-categories-button"
                aria-haspopup="true"
                aria-expanded={catDropdownOpen}
                aria-controls="navbar-categories-menu"
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                onKeyDown={handleButtonKeyDown}
                className={`h-9 px-3.5 inline-flex items-center space-x-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  catDropdownOpen
                    ? 'text-white bg-[#381c59] border border-[#5e3e8b]/50'
                    : 'text-[#dcd5e4] hover:text-white hover:bg-[#381c59]'
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-0.5 opacity-80 transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {catDropdownOpen && (
                <div
                  ref={catMenuRef}
                  id="navbar-categories-menu"
                  role="menu"
                  aria-labelledby="navbar-categories-button"
                  onKeyDown={handleMenuKeyDown}
                  className="absolute top-full left-0 mt-1 w-64 bg-[#2e075d] border border-[#5e3e8b]/60 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  {categories.map((c, idx) => (
                    <Link
                      key={c.slug}
                      role="menuitem"
                      tabIndex={0}
                      to={`/catalogue?category=${c.slug}`}
                      className="block px-3.5 py-2.5 text-xs text-[#dcd5e4] hover:bg-[#381c59] hover:text-white focus:bg-[#381c59] focus:text-white focus:outline-none transition-colors border-l-2 border-transparent hover:border-[#b5a8c8] focus:border-[#b5a8c8]"
                      onClick={() => setCatDropdownOpen(false)}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Compare Link with Badge */}
            <Link
              to="/compare"
              className={`h-9 px-3.5 inline-flex items-center space-x-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/compare') ? 'text-white bg-[#381c59] border border-[#5e3e8b]/40' : 'text-[#dcd5e4] hover:text-white hover:bg-[#381c59]'
              }`}
            >
              <span>Compare</span>
              {compareList.length > 0 && (
                <span className="bg-[#5e3e8b] text-white text-[11px] font-mono px-1.5 py-0.2 rounded font-bold">
                  {compareList.length}
                </span>
              )}
            </Link>

            {/* Custom Tooling Link */}
            <Link
              to="/custom-enquiry"
              className={`h-9 px-3.5 inline-flex items-center rounded-lg text-xs font-medium transition-colors ${
                isActive('/custom-enquiry') ? 'text-white bg-[#381c59] border border-[#5e3e8b]/40' : 'text-[#dcd5e4] hover:text-white hover:bg-[#381c59]'
              }`}
            >
              Custom Tooling
            </Link>

            <Link
              to="/about"
              className={`h-9 px-3.5 inline-flex items-center rounded-lg text-xs font-medium transition-colors ${
                isActive('/about') ? 'text-white bg-[#381c59] border border-[#5e3e8b]/40' : 'text-[#dcd5e4] hover:text-white hover:bg-[#381c59]'
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`h-9 px-3.5 inline-flex items-center rounded-lg text-xs font-medium transition-colors ${
                isActive('/contact') ? 'text-white bg-[#381c59] border border-[#5e3e8b]/40' : 'text-[#dcd5e4] hover:text-white hover:bg-[#381c59]'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right: Actions Bar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Clean Custom Language Selector */}
            <LanguageSelector variant="desktop" />

            {/* WhatsApp CTA Button */}
            <a
              href="https://wa.me/918744020102?text=Hello%20PRAZTECH%C2%AE%20Engineering%2C%20I%20would%20like%20to%20enquire%20about%20your%20tooling%20catalogue."
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-2.5 sm:px-3 inline-flex items-center justify-center space-x-1.5 bg-[#24064a] hover:bg-[#381c59] text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-medium border border-[#5e3e8b]/40 leading-none transition-colors shrink-0 box-border"
              title="Chat directly on WhatsApp (+91 8744020102)"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* My Enquiry Cart Button - Purple Brand Palette with Dynamic Glow */}
            <div className="relative">
              <Link
                to="/enquiry"
                className={`h-9 px-2.5 sm:px-3.5 inline-flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg text-xs font-medium transition-all duration-300 border leading-none shrink-0 box-border cursor-pointer ${
                  justAdded
                    ? 'bg-[#b5a8c8] text-[#2e075d] border-white ring-4 ring-[#b5a8c8]/80 shadow-[0_0_28px_rgba(181,168,200,0.95),0_0_14px_rgba(94,62,139,0.8)] scale-105 font-bold animate-pulse'
                    : totalItems > 0
                    ? 'bg-[#b5a8c8] hover:bg-[#c5b8d8] text-[#2e075d] border-[#b5a8c8] font-bold shadow-sm'
                    : 'bg-[#381c59] hover:bg-[#5e3e8b] text-white border-[#5e3e8b]/50'
                }`}
                title="View your enquiry list"
              >
                <FileText className={`w-3.5 h-3.5 shrink-0 transition-transform ${justAdded ? 'scale-110' : ''}`} />
                <span className="hidden sm:inline">Enquiry</span>
                <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded leading-none transition-all duration-300 ${
                  justAdded
                    ? 'bg-[#2e075d] text-[#fefdfe] font-black ring-2 ring-[#fefdfe] scale-110 shadow-sm'
                    : totalItems > 0
                    ? 'bg-[#2e075d] text-white font-bold'
                    : 'bg-[#24064a] text-[#b5a8c8]'
                }`}>
                  {totalItems}
                </span>
              </Link>
            </div>

            {/* Mobile Menu Toggle Button with ARIA Disclosure */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center text-[#dcd5e4] hover:text-white rounded-lg hover:bg-[#381c59] border border-transparent hover:border-[#5e3e8b]/40 focus:outline-none shrink-0 cursor-pointer box-border"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-nav-menu" className="lg:hidden bg-[#24064a] border-t border-[#381c59] px-4 pt-3 pb-6 space-y-2">
          {/* Prominent My Enquiry in Mobile Drawer */}
          <Link
            to="/enquiry"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 border ${
              justAdded
                ? 'bg-[#b5a8c8] text-[#2e075d] border-white ring-4 ring-[#b5a8c8]/80 shadow-[0_0_24px_rgba(181,168,200,0.85)] font-bold scale-[1.02]'
                : totalItems > 0
                ? 'bg-[#b5a8c8] text-[#2e075d] border-[#b5a8c8] font-bold'
                : 'bg-[#381c59] text-white border-[#5e3e8b]/60'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Review enquiry list</span>
            </div>
            <span className={`text-xs font-mono px-2 py-0.5 rounded transition-all duration-300 ${
              justAdded
                ? 'bg-[#2e075d] text-[#fefdfe] font-black ring-1 ring-[#fefdfe]'
                : totalItems > 0
                ? 'bg-[#2e075d] text-white font-bold'
                : 'bg-[#24064a] text-[#b5a8c8]'
            }`}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </Link>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#dcd5e4] hover:bg-[#381c59] transition-colors"
          >
            Home
          </Link>
          <Link
            to="/catalogue"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#dcd5e4] hover:bg-[#381c59] transition-colors"
          >
            Catalogue
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#dcd5e4] hover:bg-[#381c59] transition-colors"
          >
            Compare ({compareList.length})
          </Link>
          <Link
            to="/custom-enquiry"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#dcd5e4] hover:bg-[#381c59] transition-colors"
          >
            Custom Tooling
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#dcd5e4] hover:bg-[#381c59] transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#dcd5e4] hover:bg-[#381c59] transition-colors"
          >
            Contact
          </Link>

          {/* Mobile Language Selector */}
          <LanguageSelector
            variant="mobile"
            onLanguageChange={() => setMobileMenuOpen(false)}
          />
        </div>
      )}
    </header>
  );
};
