import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CompareDrawer } from './components/CompareDrawer';
import { CompareNotificationModal } from './components/CompareNotificationModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';

// Eagerly loaded for instant initial render
import { HomePage } from './pages/HomePage';

// Lazy-loaded routes for optimal bundle code-splitting
const CataloguePage = lazy(() => import('./pages/CataloguePage').then(m => ({ default: m.CataloguePage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const ComparePage = lazy(() => import('./pages/ComparePage').then(m => ({ default: m.ComparePage })));
const EnquiryCartPage = lazy(() => import('./pages/EnquiryCartPage').then(m => ({ default: m.EnquiryCartPage })));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage').then(m => ({ default: m.ConfirmationPage })));
const CustomEnquiryPage = lazy(() => import('./pages/CustomEnquiryPage').then(m => ({ default: m.CustomEnquiryPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage').then(m => ({ default: m.RefundPolicyPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then(m => ({ default: m.UsersPage })));
const GamesPage = lazy(() => import('./pages/GamesPage').then(m => ({ default: m.GamesPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Professional loading fallback
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3" role="status" aria-label="Loading page">
    <div className="w-8 h-8 border-2 border-[#dfd5e8] border-t-[#381c59] rounded-full animate-spin" />
    <span className="text-xs text-[#6e568b] font-medium tracking-wide">Loading PRAZTECH® Catalogue...</span>
  </div>
);

// Scroll to top automatically on route changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main layout wrapper with responsive bottom clearance when comparison drawer is active
const AppLayout: React.FC = () => {
  const { compareList } = useCart();
  const { pathname } = useLocation();
  const hasCompareDrawer = compareList.length > 0 && pathname !== '/compare';

  return (
    <div className="min-h-screen flex flex-col bg-industrial-50 text-industrial-900 font-sans selection:bg-brand-mauve/30 selection:text-brand-indigo">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Navbar />
      
      <main id="main-content" className={`flex-1 transition-[padding] duration-200 ${hasCompareDrawer ? 'pb-24 sm:pb-20' : ''}`}>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/enquiry" element={<EnquiryCartPage />} />
            <Route path="/confirmation/:reference" element={<ConfirmationPage />} />
            <Route path="/custom-enquiry" element={<CustomEnquiryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/executive" element={<UsersPage />} />
            <Route path="/games" element={<GamesPage />} />
            {/* Dedicated 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <CompareDrawer />
      <CompareNotificationModal />
      <CookieConsentBanner />
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
