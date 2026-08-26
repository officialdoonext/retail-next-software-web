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

// 1. Empty Template
export const EMPTY_TEMPLATE_ROWS: BulkProductRow[] = [
  {
    "Product Name": "Sample Basmati Rice",
    "Category": "Grocery & Staples",
    "Brand": "India Gate",
    "Unit": "Kg",
    "Selling Price": 120,
    "Cost Price": 85,
    "Stock": 50,
    "Buffer Stock": 10,
    "Barcode (Leave empty to auto-generate)": "",
    "Has Variations (TRUE/FALSE)": "FALSE",
    "Variation Type": "",
    "Variation Option": "",
    "Status": "Active",
    "Image URL": ""
  },
  {
    "Product Name": "Sample Chocolate Tub",
    "Category": "Ice Creams",
    "Brand": "Amul",
    "Unit": "Pack",
    "Selling Price": 250,
    "Cost Price": 175,
    "Stock": 30,
    "Buffer Stock": 5,
    "Barcode (Leave empty to auto-generate)": "",
    "Has Variations (TRUE/FALSE)": "TRUE",
    "Variation Type": "Volume",
    "Variation Option": "500ml",
    "Status": "Active",
    "Image URL": ""
  }
];

// Helper to generate 300 Supermarket products
export const generateSupermarketProducts = (): BulkProductRow[] => {
  const items: BulkProductRow[] = [];

  const categories = [
    {
      cat: "Grocery & Staples",
      brands: ["Aashirvaad", "Fortune", "Tata", "India Gate", "Madhur", "Daawat", "Catch", "MDH", "Everest"],
      units: ["Kg", "Packet"],
      names: [
        "Superior MP Sharbati Atta 5kg", "Chakki Fresh Whole Wheat Atta 10kg", "Premium Basmati Rice Classic 1kg",
        "Rozana Basmati Rice 5kg", "Sona Masoori Raw Rice 10kg", "Organic Brown Rice 1kg", "Refined Sunflower Oil 1L",
        "Kachi Ghani Mustard Oil 1L", "Pure Cow Ghee 500ml", "Pure Buffalo Ghee 1L", "Toor Dal Desi 1kg",
        "Moong Dal Dhuli 1kg", "Chana Dal Premium 1kg", "Urad Dal Black Whole 1kg", "Kabuli Chana Big 1kg",
        "Rajma Chitra Jammu 1kg", "Tata Salt Vacuum Evaporated 1kg", "Sendha Rock Salt 500g", "Madhur Pure Crystal Sugar 1kg",
        "Organic Jaggery Powder 500g", "Everest Turmeric Powder 200g", "MDH Deggi Mirch 100g", "Catch Coriander Powder 200g",
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
        "Pasteurised Table Butter Salted 500g", "Unsalted Cooking Butter 100g", "Fresh Malai Paneer 200g",
        "Low Fat High Protein Paneer 200g", "Processed Cheese Block 200g", "Cheese Slices 10 Slices Pack",
        "Mozzarella Pizza Cheese Shredded 200g", "Fresh Dahi Curd Tub 400g", "Masti Spiced Buttermilk 200ml",
        "Sweet Lassi Mango 200ml", "Epigamia Greek Yogurt Strawberry 100g", "Greek Yogurt Blueberry 100g",
        "Fresh Cream 250ml", "Mithai Mate Sweetened Condensed Milk 400g", "Farm Fresh White Eggs 6 Pack",
        "Brown Free Range Eggs 6 Pack", "Quail Eggs 12 Pack", "Flavored Milk Kesar Badam 200ml",
        "Chocolate Milkshake Can 180ml", "Probiotic Drink 5 Pack", "Khoa Mawa Fresh 250g", "Cottage Cheese Cubes 200g"
      ]
    },
    {
      cat: "Snacks & Instant Foods",
      brands: ["Lays", "Kurkure", "Haldirams", "Maggi", "Bikaji", "Sunfeast", "Parle", "Britannia", "Pringles"],
      units: ["Packet", "Box"],
      names: [
        "Classic Salted Potato Chips 50g", "India's Magic Masala Chips 50g", "American Style Cream & Onion Chips 50g",
        "Naughty Tomato Kurkure 90g", "Solid Masti Masala Twists 75g", "Bhujia Sev Spicy 400g", "All In One Namkeen 400g",
        "Navratan Mixture 400g", "Khatta Meetha Namkeen 400g", "Moong Dal Salted 200g", "Nut Crackers Masala Peanuts 200g",
        "Maggi 2-Minute Masala Noodles 4 Pack", "Maggi Special Masala Noodles 12 Pack", "Yippee Magic Masala Noodles 4 Pack",
        "Top Ramen Curry Noodles 280g", "Knorr Classic Sweet Corn Soup 44g", "Knorr Mixed Veg Soup 43g",
        "Ching's Secret Hakka Noodles 150g", "Schezwan Chutney Dip 250g", "Good Day Butter Cookies 200g",
        "Good Day Cashew Almond Cookies 200g", "Parle-G Original Glucose Biscuits 800g", "Bourbon Chocolate Cream Biscuits 150g",
        "Hide & Seek Chocolate Chip Cookies 200g", "Dark Fantasy Choco Fills 300g", "Marie Gold Light Crisp Biscuits 400g",
        "Monaco Salted Crackers 200g", "Krackjack Sweet & Salty Crackers 200g", "Pringles Sour Cream & Onion 107g",
        "Pringles Original Potato Crisps 107g", "Act II Butter Lovers Microwave Popcorn 85g", "Act II Golden Sizzle Popcorn 70g",
        "Kissan Fresh Tomato Ketchup 950g", "Kissan Mixed Fruit Jam 500g", "Nutella Hazelnut Cocoa Spread 350g",
        "Pintola All Natural Peanut Butter 1kg", "Quaker Rolled Oats 1kg", "Kellogg's Corn Flakes Original 875g",
        "Kellogg's Chocos Chocolate Cereal 375g", "Muesli Fruit & Nut 500g"
      ]
    },
    {
      cat: "Beverages & Drinks",
      brands: ["Coca Cola", "Pepsi", "Red Bull", "Tropicana", "Real", "Brooke Bond", "Tata Tea", "Nescafe", "Bru"],
      units: ["Bottle", "Can", "Packet"],
      names: [
        "Coca Cola Original Taste 750ml", "Diet Coke Zero Sugar 300ml Can", "Sprite Lemon Lime Drink 750ml",
        "Thums Up Charged Carbonated Drink 750ml", "Fanta Orange Sparkling Drink 750ml", "Pepsi Black Max Taste 300ml Can",
        "Limca Fresh Lemon Drink 750ml", "Mirinda Orange 750ml", "Mountain Dew Neon 750ml", "Red Bull Energy Drink 250ml Can",
        "Monster Energy Green 350ml Can", "Real Fruit Power Guava Juice 1L", "Real Fruit Power Mixed Fruit Juice 1L",
        "Tropicana 100% Orange Juice 1L", "Tropicana Apple Juice 1L", "Frooti Fresh Mango Drink 1.2L",
        "Maaza Mango Delight 1.2L", "Paper Boat Aamras Mango Juice 200ml", "Paper Boat Jaljeera Drink 200ml",
        "Brooke Bond Red Label Tea 500g", "Brooke Bond Taj Mahal Royal Tea 250g", "Tata Tea Gold Long Leaves 500g",
        "Wagh Bakri Premium CTC Tea 500g", "Tetley Green Tea Lemon & Honey 25 Bags", "Lipton Pure & Light Green Tea 25 Bags",
        "Nescafe Classic Instant Coffee 100g Jar", "Nescafe Gold Rich Blend Coffee 100g", "Bru Instant Coffee Chicory Mix 200g",
        "Davidoff Rich Aroma Fine Coffee 100g", "Horlicks Classic Malt Health Drink 500g", "Bournvita Cadbury Chocolate Mix 500g",
        "Boost Energy Drink Chocolate 500g", "Ensure Nutrition Powder Vanilla 400g", "Bisleri Packaged Mineral Water 1L",
        "Kinley Soda Extra Punch 750ml"
      ]
    },
    {
      cat: "Personal Care & Hygiene",
      brands: ["Dettol", "Dove", "Colgate", "Nivea", "Head & Shoulders", "Gillette", "Pears", "Vaseline", "Lifebuoy"],
      units: ["Piece", "Bottle", "Tube"],
      names: [
        "Dettol Original Germ Protection Soap 125g", "Dettol Skincare Soap 125g", "Dove Cream Beauty Bathing Bar 100g",
        "Pears Pure & Gentle Glycerin Soap 125g", "Lifebuoy Total 10 Antibacterial Soap 125g", "Dettol Liquid Handwash Refill 750ml",
        "Lifebuoy Nature Pure Handwash 200ml", "Colgate Total 12hr Protection Toothpaste 150g", "Colgate MaxFresh Spicy Fresh 150g",
        "Sensodyne Rapid Relief Toothpaste 80g", "Close Up Everfresh Red Hot Gel 150g", "Oral-B Pro-Health Soft Toothbrush",
        "Colgate ZigZag Charcoal Toothbrush 4 Pack", "Listerine Cool Mint Mouthwash 250ml", "Head & Shoulders Cool Menthol Shampoo 340ml",
        "Dove Intense Repair Hair Shampoo 340ml", "Pantene Pro-V Hair Fall Control 340ml", "L'Oreal Paris Total Repair Conditioner 175ml",
        "Nivea Men Dark Spot Reduction Face Wash 100g", "Garnier Men Acno Fight Face Wash 100g", "Clean & Clear Foaming Face Wash 150ml",
        "Himalaya Purifying Neem Face Wash 150ml", "Nivea Soft Light Moisturizing Cream 200ml", "Vaseline Intensive Care Body Lotion 400ml",
        "Pond's Super Light Gel Oil-Free Moisturizer 100g", "Gillette Mach 3 Razor with 1 Cartridge", "Gillette Mach 3 Turbo Blade Refills 4 Pack",
        "Gillette Classic Sensitive Shaving Foam 200g", "Old Spice After Shave Lotion 100ml", "Fogg Marco Fragrance Body Spray 120ml",
        "Nivea Men Fresh Active Deodorant 150ml", "Engage Pocket Perfume for Men 18ml", "Stayfree Secure Cottony Sanitary Pads 18 Pack",
        "Whisper Choice Ultra Wings 20 Pack", "Dettol Antiseptic Liquid Disinfectant 500ml"
      ]
    },
    {
      cat: "Household & Cleaning",
      brands: ["Surf Excel", "Ariel", "Vim", "Harpic", "Lizol", "Colin", "Comfort", "Good Knight", "Pril"],
      units: ["Packet", "Bottle", "Piece"],
      names: [
        "Surf Excel Easy Wash Detergent Powder 1kg", "Surf Excel Matic Front Load Liquid 1L", "Ariel Complete Washing Powder 1kg",
        "Tide Plus Extra Power Detergent 1kg", "Comfort Fabric Conditioner Morning Fresh 860ml", "Vim Dishwash Gel Lemon Refill 750ml",
        "Vim Dishwash Bar with Polycoat 300g", "Pril Lime Active Liquid Dishwash 425ml", "Scotch-Brite Scrub Sponge Combo 3 Pack",
        "Scotch-Brite Stainless Steel Scrubber", "Harpic Power Plus Disinfectant Toilet Cleaner 1L", "Harpic Bathroom Cleaner Floral 1L",
        "Lizol Disinfectant Floor Cleaner Citrus 1L", "Lizol Disinfectant Floor Cleaner Pine 1L", "Colin Glass and Surface Cleaner 500ml",
        "Good Knight Gold Flash Liquid Mosquito Refill", "All Out Ultra Power+ Mosquito Repellent", "Hit Black Flying Insect Mosquito Spray 400ml",
        "Hit Red Cockroach Killer Spray 400ml", "Odonil Room Air Freshener Jasmine 75g", "Godrej aer Pocket Bathroom Air Fragrance",
        "Origami Kitchen Paper Towel 2 Rolls", "Premier Facial Soft Tissues 200 Pulls", "Ezee Garbage Bags Medium 30 Bags Pack",
        "Aluminium Foil Food Wrap Roll 18 Meters", "Cling Film Plastic Food Wrap 30 Meters", "Matchbox Pack of 10 Boxes",
        "Pooja Camphor Tablets Pure Kapoor 100g", "Mangaldeep Sandalwood Agarbatti Sticks 100g", "Plastic Heavy Duty Clothes Pegs 12 Pack"
      ]
    },
    {
      cat: "Dry Fruits, Nuts & Sweets",
      brands: ["Happilo", "Nutraj", "Haldirams", "Bikaji", "Gama Organics"],
      units: ["Packet", "Box", "Kg"],
      names: [
        "Premium California Whole Almonds Badam 500g", "Whole Cashews Kaju W240 Grade 500g", "Californian Walnut Kernels Akhrot 250g",
        "Roasted Salted Pistachios Pista 250g", "Green Raisins Kishmish Indian 500g", "Arabian Omani Black Dates Khajoor 500g",
        "Dried Turkish Apricots Jardalu 250g", "Dried Whole Cranberries 200g", "Roasted Pumpkin Seeds 150g", "Raw Chia Seeds 200g",
        "Flax Seeds Roasted Organic 200g", "Kaju Katli Pure Silver Vark 500g", "Motichoor Desi Ghee Ladoo 500g",
        "Special Besan Ladoo with Dry Fruits 500g", "Bikaneri Soan Papdi 500g", "Gulab Jamun Tin Pack 1kg",
        "Spongy Rasgulla Tin Pack 1kg", "Dry Fruit Mysore Pak 400g", "Assorted Premium Sweets Gift Box 800g",
        "Anjeer Fig Dry Fruit Roll 400g"
      ]
    },
    {
      cat: "Fresh Fruits & Vegetables",
      brands: ["Fresh Harvest", "Farm Fresh", "Organic Garden"],
      units: ["Kg", "Piece", "Bunch"],
      names: [
        "Fresh Red Onions Nasik 1kg", "Farm Fresh Potatoes 1kg", "Hybrid Juicy Tomatoes 1kg", "Desi Country Tomatoes 1kg",
        "Fresh Ginger Adrak 250g", "Garlic Lasun Whole Cloves 250g", "Spicy Green Chillies 100g", "Fresh Green Coriander Leaves Bunch",
        "Fresh Mint Pudina Leaves Bunch", "Curry Leaves Fresh Bunch", "Green Capsicum Bell Pepper 500g",
        "English Cucumber Salad 500g", "Fresh Green Cabbage 1 Piece", "Fresh Cauliflower Gobhi 1 Piece",
        "Green Tender Lady Finger Bhindi 500g", "French Beans Green 250g", "Bottle Gourd Lauki 1 Piece",
        "Green Peas Matar Shelled 500g", "Fresh Palak Spinach Bunch", "Carrot Orange Salad 500g",
        "Royal Gala Apples Imported 1kg", "Washington Red Apples 1kg", "Robusta Ripe Bananas 1 Dozen",
        "Elaichi Small Bananas 1 Dozen", "Alphonso Ratnagiri Mangoes 6 Pack", "Seedless Sweet Green Grapes 500g",
        "Black Seedless Grapes 500g", "Fresh Juicy Sweet Oranges Mosambi 1kg", "Ruby Red Pomegranate Anar 1kg",
        "Fresh Papaya Semi-Ripe 1 Piece", "Green Raw Coconut with Water 1 Piece", "Juicy Pineapples 1 Piece",
        "Watermelon Seedless 1 Piece", "Guava Fresh Thai 500g", "Kiwi Fruit Imported 3 Pack"
      ]
    },
    {
      cat: "Bakery & Breakfast",
      brands: ["Modern", "Britannia", "English Oven", "Harvest Gold", "D'lecta"],
      units: ["Packet", "Piece"],
      names: [
        "100% Whole Wheat Brown Bread 400g", "White Sandwich Sliced Bread 400g", "Multigrain High Fiber Bread 400g",
        "Garlic Herb Toast Loaf 200g", "Burger Buns Sesame 2 Pack", "Pav Soft Buns 6 Pack", "Pizza Base Thick Crust 2 Pack",
        "Fruit Cake Slices Bar 150g", "Chocolate Fudge Brownie Slice 75g", "Vanilla Sponge Cake Roll 150g",
        "Butter Rusk Crunchy Toast 400g", "Milk Rusk with Cardamom 300g", "Cake Rusks Premium 250g",
        "Assorted Fruit Danish Pastry 2 Pack", "Eggless Chocolate Croissant 2 Pack"
      ]
    }
  ];

  let idCounter = 1001;

  categories.forEach((group) => {
    group.names.forEach((name, i) => {
      const brand = group.brands[i % group.brands.length];
      const unit = group.units[i % group.units.length];
      const selling = 30 + Math.floor(Math.random() * 450);
      const cost = Math.floor(selling * 0.72);
      const stock = 10 + Math.floor(Math.random() * 90);
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
      idCounter++;
    });
  });

  // Ensure exactly 300 products
  while (items.length < 300) {
    const extraNum = items.length + 1;
    items.push({
      "Product Name": `Special Supermarket Grocery Item #${extraNum}`,
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
  }

  return items.slice(0, 300);
};

// Helper to generate 100 Ice Cream Shop products
export const generateIceCreamProducts = (): BulkProductRow[] => {
  const items: BulkProductRow[] = [];

  const iceCreamCatalog = [
    // Scoops & Single Servings (Variations: Single Scoop, Double Scoop, Waffle Cone)
    { name: "Rich Belgian Dark Chocolate", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 120, cost: 70, stock: 80, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Rich Belgian Dark Chocolate (Double Scoop)", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 210, cost: 120, stock: 50, varType: "Serving Style", varOpt: "Double Scoop" },
    { name: "Rich Belgian Dark Chocolate (Waffle Cone)", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Cone", price: 150, cost: 85, stock: 60, varType: "Serving Style", varOpt: "Waffle Cone" },
    { name: "Madagascar Bourbon Vanilla", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 90, cost: 50, stock: 100, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Madagascar Bourbon Vanilla (Double)", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 160, cost: 90, stock: 70, varType: "Serving Style", varOpt: "Double Scoop" },
    { name: "Royal Alphonso Mango Swirl", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 110, cost: 65, stock: 75, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Royal Alphonso Mango Swirl (Waffle)", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Cone", price: 140, cost: 80, stock: 60, varType: "Serving Style", varOpt: "Waffle Cone" },
    { name: "Roasted Almond Mocha Fudge", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 130, cost: 75, stock: 65, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Sicilian Pistachio Delight", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 140, cost: 80, stock: 50, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Creamy Strawberry Cheesecake", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 120, cost: 70, stock: 60, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Wild Blackcurrant Berry Bliss", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 110, cost: 60, stock: 70, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Crunchy Butterscotch Caramel Crunch", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 95, cost: 55, stock: 90, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Cookies and Cream Crunch", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 115, cost: 65, stock: 85, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Tender Coconut Malai Blast", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 125, cost: 70, stock: 75, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Salted Caramel Pretzel Burst", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 135, cost: 78, stock: 55, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Red Velvet Cream Cheese", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 130, cost: 75, stock: 50, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Hazelnut Nutella Rocher Scoop", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 150, cost: 90, stock: 65, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Bubblegum Rainbow Scoop", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 100, cost: 55, stock: 60, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Mint Dark Chocolate Chip", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 115, cost: 65, stock: 50, varType: "Serving Style", varOpt: "Single Scoop" },
    { name: "Kesar Pista Saffron Gold", cat: "Artisan Scoops", brand: "ScoopMaster", unit: "Scoop", price: 135, cost: 78, stock: 80, varType: "Serving Style", varOpt: "Single Scoop" },

    // Sundaes & Specialties
    { name: "Hot Chocolate Fudge Sensation", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 195, cost: 110, stock: 45, varType: "", varOpt: "" },
    { name: "Death By Chocolate (DBC) Mega Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 260, cost: 140, stock: 40, varType: "", varOpt: "" },
    { name: "Nutty Brownie Sizzler with Hot Fudge", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Sizzler", price: 230, cost: 130, stock: 35, varType: "", varOpt: "" },
    { name: "Banana Split Triple Scoop Fantasy", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Boat", price: 240, cost: 135, stock: 30, varType: "", varOpt: "" },
    { name: "Berry Berry Strawberry Extravaganza", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 185, cost: 100, stock: 35, varType: "", varOpt: "" },
    { name: "Royal Falooda Kesar Kulfi Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Glass", price: 175, cost: 95, stock: 50, varType: "", varOpt: "" },
    { name: "Nutty Professor Dry Fruit Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 220, cost: 125, stock: 40, varType: "", varOpt: "" },
    { name: "Caramel Crunch Waffle Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 190, cost: 105, stock: 35, varType: "", varOpt: "" },
    { name: "KitKat Crunch Overload Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 210, cost: 115, stock: 40, varType: "", varOpt: "" },
    { name: "Lotus Biscoff Crumble Sundae", cat: "Gourmet Sundaes", brand: "SundaeClub", unit: "Bowl", price: 245, cost: 135, stock: 35, varType: "", varOpt: "" },

    // Thick Shakes & Milkshakes
    { name: "Oreo Monster Thick Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 160, cost: 85, stock: 50, varType: "", varOpt: "" },
    { name: "Nutella Hazelnut Loaded Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 190, cost: 105, stock: 45, varType: "", varOpt: "" },
    { name: "Belgian Chocolate Frosty Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 170, cost: 90, stock: 55, varType: "", varOpt: "" },
    { name: "Strawberries & Cream Smooth Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 150, cost: 80, stock: 40, varType: "", varOpt: "" },
    { name: "Mango Mania Fresh Pulp Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 155, cost: 80, stock: 45, varType: "", varOpt: "" },
    { name: "Cold Coffee Frappe with Vanilla Scoop", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 145, cost: 75, stock: 60, varType: "", varOpt: "" },
    { name: "Brownie Blast Thick Milkshake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 180, cost: 98, stock: 40, varType: "", varOpt: "" },
    { name: "Caramel Macchiato Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 165, cost: 90, stock: 35, varType: "", varOpt: "" },
    { name: "KitKat Velvet Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 175, cost: 95, stock: 45, varType: "", varOpt: "" },
    { name: "Peanut Butter Chocolate Protein Shake", cat: "Shakes & Beverages", brand: "ChillShake", unit: "Glass", price: 195, cost: 110, stock: 30, varType: "", varOpt: "" },

    // Kulfi, Popsicles & Sticks
    { name: "Shahi Malai Kulfi on Stick", cat: "Kulfi & Sticks", brand: "DesiKulfi", unit: "Piece", price: 50, cost: 26, stock: 120, varType: "", varOpt: "" },
    { name: "Traditional Matka Kulfi Pot", cat: "Kulfi & Sticks", brand: "DesiKulfi", unit: "Pot", price: 85, cost: 45, stock: 80, varType: "", varOpt: "" },
    { name: "Kesar Pista Kulfi Slice", cat: "Kulfi & Sticks", brand: "DesiKulfi", unit: "Slice", price: 65, cost: 35, stock: 90, varType: "", varOpt: "" },
    { name: "Alphonso Mango Kulfi Stick", cat: "Kulfi & Sticks", brand: "DesiKulfi", unit: "Piece", price: 55, cost: 28, stock: 100, varType: "", varOpt: "" },
    { name: "Belgian Chocobar Dark Crunch", cat: "Kulfi & Sticks", brand: "ChocoStick", unit: "Piece", price: 60, cost: 32, stock: 110, varType: "", varOpt: "" },
    { name: "White Chocolate Almond Feast Stick", cat: "Kulfi & Sticks", brand: "ChocoStick", unit: "Piece", price: 75, cost: 40, stock: 95, varType: "", varOpt: "" },
    { name: "Tangy Orange Ice Lolly Stick", cat: "Kulfi & Sticks", brand: "ChocoStick", unit: "Piece", price: 30, cost: 14, stock: 150, varType: "", varOpt: "" },
    { name: "Tropical Mango Ice Bar Stick", cat: "Kulfi & Sticks", brand: "ChocoStick", unit: "Piece", price: 35, cost: 16, stock: 140, varType: "", varOpt: "" },
    { name: "Kala Khatta Tangy Popsicle", cat: "Kulfi & Sticks", brand: "ChocoStick", unit: "Piece", price: 30, cost: 14, stock: 130, varType: "", varOpt: "" },
    { name: "Cassata Slice Multi-Layered", cat: "Kulfi & Sticks", brand: "DesiKulfi", unit: "Slice", price: 80, cost: 42, stock: 70, varType: "", varOpt: "" },

    // Family Tubs & 1L Packs (Variations: 500ml, 1 Litre, 4 Litre Party Tub)
    { name: "Vanilla Classic Family Pack 500ml", cat: "Family Tubs & Packs", brand: "CreamHome", unit: "Tub", price: 140, cost: 85, stock: 60, varType: "Pack Volume", varOpt: "500ml" },
    { name: "Vanilla Classic Family Pack 1L", cat: "Family Tubs & Packs", brand: "CreamHome", unit: "Tub", price: 250, cost: 150, stock: 50, varType: "Pack Volume", varOpt: "1 Litre" },
    { name: "Chocolate Hazelnut Gourmet Tub 500ml", cat: "Family Tubs & Packs", brand: "CreamHome", unit: "Tub", price: 210, cost: 125, stock: 45, varType: "Pack Volume", varOpt: "500ml" },
    { name: "Chocolate Hazelnut Gourmet Tub 1L", cat: "Family Tubs & Packs", brand: "CreamHome", unit: "Tub", price: 380, cost: 230, stock: 40, varType: "Pack Volume", varOpt: "1 Litre" },
    { name: "Butterscotch Caramel Crunch Tub 500ml", cat: "Family Tubs & Packs", brand: "CreamHome", unit: "Tub", price: 160, cost: 95, stock: 55, varType: "Pack Volume", varOpt: "500ml" },
    { name: "Butterscotch Caramel Crunch Tub 1L", cat: "Family Tubs & Packs", brand: "CreamHome", unit: "Tub", price: 290, cost: 175, stock: 45, varType: "Pack Volume", varOpt: "1 Litre" },
    { name: "Alphonso Mango Gold Tub 1L", cat: "Family Tubs & Packs", brand: "CreamHome", unit: "Tub", price: 320, cost: 190, stock: 35, varType: "Pack Volume", varOpt: "1 Litre" },
    { name: "Blackcurrant Sensation Tub 1L", cat: "Family Tubs & Packs", brand: "CreamHome", unit: "Tub", price: 310, cost: 185, stock: 30, varType: "Pack Volume", varOpt: "1 Litre" },
    { name: "Kesar Pista Supreme Tub 1L", cat: "Family Tubs & Packs", brand: "CreamHome", unit: "Tub", price: 390, cost: 240, stock: 40, varType: "Pack Volume", varOpt: "1 Litre" },
    { name: "Strawberry Cheesecake Tub 500ml", cat: "Family Tubs & Packs", brand: "CreamHome", unit: "Tub", price: 220, cost: 130, stock: 35, varType: "Pack Volume", varOpt: "500ml" },

    // Ice Cream Cakes & Pastries
    { name: "Black Forest Ice Cream Cake 1kg", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Cake", price: 750, cost: 420, stock: 20, varType: "", varOpt: "" },
    { name: "Chocolate Truffle Ice Cream Cake 1kg", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Cake", price: 850, cost: 480, stock: 15, varType: "", varOpt: "" },
    { name: "Red Velvet Berry Ice Cream Cake 1kg", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Cake", price: 890, cost: 510, stock: 15, varType: "", varOpt: "" },
    { name: "Mango Mousse Ice Cream Cake 1kg", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Cake", price: 790, cost: 450, stock: 18, varType: "", varOpt: "" },
    { name: "Butterscotch Crunch Ice Cream Pastry", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Pastry", price: 110, cost: 60, stock: 30, varType: "", varOpt: "" },
    { name: "Dark Chocolate Mousse Pastry", cat: "Ice Cream Cakes", brand: "CakeCream", unit: "Pastry", price: 120, cost: 65, stock: 30, varType: "", varOpt: "" },

    // Toppings, Sauces & Add-ons
    { name: "Hot Chocolate Fudge Sauce Squeeze 250ml", cat: "Toppings & Sauces", brand: "Topper", unit: "Bottle", price: 95, cost: 50, stock: 60, varType: "", varOpt: "" },
    { name: "Gourmet Salted Caramel Drizzle 250ml", cat: "Toppings & Sauces", brand: "Topper", unit: "Bottle", price: 110, cost: 58, stock: 50, varType: "", varOpt: "" },
    { name: "Dark Choco Chips Crunchy 100g", cat: "Toppings & Sauces", brand: "Topper", unit: "Jar", price: 65, cost: 32, stock: 80, varType: "", varOpt: "" },
    { name: "Roasted Almond Flakes 100g", cat: "Toppings & Sauces", brand: "Topper", unit: "Jar", price: 90, cost: 48, stock: 70, varType: "", varOpt: "" },
    { name: "Rainbow Sugar Sprinkles Jar 100g", cat: "Toppings & Sauces", brand: "Topper", unit: "Jar", price: 50, cost: 22, stock: 90, varType: "", varOpt: "" },
    { name: "Crushed Oreo Crumbs 150g", cat: "Toppings & Sauces", brand: "Topper", unit: "Pouch", price: 55, cost: 28, stock: 85, varType: "", varOpt: "" },
    { name: "Crispy Waffle Cones 10 Pack", cat: "Toppings & Sauces", brand: "Topper", unit: "Box", price: 70, cost: 35, stock: 100, varType: "", varOpt: "" },
    { name: "Maraschino Red Cherries Jar 200g", cat: "Toppings & Sauces", brand: "Topper", unit: "Jar", price: 120, cost: 65, stock: 45, varType: "", varOpt: "" },
    { name: "Biscoff Crunchy Biscuit Spread 200g", cat: "Toppings & Sauces", brand: "Topper", unit: "Jar", price: 195, cost: 115, stock: 40, varType: "", varOpt: "" },
    { name: "Mini Marshmallows Cup 100g", cat: "Toppings & Sauces", brand: "Topper", unit: "Cup", price: 60, cost: 30, stock: 55, varType: "", varOpt: "" }
  ];

  iceCreamCatalog.forEach((item) => {
    const hasVar = Boolean(item.varType && item.varOpt);
    items.push({
      "Product Name": item.name,
      "Category": item.cat,
      "Brand": item.brand,
      "Unit": item.unit,
      "Selling Price": item.price,
      "Cost Price": item.cost,
      "Stock": item.stock,
      "Buffer Stock": Math.max(5, Math.floor(item.stock * 0.15)),
      "Barcode (Leave empty to auto-generate)": "",
      "Has Variations (TRUE/FALSE)": hasVar ? "TRUE" : "FALSE",
      "Variation Type": item.varType || "",
      "Variation Option": item.varOpt || "",
      "Status": "Active",
      "Image URL": ""
    });
  });

  // Ensure exactly 100 products
  while (items.length < 100) {
    const extraNum = items.length + 1;
    items.push({
      "Product Name": `Artisan Ice Cream Specialty Flavour #${extraNum}`,
      "Category": "Artisan Scoops",
      "Brand": "ScoopMaster",
      "Unit": "Scoop",
      "Selling Price": 125,
      "Cost Price": 72,
      "Stock": 50,
      "Buffer Stock": 8,
      "Barcode (Leave empty to auto-generate)": "",
      "Has Variations (TRUE/FALSE)": "FALSE",
      "Variation Type": "",
      "Variation Option": "",
      "Status": "Active",
      "Image URL": ""
    });
  }

  return items.slice(0, 100);
};

// Export to Excel trigger
export const downloadExcelTemplate = (type: "empty" | "supermarket" | "icecream") => {
  let data: BulkProductRow[] = [];
  let fileName = "";

  if (type === "empty") {
    data = EMPTY_TEMPLATE_ROWS;
    fileName = "retail_products_template.xlsx";
  } else if (type === "supermarket") {
    data = generateSupermarketProducts();
    fileName = "supermarket_products_300_items.xlsx";
  } else if (type === "icecream") {
    data = generateIceCreamProducts();
    fileName = "icecream_shop_products_100_items.xlsx";
  }

  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths
  const colWidths = [
    { wch: 35 }, // Product Name
    { wch: 24 }, // Category
    { wch: 18 }, // Brand
    { wch: 10 }, // Unit
    { wch: 14 }, // Selling Price
    { wch: 14 }, // Cost Price
    { wch: 10 }, // Stock
    { wch: 12 }, // Buffer Stock
    { wch: 22 }, // Barcode
    { wch: 18 }, // Has Variations
    { wch: 16 }, // Variation Type
    { wch: 18 }, // Variation Option
    { wch: 12 }, // Status
    { wch: 25 }, // Image URL
  ];
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products Catalog");

  XLSX.writeFile(wb, fileName);
};
