/**
 * Local seed data for the onboarding "Build Your Menu" flow.
 * Mirrors the future SeedMenuItem API contract (see agentdump/seed-menu-items-api-request.md)
 * so the sample-menu experience works until the backend endpoints land.
 */

export interface MenuCategorySeed {
  key: string;
  label: string;
}

export interface SampleMenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  available?: boolean;
}

/** Dish categories served at a restaurant (multi-select). */
export const MENU_CATEGORIES: MenuCategorySeed[] = [
  { key: "african", label: "African" },
  { key: "continental", label: "Continental" },
  { key: "nigerian", label: "Nigerian" },
  { key: "main-course", label: "Main Course" },
  { key: "starters", label: "Starters / Small Chops" },
  { key: "small-chops", label: "Small Chops" },
  { key: "rice-dishes", label: "Rice Dishes" },
  { key: "swallow", label: "Swallow (Pounded Yam, Eba…)" },
  { key: "soups-stews", label: "Soups & Stews" },
  { key: "grill", label: "Grill & Barbecue" },
  { key: "fast-food", label: "Fast Food" },
  { key: "italian", label: "Italian" },
  { key: "pasta", label: "Pasta" },
  { key: "pizza", label: "Pizza" },
  { key: "chinese", label: "Chinese" },
  { key: "asian", label: "Asian" },
  { key: "japanese", label: "Japanese" },
  { key: "sushi", label: "Sushi" },
  { key: "mexican", label: "Mexican" },
  { key: "tacos", label: "Tacos & Burritos" },
  { key: "indian", label: "Indian" },
  { key: "french", label: "French" },
  { key: "mediterranean", label: "Mediterranean" },
  { key: "seafood", label: "Seafood" },
  { key: "burgers", label: "Burgers & Sandwiches" },
  { key: "breakfast", label: "Breakfast" },
  { key: "pastries", label: "Pastries & Bakery" },
  { key: "desserts", label: "Desserts" },
  { key: "drinks", label: "Drinks & Beverages" },
  { key: "juice", label: "Juices & Smoothies" },
];

/** Ready-made dishes for the "Use Sample Menu" path. */
export const SAMPLE_MENU: SampleMenuItem[] = [
  // --- Starters / Small Chops ---
  {
    name: "Peppered Gizzard",
    description: "Grilled gizzard tossed in spicy pepper sauce with onions.",
    price: 2500,
    category: "Small Chops",
  },
  {
    name: "Chicken Spring Rolls",
    description: "Crispy rolls stuffed with shredded chicken and vegetables.",
    price: 2000,
    category: "Starters / Small Chops",
  },
  {
    name: "Meat Pie",
    description: "Flaky pastry filled with seasoned minced meat and potato.",
    price: 1200,
    category: "Pastries & Bakery",
  },

  // --- Nigerian / Rice / Swallow ---
  {
    name: "Jollof Rice & Grilled Chicken",
    description: "Smoky party jollof rice served with grilled chicken.",
    price: 4500,
    category: "Rice Dishes",
  },
  {
    name: "Fried Rice & Turkey",
    description: "Nigerian fried rice with mixed veggies and fried turkey.",
    price: 5000,
    category: "Rice Dishes",
  },
  {
    name: "Pounded Yam & Egusi Soup",
    description: "Smooth pounded yam with rich melon-seed egusi soup.",
    price: 4000,
    category: "Swallow (Pounded Yam, Eba…)",
  },
  {
    name: "Eba & Okra Soup",
    description: "Garri swallow served with hearty okra soup and assorted meat.",
    price: 3500,
    category: "Swallow (Pounded Yam, Eba…)",
  },
  {
    name: "Amala & Gbegiri with Ewedu",
    description: "Soft amala with beans soup and jute leaves, plus assorted beef.",
    price: 3800,
    category: "Swallow (Pounded Yam, Eba…)",
  },
  {
    name: "Ofada Rice & Ayamase",
    description: "Local ofada rice with spicy green pepper ayamase sauce.",
    price: 4200,
    category: "Nigerian",
  },
  {
    name: "Native Jollof (Iresi Eyin)",
    description: "Palm-oil native jollof rice served with fried fish.",
    price: 4000,
    category: "Nigerian",
  },

  // --- Grill ---
  {
    name: "Peppered Fish (Croaker)",
    description: "Whole croaker fish, fried and glazed in spicy pepper sauce.",
    price: 6500,
    category: "Grill & Barbecue",
  },
  {
    name: "Grilled Chicken Wings",
    description: "Sticky barbecue-glazed chicken wings with peri-peri rub.",
    price: 3500,
    category: "Grill & Barbecue",
  },
  {
    name: "Suya (Beef Skewers)",
    description: "Classic Nigerian spiced beef suya with onions and yaji.",
    price: 2500,
    category: "Grill & Barbecue",
  },

  // --- Seafood ---
  {
    name: "Grilled Prawns",
    description: "Charred king prawns in garlic herb butter.",
    price: 6000,
    category: "Seafood",
  },
  {
    name: "Creamy Seafood Pasta",
    description: "Fettuccine in a rich cream sauce with prawns and calamari.",
    price: 7500,
    category: "Seafood",
  },

  // --- Continental / Italian ---
  {
    name: "Margherita Pizza",
    description: "San Marzano tomato, fresh mozzarella and basil.",
    price: 8000,
    category: "Pizza",
  },
  {
    name: "Pepperoni Pizza",
    description: "Classic pepperoni with mozzarella on a hand-tossed base.",
    price: 9500,
    category: "Pizza",
  },
  {
    name: "Spaghetti Carbonara",
    description: "Pancetta, egg yolk and pecorino over spaghetti.",
    price: 7000,
    category: "Pasta",
  },
  {
    name: "Creamy Alfredo Pasta",
    description: "Fettuccine alfredo with grilled chicken and parmesan.",
    price: 7200,
    category: "Pasta",
  },
  {
    name: "Beef Lasagna",
    description: "Layered pasta with slow-cooked beef ragù and béchamel.",
    price: 7800,
    category: "Italian",
  },

  // --- Burgers / Fast food ---
  {
    name: "Classic Cheeseburger",
    description: "Beef patty, cheddar, lettuce, tomato and house sauce.",
    price: 5500,
    category: "Burgers & Sandwiches",
  },
  {
    name: "Crispy Chicken Burger",
    description: "Buttermilk fried chicken, slaw and spicy mayo.",
    price: 6000,
    category: "Burgers & Sandwiches",
  },
  {
    name: "Loaded Fries",
    description: "Crispy fries topped with cheese sauce and beef chunks.",
    price: 3500,
    category: "Fast Food",
  },

  // --- Breakfast ---
  {
    name: "Full English Breakfast",
    description: "Eggs, bacon, sausage, baked beans, toast and grilled tomato.",
    price: 6500,
    category: "Breakfast",
  },
  {
    name: "Akara & Pap",
    description: "Bean cakes with soft custard-style ogi (pap).",
    price: 1800,
    category: "Breakfast",
  },

  // --- Desserts / Drinks ---
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten centre and vanilla ice cream.",
    price: 4000,
    category: "Desserts",
  },
  {
    name: "Chin Chin Sundae",
    description: "Crunchy chin chin over vanilla soft-serve with caramel.",
    price: 2500,
    category: "Desserts",
  },
  {
    name: "Chapman",
    description: "The classic Nigerian mocktail — citrus, grenadine and bitters.",
    price: 2000,
    category: "Drinks & Beverages",
  },
  {
    name: "Zobo",
    description: "Chilled hibiscus drink infused with pineapple and ginger.",
    price: 1000,
    category: "Drinks & Beverages",
  },
  {
    name: "Tropical Smoothie",
    description: "Mango, pineapple and banana blended with yogurt.",
    price: 3000,
    category: "Juices & Smoothies",
  },
];
