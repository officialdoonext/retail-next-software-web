import * as XLSX from "xlsx";

export interface BulkProductRow {
  "Product Name": string;
  "Category": string;
  "Brand": string;
  "Unit": string;
  "Selling Price": number;
  "Cost Price": number;
  "Stock": number;
  "Buffer Stock": number;
  "Barcode (Leave empty to auto-generate)"?: string;
  "Has Variations (TRUE/FALSE)"?: string;
  "Variation Type"?: string;
  "Variation Option"?: string;
  "Status"?: string;
  "Image URL"?: string;
}

// 1. Empty Template with Multi-Variation Samples
export const EMPTY_TEMPLATE_ROWS: BulkProductRow[] = [
  // Standalone Product Sample
  {
    "Product Name": "Tata Salt Vacuum Evaporated",
    "Category": "Grocery & Staples",
    "Brand": "Tata",
    "Unit": "Kg",
    "Selling Price": 28,
    "Cost Price": 20,
    "Stock": 100,
    "Buffer Stock": 15,
    "Barcode (Leave empty to auto-generate)": "",
    "Has Variations (TRUE/FALSE)": "FALSE",
    "Variation Type": "",
    "Variation Option": "",
    "Status": "Active",
    "Image URL": ""
  },
  // Multi-Variation Product 1: Whole Wheat Atta (3 options: 1kg, 5kg, 10kg)
  {
    "Product Name": "Aashirvaad Superior MP Atta",
    "Category": "Grocery & Staples",
    "Brand": "Aashirvaad",
    "Unit": "Kg",
    "Selling Price": 60,
    "Cost Price": 44,
    "Stock": 40,
    "Buffer Stock": 10,
    "Barcode (Leave empty to auto-generate)": "",
    "Has Variations (TRUE/FALSE)": "TRUE",
    "Variation Type": "Weight",
    "Variation Option": "1kg",
    "Status": "Active",
    "Image URL": ""
  },
  {
    "Product Name": "Aashirvaad Superior MP Atta",
    "Category": "Grocery & Staples",
    "Brand": "Aashirvaad",
    "Unit": "Kg",
    "Selling Price": 275,
    "Cost Price": 210,
    "Stock": 30,
    "Buffer Stock": 8,
    "Barcode (Leave empty to auto-generate)": "",
    "Has Variations (TRUE/FALSE)": "TRUE",
    "Variation Type": "Weight",
    "Variation Option": "5kg",
    "Status": "Active",
    "Image URL": ""
  },
  {
    "Product Name": "Aashirvaad Superior MP Atta",
    "Category": "Grocery & Staples",
    "Brand": "Aashirvaad",
    "Unit": "Kg",
    "Selling Price": 520,
    "Cost Price": 400,
    "Stock": 25,
    "Buffer Stock": 5,
    "Barcode (Leave empty to auto-generate)": "",
    "Has Variations (TRUE/FALSE)": "TRUE",
    "Variation Type": "Weight",
    "Variation Option": "10kg",
    "Status": "Active",
    "Image URL": ""
  },
  // Multi-Variation Product 2: Ice Cream Tub (3 options: 250ml, 500ml, 1 Litre)
  {
    "Product Name": "Rich Belgian Dark Chocolate Tub",
    "Category": "Ice Creams",
    "Brand": "Amul",
    "Unit": "Tub",
    "Selling Price": 150,
    "Cost Price": 95,
    "Stock": 35,
    "Buffer Stock": 5,
    "Barcode (Leave empty to auto-generate)": "",
    "Has Variations (TRUE/FALSE)": "TRUE",
    "Variation Type": "Volume",
    "Variation Option": "250ml",
    "Status": "Active",
    "Image URL": ""
  },
  {
    "Product Name": "Rich Belgian Dark Chocolate Tub",
    "Category": "Ice Creams",
    "Brand": "Amul",
    "Unit": "Tub",
    "Selling Price": 270,
    "Cost Price": 175,
    "Stock": 25,
    "Buffer Stock": 5,
    "Barcode (Leave empty to auto-generate)": "",
    "Has Variations (TRUE/FALSE)": "TRUE",
    "Variation Type": "Volume",
    "Variation Option": "500ml",
    "Status": "Active",
    "Image URL": ""
  },
  {
    "Product Name": "Rich Belgian Dark Chocolate Tub",
    "Category": "Ice Creams",
    "Brand": "Amul",
    "Unit": "Tub",
    "Selling Price": 490,
    "Cost Price": 320,
    "Stock": 20,
    "Buffer Stock": 4,
    "Barcode (Leave empty to auto-generate)": "",
    "Has Variations (TRUE/FALSE)": "TRUE",
    "Variation Type": "Volume",
    "Variation Option": "1 Litre",
    "Status": "Active",
    "Image URL": ""
  }
];

// Helper to generate 300 Supermarket products with multiple variations
export const generateSupermarketProducts = (): BulkProductRow[] => {
  const items: BulkProductRow[] = [];

  // Multi-variation staple products (same product name with multiple weight/volume options)
  const multiVariationStaples = [
    {
      name: "Aashirvaad Superior MP Sharbati Atta",
      cat: "Grocery & Staples",
      brand: "Aashirvaad",
      unit: "Kg",
      varType: "Weight",
      options: [
        { opt: "1kg", price: 65, cost: 48, stock: 45 },
        { opt: "5kg", price: 290, cost: 220, stock: 35 },
        { opt: "10kg", price: 550, cost: 420, stock: 25 }
      ]
    },
    {
      name: "India Gate Classic Basmati Rice",
      cat: "Grocery & Staples",
      brand: "India Gate",
      unit: "Kg",
      varType: "Weight",
      options: [
        { opt: "500g", price: 75, cost: 52, stock: 50 },
        { opt: "1kg", price: 145, cost: 105, stock: 60 },
        { opt: "5kg", price: 680, cost: 510, stock: 30 }
      ]
    },
    {
      name: "Fortune Sunlite Refined Sunflower Oil",
      cat: "Grocery & Staples",
      brand: "Fortune",
      unit: "Litre",
      varType: "Volume",
      options: [
        { opt: "500ml", price: 85, cost: 62, stock: 40 },
        { opt: "1 Litre", price: 160, cost: 122, stock: 75 },
        { opt: "5 Litre Can", price: 780, cost: 610, stock: 20 }
      ]
    },
    {
      name: "Amul Pure Cow Ghee",
      cat: "Dairy & Eggs",
      brand: "Amul",
      unit: "Litre",
      varType: "Volume",
      options: [
        { opt: "200ml", price: 145, cost: 110, stock: 40 },
        { opt: "500ml", price: 340, cost: 260, stock: 50 },
        { opt: "1 Litre Tin", price: 650, cost: 510, stock: 30 }
      ]
    },
    {
      name: "Tata Sampann Unpolished Toor Dal",
      cat: "Grocery & Staples",
      brand: "Tata",
      unit: "Kg",
      varType: "Weight",
      options: [
        { opt: "500g", price: 95, cost: 70, stock: 55 },
        { opt: "1kg", price: 180, cost: 135, stock: 65 },
        { opt: "2kg", price: 350, cost: 260, stock: 30 }
      ]
    },
    {
      name: "Amul Pasteurised Table Butter",
      cat: "Dairy & Eggs",
      brand: "Amul",
      unit: "Packet",
      varType: "Weight",
      options: [
        { opt: "100g", price: 58, cost: 44, stock: 80 },
        { opt: "500g", price: 275, cost: 215, stock: 45 }
      ]
    },
    {
      name: "Everest Pure Turmeric Powder",
      cat: "Grocery & Staples",
      brand: "Everest",
      unit: "Grams",
      varType: "Weight",
      options: [
        { opt: "100g", price: 35, cost: 24, stock: 90 },
        { opt: "200g", price: 68, cost: 48, stock: 70 },
        { opt: "500g", price: 160, cost: 115, stock: 40 }
      ]
    },
    {
      name: "Madhur Pure Crystal Sugar",
      cat: "Grocery & Staples",
      brand: "Madhur",
      unit: "Kg",
      varType: "Weight",
      options: [
        { opt: "1kg", price: 55, cost: 42, stock: 120 },
        { opt: "5kg", price: 265, cost: 205, stock: 40 }
      ]
    },
    {
      name: "Cadbury Dairy Milk Silk Chocolate",
      cat: "Snacks & Instant Foods",
      brand: "Cadbury",
      unit: "Piece",
      varType: "Size",
      options: [
        { opt: "60g Regular", price: 80, cost: 58, stock: 85 },
        { opt: "150g Large Bar", price: 195, cost: 145, stock: 50 },
        { opt: "250g Giant Pack", price: 320, cost: 240, stock: 30 }
      ]
    },
    {
      name: "Pintola All Natural Crunchy Peanut Butter",
      cat: "Snacks & Instant Foods",
      brand: "Pintola",
      unit: "Jar",
      varType: "Weight",
      options: [
        { opt: "350g", price: 190, cost: 130, stock: 40 },
        { opt: "1kg Tub", price: 475, cost: 340, stock: 30 }
      ]
    }
  ];

  // Insert all multi-variation staples
  multiVariationStaples.forEach((mv) => {
    mv.options.forEach((opt) => {
      items.push({
        "Product Name": mv.name,
        "Category": mv.cat,
        "Brand": mv.brand,
        "Unit": mv.unit,
        "Selling Price": opt.price,
        "Cost Price": opt.cost,
        "Stock": opt.stock,
        "Buffer Stock": Math.max(5, Math.floor(opt.stock * 0.15)),
        "Barcode (Leave empty to auto-generate)": "",
        "Has Variations (TRUE/FALSE)": "TRUE",
        "Variation Type": mv.varType,
        "Variation Option": opt.opt,
        "Status": "Active",
        "Image URL": ""
      });
    });
  });

  // Standalone catalog items across categories
  const categories = [
    {
      cat: "Grocery & Staples",
      brands: ["Fortune", "Tata", "Daawat", "Catch", "MDH", "Everest"],
      units: ["Kg", "Packet", "Grams"],
      names: [
        "Sona Masoori Raw Rice 10kg", "Organic Brown Rice 1kg", "Kachi Ghani Mustard Oil 1L", "Moong Dal Dhuli 1kg",
        "Chana Dal Premium 1kg", "Urad Dal Black Whole 1kg", "Kabuli Chana Big 1kg", "Rajma Chitra Jammu 1kg",
        "Sendha Rock Salt 500g", "Organic Jaggery Powder 500g", "MDH Deggi Mirch 100g", "Catch Coriander Powder 200g",
        "Everest Garam Masala 100g", "Tata Sampann Cumin Seeds 100g", "Black Mustard Seeds 100g", "Green Cardamom Elaichi 50g",
        "Cloves Laung Premium 50g", "Cinnamon Sticks Dalchini 100g", "Black Pepper Kali Mirch 100g", "Kasuri Methi 100g",
        "Tata Sampann Besan 500g", "Roasted Sooji Rava 500g", "Poha Thick Flattened Rice 1kg", "Roasted Vermicelli Sewai 500g",
        "Sabudana Sago Premium 500g", "Baking Soda 100g", "Active Dry Yeast 50g", "Corn Flour Starch 500g",
        "Chana Sattu Roasted 500g"
      ]
    },
    {
      cat: "Dairy & Eggs",
      brands: ["Amul", "Mother Dairy", "Nandini", "Heritage", "Milky Mist", "Epigamia"],
      units: ["Packet", "Piece", "Kg"],
      names: [
        "Taaza Homogenised Toned Milk 1L", "Gold Full Cream Fresh Milk 500ml", "Cow Milk Fresh Pouch 1L",
        "Unsalted Cooking Butter 100g", "Fresh Malai Paneer 200g", "Low Fat High Protein Paneer 200g",
        "Processed Cheese Block 200g", "Cheese Slices 10 Slices Pack", "Mozzarella Pizza Cheese Shredded 200g",
        "Fresh Dahi Curd Tub 400g", "Masti Spiced Buttermilk 200ml", "Sweet Lassi Mango 200ml",
        "Epigamia Greek Yogurt Strawberry 100g", "Greek Yogurt Blueberry 100g", "Fresh Cream 250ml",
        "Mithai Mate Sweetened Condensed Milk 400g", "Farm Fresh White Eggs 6 Pack", "Brown Free Range Eggs 6 Pack",
        "Quail Eggs 12 Pack", "Flavored Milk Kesar Badam 200ml", "Chocolate Milkshake Can 180ml", "Khoa Mawa Fresh 250g"
      ]
    },
    {
      cat: "Snacks & Instant Foods",
      brands: ["Lays", "Kurkure", "Haldirams", "Maggi", "Bikaji", "Sunfeast", "Parle", "Britannia", "Pringles"],
      units: ["Packet", "Box", "Piece"],
      names: [
        "Classic Salted Potato Chips 50g", "India's Magic Masala Chips 50g", "American Style Cream & Onion Chips 50g",
        "Naughty Tomato Kurkure 90g", "Solid Masti Masala Twists 75g", "Bhujia Sev Spicy 400g", "All In One Namkeen 400g",
        "Navratan Mixture 400g", "Khatta Meetha Namkeen 400g", "Moong Dal Salted 200g", "Nut Crackers Masala Peanuts 200g",
        "Maggi 2-Minute Masala Noodles 4 Pack", "Maggi Special Masala Noodles 12 Pack", "Yippee Magic Masala Noodles 4 Pack",
        "Top Ramen Curry Noodles 280g", "Knorr Classic Sweet Corn Soup 44g", "Knorr Mixed Veg Soup 43g",
        "Ching's Secret Hakka Noodles 150g", "Schezwan Chutney Dip 250g", "Good Day Butter Cookies 200g",
        "Good Day Cashew Almond Cookies 200g", "Parle-G Original Glucose Biscuits 800g", "Bourbon Chocolate Cream Biscuits 150g",
        "Hide & Seek Chocolate Chip Cookies 200g", "Dark Fantasy Choco Fills 300g", "Marie Gold Light Crisp Biscuits 400g",
        "Monaco Salted Crackers 200g", "Pringles Sour Cream & Onion 107g", "Pringles Original Potato Crisps 107g",
        "Kissan Fresh Tomato Ketchup 950g", "Kissan Mixed Fruit Jam 500g", "Nutella Hazelnut Cocoa Spread 350g",
        "Quaker Rolled Oats 1kg", "Kellogg's Corn Flakes Original 875g", "Kellogg's Chocos Chocolate Cereal 375g"
      ]
    },
    {
      cat: "Beverages & Drinks",
      brands: ["Coca Cola", "Pepsi", "Red Bull", "Tropicana", "Real", "Brooke Bond", "Tata Tea", "Nescafe", "Bru"],
      units: ["Bottle", "Packet", "Piece"],
      names: [
        "Coca Cola Original Taste 750ml", "Diet Coke Zero Sugar 300ml Can", "Sprite Lemon Lime Drink 750ml",
        "Thums Up Charged Carbonated Drink 750ml", "Fanta Orange Sparkling Drink 750ml", "Pepsi Black Max Taste 300ml Can",
        "Red Bull Energy Drink 250ml", "Monster Energy Green 350ml", "Tropicana 100% Orange Juice 1L",
        "Real Fruit Power Mixed Fruit 1L", "Real Mango Fruit Beverage 1L", "Paper Boat Aam Panna 200ml",
        "Red Label Tea Leaf Pouch 500g", "Tata Tea Gold Royal Blend 500g", "Taj Mahal Luxury Tea 250g",
        "Wagh Bakri Premium CTC Tea 1kg", "Nescafe Classic Instant Coffee Jar 100g", "Bru Gold Instant Granules 100g",
        "Horlicks Health Drink Classic Malt 500g", "Boost Energy Drink Refill 500g", "Complan Royal Chocolate 500g"
      ]
    },
    {
      cat: "Personal Care & Hygiene",
      brands: ["Dettol", "Dove", "Colgate", "Head & Shoulders", "Nivea", "Lifebuoy", "Pears", "Gillette"],
      units: ["Piece", "Bottle", "Box"],
      names: [
        "Dettol Original Germ Protection Soap 125g", "Dove Cream Beauty Bathing Bar 100g", "Pears Pure & Gentle Soap 125g",
        "Lifebuoy Total 10 Soap 125g", "Colgate MaxFresh Blue Gel 150g", "Colgate Strong Teeth Dental Cream 200g",
        "Sensodyne Fresh Mint Toothpaste 100g", "Oral-B Pro Health Toothbrush 4 Pack", "Head & Shoulders Anti-Dandruff 340ml",
        "Dove Intense Repair Hair Shampoo 340ml", "Pantene Pro-V Silky Smooth 340ml", "Nivea Soft Moisturising Cream 200ml",
        "Vaseline Healthy Bright Body Lotion 400ml", "Dettol Liquid Handwash Pump 200ml", "Lifebuoy Hand Sanitizer 500ml",
        "Gillette Mach 3 Razor Starter Kit", "Gillette Classic Shaving Foam 418g", "Nivea Men Fresh Active Deodorant 150ml",
        "Fogg Scent Xpressio Perfume 100ml", "Whisper Ultra Clean Sanitary Pads 30s", "Stayfree Secure Cotton Pads 20s"
      ]
    },
    {
      cat: "Household & Cleaning",
      brands: ["Surf Excel", "Ariel", "Vim", "Harpic", "Lizol", "Pril", "Comfort", "Good Knight"],
      units: ["Packet", "Bottle", "Piece"],
      names: [
        "Surf Excel Matic Front Load Powder 2kg", "Surf Excel Easy Wash Detergent 1kg", "Ariel Matic Top Load Powder 2kg",
        "Tide Plus Extra Power Detergent 2kg", "Rin Detergent Bar 250g 4 Pack", "Comfort After Wash Fabric Softener 860ml",
        "Vim Dishwash Gel Lemon Squeeze 750ml", "Vim Dishwash Bar Yellow 300g", "Pril Liquid Dishwash Kraft Gel 750ml",
        "Harpic Power Plus Toilet Cleaner 1L", "Lizol Citrus Floor Disinfectant 1L", "Colin Glass and Surface Cleaner 500ml",
        "Good Knight Gold Flash Liquid 45ml", "All Out Ultra Mosquito Repellent Refill", "Hit Flying Insect Mosquito Spray 400ml",
        "Odonil Room Air Freshener Jasmine 50g", "Garbage Bags Medium 30 Bags Roll", "Scotch-Brite Scrub Pad 3 Pack"
      ]
    },
    {
      cat: "Bakery & Breakfast",
      brands: ["Modern", "Britannia", "English Oven", "Harvest Gold"],
      units: ["Packet", "Piece"],
      names: [
        "100% Whole Wheat Brown Bread 400g", "White Sandwich Sliced Bread 400g", "Multigrain High Fiber Bread 400g",
        "Garlic Herb Toast Loaf 200g", "Burger Buns Sesame 2 Pack", "Pav Soft Buns 6 Pack", "Pizza Base Thick Crust 2 Pack",
        "Fruit Cake Slices Bar 150g", "Chocolate Fudge Brownie Slice 75g", "Vanilla Sponge Cake Roll 150g",
        "Butter Rusk Crunchy Toast 400g", "Milk Rusk with Cardamom 300g"
      ]
    }
  ];

  categories.forEach((group) => {
    group.names.forEach((name, i) => {
      const brand = group.brands[i % group.brands.length];
      const unit = group.units[i % group.units.length];
      const selling = 30 + Math.floor(Math.random() * 450);
      const cost = Math.floor(selling * 0.72);
      const stock = 15 + Math.floor(Math.random() * 85);
      const buffer = Math.max(5, Math.floor(stock * 0.15));

      items.push({
        "Product Name": name,
        "Category": group.cat,
        "Brand": brand,
        "Unit": unit,
        "Selling Price": selling,
        "Cost Price": cost,
        "Stock": stock,
        "Buffer Stock": buffer,
        "Barcode (Leave empty to auto-generate)": "",
        "Has Variations (TRUE/FALSE)": "FALSE",
        "Variation Type": "",
        "Variation Option": "",
        "Status": "Active",
        "Image URL": ""
      });
    });
  });

  // Pad up to 300 items
  let extraCount = 1;
  while (items.length < 300) {
    items.push({
      "Product Name": `Special Supermarket Grocery Item #${extraCount}`,
      "Category": "Grocery & Staples",
      "Brand": "Retail Premium",
      "Unit": "Packet",
      "Selling Price": 99,
      "Cost Price": 68,
      "Stock": 45,
      "Buffer Stock": 10,
      "Barcode (Leave empty to auto-generate)": "",
      "Has Variations (TRUE/FALSE)": "FALSE",
      "Variation Type": "",
      "Variation Option": "",
      "Status": "Active",
      "Image URL": ""
    });
    extraCount++;
  }

  return items.slice(0, 300);
};

// Helper to generate 100 Ice Cream Shop products with multiple variations
export const generateIceCreamProducts = (): BulkProductRow[] => {
  const items: BulkProductRow[] = [];

  // Multi-variation artisan ice cream scoops & family packs (same name with multiple servings/sizes)
  const multiVariationIceCreams = [
    {
      name: "Rich Belgian Dark Chocolate",
      cat: "Artisan Scoops",
      brand: "ScoopMaster",
      unit: "Scoop",
      varType: "Serving Style",
      options: [
        { opt: "Single Scoop", price: 120, cost: 70, stock: 80, unit: "Scoop" },
        { opt: "Double Scoop", price: 210, cost: 120, stock: 50, unit: "Scoop" },
        { opt: "Waffle Cone", price: 150, cost: 85, stock: 60, unit: "Cone" },
        { opt: "500ml Family Tub", price: 340, cost: 210, stock: 35, unit: "Tub" }
      ]
    },
    {
      name: "Madagascar Bourbon Vanilla",
      cat: "Artisan Scoops",
      brand: "ScoopMaster",
      unit: "Scoop",
      varType: "Serving Style",
      options: [
        { opt: "Single Scoop", price: 90, cost: 50, stock: 100, unit: "Scoop" },
        { opt: "Double Scoop", price: 160, cost: 90, stock: 70, unit: "Scoop" },
        { opt: "Waffle Cone", price: 120, cost: 65, stock: 60, unit: "Cone" },
        { opt: "1 Litre Party Tub", price: 260, cost: 150, stock: 40, unit: "Tub" }
      ]
    },
    {
      name: "Royal Alphonso Mango Swirl",
      cat: "Artisan Scoops",
      brand: "ScoopMaster",
      unit: "Scoop",
      varType: "Serving Style",
      options: [
        { opt: "Single Scoop", price: 110, cost: 65, stock: 75, unit: "Scoop" },
        { opt: "Double Scoop", price: 195, cost: 115, stock: 50, unit: "Scoop" },
        { opt: "Waffle Cone", price: 140, cost: 80, stock: 60, unit: "Cone" },
        { opt: "500ml Family Tub", price: 310, cost: 180, stock: 35, unit: "Tub" }
      ]
    },
    {
      name: "Sicilian Pistachio & Saffron Delight",
      cat: "Artisan Scoops",
      brand: "ScoopMaster",
      unit: "Scoop",
      varType: "Serving Style",
      options: [
        { opt: "Single Scoop", price: 140, cost: 80, stock: 50, unit: "Scoop" },
        { opt: "Double Scoop", price: 250, cost: 145, stock: 40, unit: "Scoop" },
        { opt: "Waffle Cone", price: 175, cost: 100, stock: 45, unit: "Cone" }
      ]
    },
    {
      name: "Creamy Strawberry Cheesecake",
      cat: "Artisan Scoops",
      brand: "ScoopMaster",
      unit: "Scoop",
      varType: "Serving Style",
      options: [
        { opt: "Single Scoop", price: 120, cost: 70, stock: 60, unit: "Scoop" },
        { opt: "Double Scoop", price: 215, cost: 125, stock: 45, unit: "Scoop" },
        { opt: "500ml Family Tub", price: 330, cost: 195, stock: 30, unit: "Tub" }
      ]
    },
    {
      name: "Crunchy Butterscotch Caramel",
      cat: "Artisan Scoops",
      brand: "ScoopMaster",
      unit: "Scoop",
      varType: "Serving Style",
      options: [
        { opt: "Single Scoop", price: 95, cost: 55, stock: 90, unit: "Scoop" },
        { opt: "Double Scoop", price: 170, cost: 95, stock: 65, unit: "Scoop" },
        { opt: "1 Litre Party Tub", price: 290, cost: 170, stock: 45, unit: "Tub" }
      ]
    },
    {
      name: "Oreo Cookies and Cream Blast",
      cat: "Artisan Scoops",
      brand: "ScoopMaster",
      unit: "Scoop",
      varType: "Serving Style",
      options: [
        { opt: "Single Scoop", price: 115, cost: 65, stock: 85, unit: "Scoop" },
        { opt: "Double Scoop", price: 200, cost: 115, stock: 55, unit: "Scoop" },
        { opt: "500ml Family Tub", price: 320, cost: 185, stock: 35, unit: "Tub" }
      ]
    }
  ];

  // Insert all multi-variation ice creams
  multiVariationIceCreams.forEach((mv) => {
    mv.options.forEach((opt) => {
      items.push({
        "Product Name": mv.name,
        "Category": mv.cat,
        "Brand": mv.brand,
        "Unit": opt.unit || mv.unit,
        "Selling Price": opt.price,
        "Cost Price": opt.cost,
        "Stock": opt.stock,
        "Buffer Stock": Math.max(5, Math.floor(opt.stock * 0.15)),
        "Barcode (Leave empty to auto-generate)": "",
        "Has Variations (TRUE/FALSE)": "TRUE",
        "Variation Type": mv.varType,
        "Variation Option": opt.opt,
        "Status": "Active",
        "Image URL": ""
      });
    });
  });

  // Standalone Gourmet items
  const standaloneItems = [
    // Sundaes & Specialties
    { name: "Hot Chocolate Fudge Sensation", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 195, cost: 110, stock: 45 },
    { name: "Death By Chocolate (DBC) Mega Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 260, cost: 140, stock: 40 },
    { name: "Nutty Brownie Sizzler with Hot Fudge", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Sizzler", price: 230, cost: 130, stock: 35 },
    { name: "Banana Split Triple Scoop Fantasy", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Boat", price: 240, cost: 135, stock: 30 },
    { name: "Berry Berry Strawberry Extravaganza", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 185, cost: 100, stock: 35 },
    { name: "Royal Falooda Kesar Kulfi Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Glass", price: 175, cost: 95, stock: 50 },
    { name: "Nutty Professor Dry Fruit Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 220, cost: 125, stock: 40 },
    { name: "Caramel Crunch Waffle Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 190, cost: 105, stock: 35 },
    { name: "KitKat Crunch Overload Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 210, cost: 115, stock: 40 },
    { name: "Lotus Biscoff Crumble Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 245, cost: 135, stock: 35 },

    // Thick Shakes & Milkshakes
    { name: "Oreo Monster Thick Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 160, cost: 85, stock: 50 },
    { name: "Nutella Hazelnut Loaded Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 190, cost: 105, stock: 45 },
    { name: "Belgian Chocolate Frosty Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 170, cost: 90, stock: 55 },
    { name: "Strawberries & Cream Smooth Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 150, cost: 80, stock: 40 },
    { name: "Mango Mania Fresh Pulp Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 155, cost: 80, stock: 45 },
    { name: "Cold Coffee Frappe with Vanilla Scoop", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 145, cost: 75, stock: 60 },
    { name: "Brownie Blast Thick Milkshake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 180, cost: 98, stock: 40 },
    { name: "Caramel Macchiato Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 165, cost: 90, stock: 35 },
    { name: "KitKat Velvet Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 175, cost: 95, stock: 45 },
    { name: "Peanut Butter Chocolate Protein Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 195, cost: 110, stock: 30 },

    // Kulfi, Popsicles & Sticks
    { name: "Shahi Malai Kulfi on Stick", cat: "Kulfi & Sticks", brand: "DesiKulfi", unit: "Piece", price: 50, cost: 26, stock: 120 },
    { name: "Traditional Matka Kulfi Pot", cat: "Kulfi & Sticks", brand: "DesiKulfi", unit: "Pot", price: 85, cost: 45, stock: 80 },
    { name: "Kesar Pista Kulfi Slice", cat: "Kulfi & Sticks", brand: "DesiKulfi", unit: "Slice", price: 65, cost: 35, stock: 90 },
    { name: "Alphonso Mango Kulfi Stick", cat: "Kulfi & Sticks", brand: "DesiKulfi", unit: "Piece", price: 55, cost: 28, stock: 100 },
    { name: "Belgian Chocobar Dark Crunch", cat: "Kulfi & Sticks", brand: "ChocoStick", unit: "Piece", price: 60, cost: 32, stock: 110 },
    { name: "White Chocolate Almond Feast Stick", cat: "Kulfi & Sticks", brand: "ChocoStick", unit: "Piece", price: 75, cost: 40, stock: 95 },
    { name: "Tangy Orange Ice Lolly Stick", cat: "Kulfi & Sticks", brand: "ChocoStick", unit: "Piece", price: 30, cost: 14, stock: 150 },
    { name: "Tropical Mango Ice Bar Stick", cat: "Kulfi & Sticks", brand: "ChocoStick", unit: "Piece", price: 35, cost: 16, stock: 140 },
    { name: "Kala Khatta Tangy Popsicle", cat: "Kulfi & Sticks", brand: "ChocoStick", unit: "Piece", price: 30, cost: 14, stock: 130 },
    { name: "Cassata Slice Multi-Layered", cat: "Kulfi & Sticks", brand: "DesiKulfi", unit: "Slice", price: 80, cost: 42, stock: 70 },

    // Ice Cream Cakes & Pastries
    { name: "Black Forest Ice Cream Cake 1kg", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Cake", price: 750, cost: 420, stock: 20 },
    { name: "Chocolate Truffle Ice Cream Cake 1kg", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Cake", price: 850, cost: 480, stock: 15 },
    { name: "Red Velvet Berry Ice Cream Cake 1kg", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Cake", price: 890, cost: 510, stock: 15 },
    { name: "Mango Mousse Ice Cream Cake 1kg", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Cake", price: 790, cost: 450, stock: 18 },
    { name: "Butterscotch Crunch Ice Cream Pastry", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Pastry", price: 110, cost: 60, stock: 30 },
    { name: "Dark Chocolate Mousse Pastry", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Pastry", price: 120, cost: 65, stock: 30 },

    // Toppings & Sauces
    { name: "Hot Chocolate Fudge Sauce Squeeze 250ml", cat: "Toppings & Sauces", brand: "Topper", unit: "Bottle", price: 95, cost: 50, stock: 60 },
    { name: "Gourmet Salted Caramel Drizzle 250ml", cat: "Toppings & Sauces", brand: "Topper", unit: "Bottle", price: 110, cost: 58, stock: 50 },
    { name: "Dark Choco Chips Crunchy 100g", cat: "Toppings & Sauces", brand: "Topper", unit: "Jar", price: 65, cost: 32, stock: 80 },
    { name: "Roasted Almond Flakes 100g", cat: "Toppings & Sauces", brand: "Topper", unit: "Jar", price: 90, cost: 48, stock: 70 },
    { name: "Rainbow Sugar Sprinkles Jar 100g", cat: "Toppings & Sauces", brand: "Topper", unit: "Jar", price: 50, cost: 22, stock: 90 },
    { name: "Crushed Oreo Crumbs 150g", cat: "Toppings & Sauces", brand: "Topper", unit: "Packet", price: 55, cost: 28, stock: 85 },
    { name: "Crispy Waffle Cones 10 Pack", cat: "Toppings & Sauces", brand: "Topper", unit: "Box", price: 70, cost: 35, stock: 100 }
  ];

  standaloneItems.forEach((st) => {
    items.push({
      "Product Name": st.name,
      "Category": st.cat,
      "Brand": st.brand,
      "Unit": st.unit,
      "Selling Price": st.price,
      "Cost Price": st.cost,
      "Stock": st.stock,
      "Buffer Stock": Math.max(5, Math.floor(st.stock * 0.15)),
      "Barcode (Leave empty to auto-generate)": "",
      "Has Variations (TRUE/FALSE)": "FALSE",
      "Variation Type": "",
      "Variation Option": "",
      "Status": "Active",
      "Image URL": ""
    });
  });

  // Pad to exactly 100 items
  let count = 1;
  while (items.length < 100) {
    items.push({
      "Product Name": `Artisan Signature Flavour Special #${count}`,
      "Category": "Artisan Scoops",
      "Brand": "ScoopMaster",
      "Unit": "Scoop",
      "Selling Price": 125,
      "Cost Price": 70,
      "Stock": 60,
      "Buffer Stock": 10,
      "Barcode (Leave empty to auto-generate)": "",
      "Has Variations (TRUE/FALSE)": "FALSE",
      "Variation Type": "",
      "Variation Option": "",
      "Status": "Active",
      "Image URL": ""
    });
    count++;
  }

  return items.slice(0, 100);
};

// Download Trigger
export const downloadExcelTemplate = (type: "empty" | "supermarket" | "icecream") => {
  let rows: BulkProductRow[] = [];
  let fileName = "Products_Template.xlsx";

  if (type === "empty") {
    rows = EMPTY_TEMPLATE_ROWS;
    fileName = "Empty_Products_Template_With_Variations.xlsx";
  } else if (type === "supermarket") {
    rows = generateSupermarketProducts();
    fileName = "Supermarket_300_Products_Template.xlsx";
  } else if (type === "icecream") {
    rows = generateIceCreamProducts();
    fileName = "Ice_Cream_Shop_100_Products_Template.xlsx";
  }

  const ws = XLSX.utils.json_to_sheet(rows);

  // Set nice column widths
  ws["!cols"] = [
    { wch: 38 }, // Product Name
    { wch: 24 }, // Category
    { wch: 18 }, // Brand
    { wch: 10 }, // Unit
    { wch: 14 }, // Selling Price
    { wch: 14 }, // Cost Price
    { wch: 10 }, // Stock
    { wch: 12 }, // Buffer Stock
    { wch: 22 }, // Barcode
    { wch: 26 }, // Has Variations
    { wch: 18 }, // Variation Type
    { wch: 18 }, // Variation Option
    { wch: 10 }, // Status
    { wch: 18 }  // Image URL
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products Catalog");
  XLSX.writeFile(wb, fileName);
};
