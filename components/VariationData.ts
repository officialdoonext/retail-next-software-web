export interface VariationOption {
  id: string;
  value: string;
  skuCodeSuffix: string;
}

export interface Variation {
  id: string;
  code: string;
  name: string;
  type: string; // Weight, Size, Volume, Flavor, Pack
  options: string[];
  applicableCategories: string[];
  productCount: number;
  status: 'Active' | 'Inactive';
  createdOn: string;
  description: string;
}

export const INITIAL_VARIATIONS: Variation[] = [
  {
    id: "var-1",
    code: "VAR-WT",
    name: "Weight / Mass",
    type: "Weight",
    options: ["250g", "500g", "1kg", "2kg", "5kg"],
    applicableCategories: ["Sweets", "Grocery & Staples", "Cakes & Bakery"],
    productCount: 890,
    status: "Active",
    createdOn: "14 Jan 2025",
    description: "Standard metric weight variations for retail weighing items"
  },
  {
    id: "var-2",
    code: "VAR-VOL",
    name: "Liquid Volume",
    type: "Volume",
    options: ["250ml", "500ml", "750ml", "1L", "2L"],
    applicableCategories: ["Beverages", "Dairy & Milk"],
    productCount: 380,
    status: "Active",
    createdOn: "16 Jan 2025",
    description: "Bottle, can, and carton volume specifications"
  },
  {
    id: "var-3",
    code: "VAR-PACK",
    name: "Pack Quantity",
    type: "Pack Size",
    options: ["Single Unit", "Pack of 2", "Pack of 6", "Pack of 12", "Box of 24"],
    applicableCategories: ["Snacks & Savories", "Beverages", "Grocery & Staples"],
    productCount: 410,
    status: "Active",
    createdOn: "19 Jan 2025",
    description: "Multi-pack and combo bundle sizes"
  },
  {
    id: "var-4",
    code: "VAR-FLV",
    name: "Flavor & Variant",
    type: "Flavor",
    options: ["Classic Plain", "Chocolate", "Cardamom / Elaichi", "Saffron / Kesar", "Pista"],
    applicableCategories: ["Cakes & Bakery", "Sweets", "Dairy & Milk"],
    productCount: 220,
    status: "Active",
    createdOn: "24 Jan 2025",
    description: "Taste and seasoning flavor profiles"
  },
  {
    id: "var-5",
    code: "VAR-SWEET",
    name: "Sugar & Sweetness Level",
    type: "Dietary",
    options: ["Regular Sweet", "Less Sugar", "Sugar-Free (Stevia)", "Jaggery Made"],
    applicableCategories: ["Sweets", "Beverages"],
    productCount: 95,
    status: "Active",
    createdOn: "05 Feb 2025",
    description: "Dietary and health-conscious sweetness customization"
  },
  {
    id: "var-6",
    code: "VAR-BOX",
    name: "Gift Box Packaging",
    type: "Packaging",
    options: ["Standard Box", "Luxury Gift Box", "Tin Container", "Festival Hamper"],
    applicableCategories: ["Sweets", "Dry Fruits & Nuts", "Cakes & Bakery"],
    productCount: 75,
    status: "Active",
    createdOn: "12 Feb 2025",
    description: "Special event and festive presentation box packaging"
  }
];
