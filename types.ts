export type ProductType = 'donita' | 'pastel' | 'cupcake';

export interface User {
  id: string; // Corresponds to Firebase Auth UID
  role: 'client' | 'admin';
  name: string;
  email: string;
  password?: string; // Only used for creation, not stored in Firestore
  birthday: string;
  phone: string;
  address: string;
  lastBirthdayNotifiedYear?: number;
  likedImages?: string[];
}

export interface Ingredient {
  id:string;
  name: string;
  type: 'base' | 'filling' | 'topping' | 'frosting' | 'decoration' | 'materia_prima';
  price: number;
  productTypes?: ProductType[];
  servingSize?: number; // Amount used per application (e.g., 10g of sprinkles)
}

export interface InventoryItem extends Ingredient {
  quantity: number;
  lowStockThreshold: number;
  imageUrl?: string;
  cost: number;
  unit: 'gr' | 'ml' | 'unidad';
  packageSize: number; // e.g., 1000 for 1kg/1L, or 1 for a single unit
}

// Represents a single ingredient within a larger product recipe
export interface RecipeIngredient {
  ingredientId: string; // Corresponds to InventoryItem.id
  amount: number;
}

// Represents a final product recipe with its ingredients and pricing calculation
export interface ProductRecipe {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  productType: ProductType;
  ingredients: RecipeIngredient[];
  overheadCost: number; // Other costs like packaging, electricity
  profitMargin: number; // In percentage (e.g., 100 for 100%)
  totalCost?: number; // Calculated field: (sum of ingredient costs) + overheadCost
  suggestedPrice?: number; // Calculated field: totalCost * (1 + profitMargin / 100)
  sellingPrice: number; // Final price set by admin
  recipeYield: number; // Number of units this recipe produces
  costPerUnit?: number; // Calculated field: totalCost / recipeYield
}


export interface CustomDessert {
  id: string;
  name: string;
  isCustom: true;
  base: Ingredient;
  filling: Ingredient | null;
  frosting: Ingredient | null;
  toppings: Ingredient[];
  decorations: Ingredient[];
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: (CustomDessert | BasicProduct)[];
  total: number;
  orderDate: Date;
  status: 'pending' | 'confirmed' | 'in_progress' | 'ready';
  estimatedTime?: string;
  paymentMethod: 'transfer' | 'cash';
  deliveryMethod: 'pickup' | 'delivery';
}

export interface BasicProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    isCustom: false;
    productType: ProductType;
    recipeId?: string; // Link to the recipe
    quantity: number;
}

export interface Financials {
  revenue: number;
  investment: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
}

// Represents the structure of the settings document in Firestore
export interface AppSettings {
    adminPhoneNumber: string;
    adminCardNumber: string;
    birthdayOffer: { description: string };
    deliveryFee: number;
}