export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // In a real app, never store plain text passwords
  birthday: string;
  phone: string;
  address: string;
  lastBirthdayNotifiedYear?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  type: 'base' | 'filling' | 'topping' | 'frosting' | 'decoration';
  price: number;
}

export interface InventoryItem extends Ingredient {
  quantity: number;
  lowStockThreshold: number;
  imageUrl?: string;
}

export interface CustomDessert {
  id: string;
  name: string;
  isCustom: true;
  base: Ingredient;
  filling: Ingredient | null;
  frosting: Ingredient;
  toppings: Ingredient[];
  decorations: Ingredient[];
  price: number;
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
    isCustom: false;
}

export interface Financials {
  revenue: number;
  investment: number;
}