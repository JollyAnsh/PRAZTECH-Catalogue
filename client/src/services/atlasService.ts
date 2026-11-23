/**
 * Client Service for Local & Cloud Persistence (Customers & Enquiries)
 */

const ATLAS_DATA_API_URL = import.meta.env.VITE_ATLAS_DATA_API_URL || '';
const ATLAS_API_KEY = import.meta.env.VITE_ATLAS_API_KEY || '';
const ATLAS_DATA_SOURCE = import.meta.env.VITE_ATLAS_DATA_SOURCE || 'Cluster0';
const ATLAS_DATABASE = import.meta.env.VITE_ATLAS_DATABASE || 'praztech';

// Local storage fallback keys
const KEYS = {
  CUSTOMERS: 'praztech_atlas_customers_v1',
  ENQUIRIES: 'praztech_atlas_enquiries_v1',
  PRODUCTS: 'praztech_atlas_custom_products_v1',
  COUNTER: 'praztech_atlas_counters_v1'
};

const getLocal = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocal = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`LocalStorage quota exceeded for ${key}`, e);
  }
};

export const atlasService = {
  // Check if direct Atlas Data API is enabled
  isAtlasDirectConfigured(): boolean {
    return Boolean(ATLAS_DATA_API_URL && ATLAS_API_KEY);
  },

  /**
   * --- CUSTOMERS ---
   */
  async getCustomers(): Promise<any[]> {
    try {
      const res = await fetch('/api/customers', { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLocal(KEYS.CUSTOMERS, json.data);
          return json.data;
        }
      }
    } catch {
      // fallback
    }

    return getLocal<any[]>(KEYS.CUSTOMERS, []);
  },

  async saveCustomer(customer: any): Promise<any> {
    const existing = getLocal<any[]>(KEYS.CUSTOMERS, []);
    const id = customer._id || customer.id || `cust_${Date.now()}`;
    const newCust = { ...customer, _id: id, id };
    existing.unshift(newCust);
    setLocal(KEYS.CUSTOMERS, existing);

    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
    } catch {
      // fallback
    }

    return newCust;
  },

  /**
   * --- ENQUIRIES ---
   */
  async getEnquiries(): Promise<any[]> {
    try {
      const res = await fetch('/api/enquiries', { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLocal(KEYS.ENQUIRIES, json.data);
          return json.data;
        }
      }
    } catch {
      // fallback
    }

    return getLocal<any[]>(KEYS.ENQUIRIES, []);
  },

  async saveEnquiry(enquiry: any): Promise<string> {
    const yr = new Date().getFullYear();
    const counters = getLocal<Record<string, number>>(KEYS.COUNTER, {});
    const seq = (counters['enquiry_seq'] || 10) + 1;
    counters['enquiry_seq'] = seq;
    setLocal(KEYS.COUNTER, counters);

    const ref = enquiry.referenceNumber || `ENQ-${yr}-${String(seq).padStart(6, '0')}`;
    const doc = {
      ...enquiry,
      referenceNumber: ref,
      createdAt: new Date().toISOString(),
      status: enquiry.status || 'Review Pending'
    };

    const existing = getLocal<any[]>(KEYS.ENQUIRIES, []);
    existing.unshift(doc);
    setLocal(KEYS.ENQUIRIES, existing);

    // Also auto-save customer profile if not exists
    if (enquiry.customer) {
      await this.saveCustomer(enquiry.customer);
    }

    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
    } catch {
      // fallback
    }

    return ref;
  }
};
