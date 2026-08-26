export interface Variation {
  id: string;
  code: string;
  name: string;
  type: string;
  options: string[];
  applicableCategories: string[];
  productCount: number;
  status: 'Active' | 'Inactive';
  createdOn: string;
  description?: string;
}

export const INITIAL_VARIATIONS: Variation[] = [];
