export interface Category {
  id: string;
  code: string;
  name: string;
  slug?: string;
  parentCategory: string;
  description: string;
  status: 'Active' | 'Inactive';
  icon?: string;
  productCount?: number;
  createdOn?: string;
}

export const INITIAL_CATEGORIES: Category[] = [];
