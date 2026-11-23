import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Plus, Minus, SlidersHorizontal, Eye, Camera } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { addToCart, updateQuantity, removeFromCart, items, addToCompare, removeFromCompare, isInCompare } = useCart();

  const productId = product.id || (product as any)._id || product.slug;
  const inCompare = isInCompare(productId);
  const hasVariants = Boolean(product.subModels && product.subModels.length > 0);
  const cartItemsForProduct = items.filter(it => {
    const itId = it.product?.id || (it.product as any)?._id || it.product?.slug;
    return itId === productId;
  });
  const currentQuantity = cartItemsForProduct.reduce((sum, it) => sum + it.quantity, 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, null, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetItem = items.find(it => it.id === `${productId}_standard`) || cartItemsForProduct[0];
    if (targetItem) {
      updateQuantity(targetItem.id, targetItem.quantity + 1);
    } else {
      addToCart(product, null, 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetItem = items.find(it => it.id === `${productId}_standard`) || cartItemsForProduct[cartItemsForProduct.length - 1];
    if (targetItem) {
      if (targetItem.quantity > 1) {
        updateQuantity(targetItem.id, targetItem.quantity - 1);
      } else {
        removeFromCart(targetItem.id);
      }
    }
  };

  const handleCompareToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(productId);
    } else {
      addToCompare(product);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-[#dcd5e4] hover:border-[#5e3e8b] transition-colors p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-center group shadow-xs">
        {/* Thumbnail */}
        <Link to={`/products/${product.slug}`} className="w-full sm:w-40 sm:h-40 aspect-square shrink-0 bg-white border border-[#dcd5e4] rounded-lg p-3 overflow-hidden flex items-center justify-center relative">
          <img
            src={product.images[0] || `/images/placeholders/${product.slug}.svg`}
            alt={`${product.name} - Model ${product.modelNo}`}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
          <span className="absolute top-2 left-2 bg-[#2e075d] text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-medium">
            p. {product.cataloguePage}
          </span>
          {product.images && product.images.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-white text-[#5e3e8b] text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#dcd5e4] flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {product.images.length}
            </span>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs text-[#6e568b] font-medium">
              {product.category}
            </span>
            <span className="text-[#9080a5]">•</span>
            <span className="font-mono text-xs text-[#2e075d] bg-[#ede8f5] border border-[#dcd5e4] px-2 py-0.5 rounded font-medium">
              {product.modelNo}
            </span>
          </div>

          <Link to={`/products/${product.slug}`}>
            <h3 className="font-medium text-base text-[#2e075d] hover:text-[#5e3e8b] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-[#665f6e] mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Features Snippet */}
          {product.keyFeatures && product.keyFeatures.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6e568b]">
              {product.keyFeatures.slice(0, 2).map((feat, i) => (
                <span key={i} className="flex items-center">
                  <span className="w-1 h-1 rounded-full bg-[#9080a5] mr-1.5 shrink-0"></span>
                  <span className="line-clamp-1">{feat}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col items-center justify-end gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#e5e0eb]">
          <Link
            to={`/products/${product.slug}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1 px-3.5 py-2 text-xs font-medium text-[#2e075d] bg-[#ede8f5] hover:bg-[#dcd5e4] rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>

          {hasVariants ? (
            <Link
              to={`/products/${product.slug}`}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors shadow-xs ${
                currentQuantity > 0
                  ? 'bg-[#b5a8c8] text-[#2e075d] font-bold border border-[#b5a8c8]'
                  : 'bg-[#381c59] hover:bg-[#5e3e8b] text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{currentQuantity > 0 ? `${currentQuantity} in enquiry` : 'Select variant'}</span>
            </Link>
          ) : currentQuantity > 0 ? (
            <div
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="flex-1 sm:flex-none inline-flex items-center justify-between bg-[#f0edf5] border border-[#dcd5e4] rounded-lg p-0.5 min-w-[120px] h-8"
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-[#ede8f5] text-[#2e075d] border border-[#dcd5e4] transition-colors cursor-pointer"
                title={currentQuantity === 1 ? 'Remove from enquiry' : 'Decrease quantity'}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-medium text-[#2e075d] px-2 tabular-nums">
                {currentQuantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#381c59] hover:bg-[#5e3e8b] text-white transition-colors cursor-pointer"
                title="Increase quantity"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors bg-[#381c59] hover:bg-[#5e3e8b] text-white shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to enquiry</span>
            </button>
          )}

          <button
            onClick={handleCompareToggle}
            className={`p-2 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer ${
              inCompare
                ? 'bg-[#381c59] text-white border-[#381c59]'
                : 'bg-white text-[#6e568b] border-[#dcd5e4] hover:bg-[#ede8f5]'
            }`}
            title={inCompare ? 'In comparison' : 'Add to compare'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Grid Mode (Default)
  return (
    <div className="bg-white rounded-xl border border-[#dcd5e4] hover:border-[#5e3e8b] transition-colors overflow-hidden flex flex-col group h-full shadow-xs hover:shadow-md">
      {/* Card Header & Image */}
      <div className="relative w-full aspect-square bg-white border-b border-[#e5e0eb] overflow-hidden flex items-center justify-center">
        <Link
          to={`/products/${product.slug}`}
          className="w-full h-full p-2.5 sm:p-4 flex items-center justify-center transition-transform group-hover:scale-102 duration-200"
        >
          <img
            src={product.images[0] || `/images/placeholders/${product.slug}.svg`}
            alt={`${product.name} - Model ${product.modelNo}`}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center space-x-1 flex-wrap gap-y-1 pointer-events-none z-10">
          <span className="bg-[#2e075d] text-white text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded font-medium">
            p. {product.cataloguePage}
          </span>
          {product.subModels && product.subModels.length > 0 && (
            <span className="bg-[#ede8f5] text-[#2e075d] text-[9px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded border border-[#dcd5e4] hidden xs:inline-block">
              {product.subModels.length} var
            </span>
          )}
          {product.images && product.images.length > 1 && (
            <span className="bg-white text-[#5e3e8b] text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.5 rounded border border-[#dcd5e4] flex items-center gap-0.5 hidden xs:inline-flex">
              <Camera className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
              {product.images.length}
            </span>
          )}
        </div>

        {/* Compare Toggle Button on Image */}
        <button
          type="button"
          onClick={handleCompareToggle}
          className={`absolute top-2 right-2 z-20 min-w-[32px] min-h-[32px] p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 ${
            inCompare
              ? 'bg-[#381c59] text-white border-[#381c59]'
              : 'bg-white/95 text-[#6e568b] hover:text-[#2e075d] border-[#dcd5e4] hover:bg-[#ede8f5]'
          }`}
          title={inCompare ? 'In comparison' : 'Add to compare'}
          aria-label={inCompare ? 'Remove from comparison' : 'Add to comparison'}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          {/* Category & Model */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1">
            <span className="text-[#6e568b] font-medium truncate max-w-full">
              {product.category}
            </span>
          </div>

          <div className="font-mono text-[10px] sm:text-xs font-medium text-[#2e075d] bg-[#ede8f5] border border-[#dcd5e4] inline-block px-1.5 py-0.5 rounded mb-1">
            {product.modelNo}
          </div>

          <Link to={`/products/${product.slug}`}>
            <h3 className="font-medium text-xs sm:text-sm text-[#2e075d] hover:text-[#5e3e8b] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="hidden sm:block text-xs text-[#665f6e] mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 sm:pt-2.5 border-t border-[#e5e0eb] flex flex-col xs:flex-row items-stretch xs:items-center gap-1.5 sm:gap-2">
          <Link
            to={`/products/${product.slug}`}
            className="flex-1 py-1.5 sm:py-2 text-center text-[11px] sm:text-xs font-medium text-[#2e075d] bg-[#ede8f5] hover:bg-[#dcd5e4] rounded-lg transition-colors"
          >
            Details
          </Link>

          {hasVariants ? (
            <Link
              to={`/products/${product.slug}`}
              className={`flex-1 py-1.5 sm:py-2 px-1 sm:px-2 text-[11px] sm:text-xs font-medium rounded-lg flex items-center justify-center space-x-1 sm:space-x-1.5 transition-colors shadow-xs ${
                currentQuantity > 0
                  ? 'bg-[#b5a8c8] text-[#2e075d] font-bold border border-[#b5a8c8]'
                  : 'bg-[#381c59] hover:bg-[#5e3e8b] text-white'
              }`}
            >
              <SlidersHorizontal className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
              <span className="truncate">{currentQuantity > 0 ? `${currentQuantity} added` : 'Variants'}</span>
            </Link>
          ) : currentQuantity > 0 ? (
            <div
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="flex-1 h-7 sm:h-8 flex items-center justify-between bg-[#f0edf5] border border-[#dcd5e4] rounded-lg p-0.5"
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-white hover:bg-[#ede8f5] text-[#2e075d] border border-[#dcd5e4] transition-colors cursor-pointer"
                title={currentQuantity === 1 ? 'Remove from enquiry' : 'Decrease quantity'}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>
              <span className="text-[11px] sm:text-xs font-mono font-medium text-[#2e075d] px-0.5 sm:px-1 tabular-nums">
                {currentQuantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-[#381c59] hover:bg-[#5e3e8b] text-white transition-colors cursor-pointer"
                title="Increase quantity"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="flex-1 py-1.5 sm:py-2 px-1 sm:px-2 text-[11px] sm:text-xs font-medium rounded-lg flex items-center justify-center space-x-1 transition-colors bg-[#381c59] hover:bg-[#5e3e8b] text-white shadow-xs cursor-pointer"
              title="Add to enquiry request"
            >
              <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
              <span>Enquire</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
