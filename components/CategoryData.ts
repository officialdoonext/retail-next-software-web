export interface Category {
  id: string;
  code: string;
  name: string;
  slug: string;
  parentCategory: string;
  productCount: number;
  status: 'Active' | 'Inactive';
  createdOn: string;
  icon: string;
  description: string;
}

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    code: "CAT-001",
    name: "Cakes & Bakery",
    slug: "cakes-bakery",
    parentCategory: "Bakery",
    productCount: 420,
    status: "Active",
    createdOn: "12 Jan 2025",
    icon: "🍰",
    description: "Freshly baked cakes, pastries, bread, and artisan confectionery"
  },
  {
    id: "cat-2",
    code: "CAT-002",
    name: "Sweets",
    slug: "sweets",
    parentCategory: "Confectionery",
    productCount: 580,
    status: "Active",
    createdOn: "15 Jan 2025",
    icon: "🧆",
    description: "Traditional Indian sweets, ghee preparations, and dry fruit delicacies"
  },
  {
    id: "cat-3",
    code: "CAT-003",
    name: "Snacks & Savories",
    slug: "snacks-savories",
    parentCategory: "Fast Food",
    productCount: 310,
    status: "Active",
    createdOn: "18 Jan 2025",
    icon: "🥟",
    description: "Hot savory snacks, samosas, kachoris, chips, and namkeen"
  },
  {
    id: "cat-4",
    code: "CAT-004",
    name: "Beverages",
    slug: "beverages",
    parentCategory: "Drinks",
    productCount: 265,
    status: "Active",
    createdOn: "20 Jan 2025",
    icon: "🥤",
    description: "Cold drinks, mineral water, fresh juices, soda, and dairy beverages"
  },
  {
    id: "cat-5",
    code: "CAT-005",
    name: "Grocery & Staples",
    slug: "grocery-staples",
    parentCategory: "Pantry",
    productCount: 510,
    status: "Active",
    createdOn: "22 Jan 2025",
    icon: "🌾",
    description: "Flour, rice, sugar, pulses, grains, and essential daily kitchen items"
  },
  {
    id: "cat-6",
    code: "CAT-006",
    name: "Dairy & Milk",
    slug: "dairy-milk",
    parentCategory: "Perishables",
    productCount: 145,
    status: "Active",
    createdOn: "01 Feb 2025",
    icon: "🥛",
    description: "Fresh milk, paneer, butter, curd, cream, and cheese"
  },
  {
    id: "cat-7",
    code: "CAT-007",
    name: "Frozen Foods",
    slug: "frozen-foods",
    parentCategory: "Cold Storage",
    productCount: 85,
    status: "Active",
    createdOn: "10 Feb 2025",
    icon: "🧊",
    description: "Ice creams, frozen peas, ready-to-fry snacks, and desserts"
  },
  {
    id: "cat-8",
    code: "CAT-008",
    name: "Dry Fruits & Nuts",
    slug: "dry-fruits-nuts",
    parentCategory: "Gourmet",
    productCount: 35,
    status: "Inactive",
    createdOn: "25 Feb 2025",
    icon: "🥜",
    description: "Premium almonds, cashews, raisins, pistachios, and walnut kernels"
  }
];
