export interface ProductVariant {
  id: string;
  name: string;
  optionValue: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  bufferStock: number;
  barcode: string;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  unit: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  bufferStock?: number;
  status: 'Active' | 'Out of Stock' | 'Inactive';
  addedOn: string;
  image: string;
  imageBg?: string;
  barcode?: string;
  hasVariations?: boolean;
  variations?: ProductVariant[];
}

export const INITIAL_PRODUCTS: Product[] = [];
