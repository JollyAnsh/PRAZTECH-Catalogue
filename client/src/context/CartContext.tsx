import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem, CustomItem, SubModel } from '../types';

export interface CompareNotification {
  type: 'category_mismatch' | 'max_limit';
  title: string;
  message: string;
  activeCategory?: string;
  newCategory?: string;
  pendingProduct?: Product;
}

interface CartContextType {
  items: CartItem[];
  customItems: CustomItem[];
  totalItems: number;
  justAdded: boolean;
  triggerGlow: () => void;
  addToCart: (product: Product, subModel?: SubModel | null, quantity?: number, notes?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  addCustomItem: (item: Omit<CustomItem, 'id'>) => void;
  removeCustomItem: (id: string) => void;
  updateCustomItem: (id: string, item: Partial<CustomItem>) => void;
  clearCart: () => void;

  // Comparison
  compareList: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  compareNotification: CompareNotification | null;
  dismissCompareNotification: () => void;
  switchCategoryAndCompare: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'praztech_enquiry_cart_v1';
const CUSTOM_STORAGE_KEY = 'praztech_custom_enquiries_v1';
const COMPARE_STORAGE_KEY = 'praztech_compare_list_v1';

// Helper to sanitize and normalize cart items, purging any corrupt items
const sanitizeCartItems = (raw: any[]): CartItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(it => it && it.product && (it.product.id || it.product._id || it.product.slug))
    .filter(it => it.id !== 'undefined_standard' && it.id !== 'undefined_null' && !(typeof it.id === 'string' && it.id.startsWith('undefined_')))
    .map(it => {
      const prodId = it.product.id || it.product._id || it.product.slug;
      const subKey = it.selectedSubModel ? JSON.stringify(it.selectedSubModel) : 'standard';
      return {
        ...it,
        id: it.id && !it.id.startsWith('undefined_') ? it.id : `${prodId}_${subKey}`,
        product: {
          ...it.product,
          id: prodId
        }
      };
    });
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const cleaned = sanitizeCartItems(parsed);
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  });

  const [customItems, setCustomItems] = useState<CustomItem[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareList, setCompareList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareNotification, setCompareNotification] = useState<CompareNotification | null>(null);

  const [justAdded, setJustAdded] = useState(false);
  const justAddedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerGlow = () => {
    setJustAdded(true);
    if (justAddedTimerRef.current) {
      clearTimeout(justAddedTimerRef.current);
    }
    justAddedTimerRef.current = setTimeout(() => {
      setJustAdded(false);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (justAddedTimerRef.current) {
        clearTimeout(justAddedTimerRef.current);
      }
    };
  }, []);

  // Cross-Tab Synchronization via Web Storage Events and Tab Visibility Focus
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const savedItems = localStorage.getItem(CART_STORAGE_KEY);
        if (savedItems) {
          const parsed = JSON.parse(savedItems);
          const cleaned = sanitizeCartItems(parsed);
          setItems(prev => (JSON.stringify(prev) !== JSON.stringify(cleaned) ? cleaned : prev));
        } else {
          setItems(prev => (prev.length === 0 ? prev : []));
        }

        const savedCustom = localStorage.getItem(CUSTOM_STORAGE_KEY);
        if (savedCustom) {
          const parsed = JSON.parse(savedCustom);
          setCustomItems(prev => (JSON.stringify(prev) !== savedCustom ? parsed : prev));
        } else {
          setCustomItems(prev => (prev.length === 0 ? prev : []));
        }

        const savedCompare = localStorage.getItem(COMPARE_STORAGE_KEY);
        if (savedCompare) {
          const parsed = JSON.parse(savedCompare);
          setCompareList(prev => (JSON.stringify(prev) !== savedCompare ? parsed : prev));
        } else {
          setCompareList(prev => (prev.length === 0 ? prev : []));
        }
      } catch (err) {
        console.error('Error syncing cart across tabs:', err);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : [];
          setItems(sanitizeCartItems(updated));
        } catch (err) {
          console.error('Error syncing cart from storage event:', err);
        }
      } else if (e.key === CUSTOM_STORAGE_KEY) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : [];
          setCustomItems(updated);
        } catch (err) {
          console.error('Error syncing custom items from storage event:', err);
        }
      } else if (e.key === COMPARE_STORAGE_KEY) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : [];
          setCompareList(updated);
        } catch (err) {
          console.error('Error syncing compare list from storage event:', err);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', syncFromStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', syncFromStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(customItems));
    } catch (e) {
      console.error('Failed to save custom items to localStorage', e);
    }
  }, [customItems]);

  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareList));
    } catch (e) {
      console.error('Failed to save compare list to localStorage', e);
    }
  }, [compareList]);

  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0) +
                     customItems.reduce((sum, cit) => sum + cit.quantity, 0);

  const addToCart = (product: Product, subModel: SubModel | null = null, quantity = 1, notes = '') => {
    const prodId = product.id || (product as any)._id || product.slug;
    const safeProduct: Product = { ...product, id: prodId };
    const subKey = subModel ? JSON.stringify(subModel) : 'standard';
    const cartItemId = `${prodId}_${subKey}`;

    // Read freshest items directly from localStorage to ensure multi-tab sync without race conditions
    let baseItems = items;
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) baseItems = sanitizeCartItems(JSON.parse(saved));
    } catch {
      baseItems = items;
    }

    const existingIndex = baseItems.findIndex(it => it.id === cartItemId);
    let updated: CartItem[];
    if (existingIndex !== -1) {
      updated = baseItems.map((it, idx) =>
        idx === existingIndex
          ? { ...it, quantity: it.quantity + quantity, notes: notes || it.notes }
          : it
      );
    } else {
      updated = [
        ...baseItems,
        {
          id: cartItemId,
          product: safeProduct,
          selectedSubModel: subModel,
          quantity: Math.max(1, quantity),
          notes
        }
      ];
    }

    setItems(updated);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }

    // Flash/glow highlight on "My Enquiry" button
    triggerGlow();
  };

  const removeFromCart = (cartItemId: string) => {
    let baseItems = items;
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) baseItems = JSON.parse(saved);
    } catch {
      baseItems = items;
    }
    const updated = baseItems.filter(it => it.id !== cartItemId);
    setItems(updated);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    let baseItems = items;
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) baseItems = JSON.parse(saved);
    } catch {
      baseItems = items;
    }
    const updated = baseItems.map(it =>
      it.id === cartItemId ? { ...it, quantity } : it
    );
    setItems(updated);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }

    // Flash/glow highlight on "My Enquiry" when quantity increases/changes
    triggerGlow();
  };

  const updateNotes = (cartItemId: string, notes: string) => {
    setItems(prev => prev.map(it =>
      it.id === cartItemId ? { ...it, notes } : it
    ));
  };

  const addCustomItem = (item: Omit<CustomItem, 'id'>) => {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setCustomItems(prev => [...prev, { ...item, id }]);
    triggerGlow();
  };

  const removeCustomItem = (id: string) => {
    setCustomItems(prev => prev.filter(it => it.id !== id));
  };

  const updateCustomItem = (id: string, partial: Partial<CustomItem>) => {
    setCustomItems(prev => prev.map(it =>
      it.id === id ? { ...it, ...partial } : it
    ));
  };

  const clearCart = () => {
    setItems([]);
    setCustomItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CUSTOM_STORAGE_KEY);
  };

  // Compare Functions (Max 4, Same Category Only)
  const addToCompare = (product: Product): boolean => {
    const prodId = product.id || (product as any)._id || product.slug;
    const safeProduct: Product = { ...product, id: prodId };
    if (compareList.some(p => (p.id || (p as any)._id || p.slug) === prodId)) return false;

    // Constraint: Only products in the same category can be compared
    if (compareList.length > 0) {
      const activeCat = (compareList[0].categorySlug || compareList[0].category || '').toLowerCase().trim();
      const newCat = (product.categorySlug || product.category || '').toLowerCase().trim();
      if (activeCat !== newCat) {
        setCompareNotification({
          type: 'category_mismatch',
          title: 'Different Category Selected',
          message: 'Comparison is only available between products within the same tooling category so their technical specifications and stone sizes align accurately.',
          activeCategory: compareList[0].category,
          newCategory: product.category,
          pendingProduct: safeProduct
        });
        return false;
      }
    }

    if (compareList.length >= 4) {
      setCompareNotification({
        type: 'max_limit',
        title: 'Maximum Comparison Limit Reached',
        message: 'You can compare a maximum of 4 tools side-by-side. Please remove an existing tool before adding another.',
        pendingProduct: safeProduct
      });
      return false;
    }
    setCompareList(prev => [...prev, safeProduct]);
    return true;
  };

  const dismissCompareNotification = () => {
    setCompareNotification(null);
  };

  const switchCategoryAndCompare = () => {
    if (compareNotification?.pendingProduct) {
      setCompareList([compareNotification.pendingProduct]);
    }
    setCompareNotification(null);
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => (p.id || (p as any)._id || p.slug) !== productId));
  };

  const isInCompare = (productId: string) => {
    return compareList.some(p => (p.id || (p as any)._id || p.slug) === productId);
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem(COMPARE_STORAGE_KEY);
  };

  return (
    <CartContext.Provider value={{
      items,
      customItems,
      totalItems,
      justAdded,
      triggerGlow,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateNotes,
      addCustomItem,
      removeCustomItem,
      updateCustomItem,
      clearCart,
      compareList,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare,
      compareNotification,
      dismissCompareNotification,
      switchCategoryAndCompare
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
