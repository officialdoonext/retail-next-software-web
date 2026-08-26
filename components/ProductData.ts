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
  status: 'Active' | 'Out of Stock' | 'Inactive';
  addedOn: string;
  image: string;
  imageBg?: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Milk Cake",
    sku: "PRD-0001",
    category: "Cakes & Bakery",
    brand: "Bakers World",
    unit: "Kg",
    sellingPrice: 600.00,
    costPrice: 420.00,
    stock: 25.00,
    status: "Active",
    addedOn: "25 May 2025",
    image: "🟫",
    imageBg: "bg-amber-100 text-amber-800"
  },
  {
    id: "2",
    name: "Gulab Jamun",
    sku: "PRD-0002",
    category: "Sweets",
    brand: "Sweet Delights",
    unit: "Kg",
    sellingPrice: 400.00,
    costPrice: 280.00,
    stock: 18.00,
    status: "Active",
    addedOn: "24 May 2025",
    image: "🧆",
    imageBg: "bg-orange-100 text-orange-800"
  },
  {
    id: "3",
    name: "Rasgulla",
    sku: "PRD-0003",
    category: "Sweets",
    brand: "Sweet Delights",
    unit: "Kg",
    sellingPrice: 380.00,
    costPrice: 250.00,
    stock: 0.00,
    status: "Out of Stock",
    addedOn: "24 May 2025",
    image: "⚪",
    imageBg: "bg-stone-100 text-stone-700"
  },
  {
    id: "4",
    name: "Mysore Pak",
    sku: "PRD-0004",
    category: "Sweets",
    brand: "Sweet Delights",
    unit: "Kg",
    sellingPrice: 520.00,
    costPrice: 350.00,
    stock: 15.00,
    status: "Active",
    addedOn: "23 May 2025",
    image: "🧇",
    imageBg: "bg-yellow-100 text-yellow-800"
  },
  {
    id: "5",
    name: "Badam Halwa",
    sku: "PRD-0005",
    category: "Sweets",
    brand: "Sweet Delights",
    unit: "Kg",
    sellingPrice: 700.00,
    costPrice: 480.00,
    stock: 12.00,
    status: "Active",
    addedOn: "23 May 2025",
    image: "🍯",
    imageBg: "bg-amber-100 text-amber-900"
  },
  {
    id: "6",
    name: "Samosa",
    sku: "PRD-0006",
    category: "Snacks",
    brand: "Tasty Bites",
    unit: "Piece",
    sellingPrice: 20.00,
    costPrice: 12.00,
    stock: 150.00,
    status: "Active",
    addedOn: "22 May 2025",
    image: "🥟",
    imageBg: "bg-orange-100 text-orange-700"
  },
  {
    id: "7",
    name: "Coca Cola 500ml",
    sku: "PRD-0007",
    category: "Beverages",
    brand: "Coca Cola",
    unit: "Bottle",
    sellingPrice: 40.00,
    costPrice: 28.00,
    stock: 60.00,
    status: "Active",
    addedOn: "22 May 2025",
    image: "🥤",
    imageBg: "bg-red-100 text-red-700"
  },
  {
    id: "8",
    name: "Bisleri Water 1L",
    sku: "PRD-0008",
    category: "Beverages",
    brand: "Bisleri",
    unit: "Bottle",
    sellingPrice: 20.00,
    costPrice: 12.00,
    stock: 80.00,
    status: "Active",
    addedOn: "21 May 2025",
    image: "💧",
    imageBg: "bg-cyan-100 text-cyan-700"
  },
  {
    id: "9",
    name: "Aashirvaad Atta 1kg",
    sku: "PRD-0009",
    category: "Grocery",
    brand: "Aashirvaad",
    unit: "Packet",
    sellingPrice: 60.00,
    costPrice: 40.00,
    stock: 35.00,
    status: "Active",
    addedOn: "21 May 2025",
    image: "🌾",
    imageBg: "bg-amber-100 text-amber-800"
  },
  {
    id: "10",
    name: "Sugar 1kg",
    sku: "PRD-0010",
    category: "Grocery",
    brand: "Tata",
    unit: "Packet",
    sellingPrice: 45.00,
    costPrice: 30.00,
    stock: 22.00,
    status: "Active",
    addedOn: "20 May 2025",
    image: "🧂",
    imageBg: "bg-blue-100 text-blue-800"
  }
];
