export interface SubModel {
  modelNo?: string;
  size?: string;
  sizeMm?: string;
  sizeInches?: string;
  inches?: string;
  mm?: string;
  range?: string;
  dimensions?: string;
  grit120?: string;
  grit180?: string;
  grit220?: string;
  grit320?: string;
  modelHCS?: string;
  modelHSS?: string;
  cutters?: string;
  pilots?: string;
  reamers?: string;
  compatibility?: string;
  angles?: string;
  inchRange?: string;
  metricRange?: string;
  carat?: string;
  thread?: string;
  drive?: string;
  features?: string;
  voltage?: string;
  power?: string;
  speed?: string;
  profile?: string;
  lengths?: string[];
  widths?: string[];
  [key: string]: any;
}

export interface Product {
  id: string;
  indexNumber: number;
  modelNo: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  cataloguePage: number;
  tag?: string;
  description: string;
  keyFeatures: string[];
  applications: string[];
  setIncludes: string[];
  sizesDetail: string[];
  compatibility: string;
  itemSpecifics: Record<string, string>;
  notes?: string;
  variantOptionNames?: string[];
  subModels?: SubModel[];
  corrections?: string[];
  flags?: string[];
  images: string[];
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  parentCategory?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSubModel?: SubModel | null;
  quantity: number;
  notes: string;
}

export interface CustomItem {
  id: string;
  productName: string;
  specifications: string;
  dimensions: string;
  material: string;
  quantity: number;
  intendedApplication: string;
  notes: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface CustomerInfo {
  fullName: string;
  company?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  country: string;
  state: string;
  city: string;
  address?: string;
  gstin?: string;
}

export interface EnquirySubmission {
  customer: CustomerInfo;
  catalogueItems: {
    productId: string;
    modelNo: string;
    name: string;
    category: string;
    selectedSubModel?: any;
    quantity: number;
    notes?: string;
  }[];
  customItems: {
    productName: string;
    specifications?: string;
    dimensions?: string;
    material?: string;
    quantity: number;
    intendedApplication?: string;
    notes?: string;
  }[];
  generalNotes?: string;
  consent: {
    accepted: boolean;
    policyVersion: string;
  };
}

export interface EnquiryResponseData {
  referenceNumber: string;
  submittedAt: string;
  pdfDownloadUrl: string;
  customer: CustomerInfo;
  itemCount: number;
  catalogueItems: any[];
  customItems: any[];
}
