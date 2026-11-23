import { Product, Category, EnquirySubmission, EnquiryResponseData } from '../types';
import localProducts from '../data/products.json';
import localCategories from '../data/categories.json';
import { atlasService } from './atlasService';

const API_BASE = '/api';

export const api = {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (e) {
      console.warn('Backend unavailable, using local categories fallback');
    }
    return (localCategories as unknown) as Category[];
  },

  // Get products with filtering
  async getProducts(params?: {
    category?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; pages: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.sort) query.append('sort', params.sort);
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));

      const res = await fetch(`${API_BASE}/products?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const sanitized = json.data.map((p: any) => ({
            ...p,
            id: p.id || p._id || p.slug
          }));
          return {
            products: sanitized,
            total: json.total,
            pages: json.pages
          };
        }
      }
    } catch (e) {
      console.warn('Backend unavailable, using local products fallback');
    }

    // Local Fallback logic
    let items = [...(localProducts as unknown as Product[])];

    if (params?.category) {
      items = items.filter(
        p => p.categorySlug === params.category || p.category === params.category
      );
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.modelNo.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.compatibility.toLowerCase().includes(q) ||
          (p.subModels && p.subModels.some((sm: any) =>
            (sm.modelCode && sm.modelCode.toLowerCase().includes(q)) ||
            (sm.size && sm.size.toLowerCase().includes(q)) ||
            (sm.description && sm.description.toLowerCase().includes(q))
          ))
      );
    }

    if (params?.sort === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (params?.sort === 'name_desc') {
      items.sort((a, b) => b.name.localeCompare(a.name));
    } else if (params?.sort === 'model') {
      items.sort((a, b) => a.modelNo.localeCompare(b.modelNo));
    } else {
      items.sort((a, b) => (a.indexNumber || 0) - (b.indexNumber || 0));
    }

    return {
      products: items,
      total: items.length,
      pages: 1
    };
  },

  // Get single product by slug
  async getProductBySlug(slug: string): Promise<{ product: Product | null; relatedProducts: Product[] }> {
    try {
      const res = await fetch(`${API_BASE}/products/${slug}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const prod = {
            ...json.data,
            id: json.data.id || json.data._id || json.data.slug
          };
          const related = Array.isArray(json.relatedProducts)
            ? json.relatedProducts.map((p: any) => ({ ...p, id: p.id || p._id || p.slug }))
            : [];
          return {
            product: prod,
            relatedProducts: related
          };
        }
      }
    } catch (e) {
      console.warn('Backend unavailable, using local product slug fallback');
    }

    const all = (localProducts as unknown) as Product[];
    const product = all.find(p => p.slug === slug) || null;
    const related = product
      ? all.filter(p => p.categorySlug === product.categorySlug && p.slug !== product.slug).slice(0, 4)
      : [];

    return { product, relatedProducts: related };
  },

  // Submit Enquiry
  async submitEnquiry(payload: EnquirySubmission): Promise<EnquiryResponseData> {
    try {
      const res = await fetch(`${API_BASE}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success && json.data) {
        return json.data;
      }
    } catch (e) {
      console.warn('Backend unavailable for enquiry submission, storing via Atlas fallback');
    }

    // Direct Atlas & Client-Side Resilient Fallback for GitHub Pages
    try {
      const ref = await atlasService.saveEnquiry(payload);
      return {
        referenceNumber: ref,
        submittedAt: new Date().toISOString(),
        pdfDownloadUrl: '#',
        customer: payload.customer,
        itemCount: (payload.catalogueItems?.length || 0) + (payload.customItems?.length || 0),
        catalogueItems: payload.catalogueItems || [],
        customItems: payload.customItems || []
      };
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to submit enquiry. Please check your connection.');
    }
  },

  // Get Enquiry by Reference
  async getEnquiry(reference: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/enquiries/${reference}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // fallback
    }

    const all = await atlasService.getEnquiries();
    const found = all.find((e: any) => e.referenceNumber === reference);
    if (found) return found;

    throw new Error('Enquiry not found');
  }
};
