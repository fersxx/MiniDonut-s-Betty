import { InventoryItem, Financials, User } from './types';

export const ADMIN_PASSWORD = "fer123";
export const ADMIN_PHONE_NUMBER = "5216361317125"; // Número al que se envían los pedidos
export const ADMIN_CARD_NUMBER = "1234-5678-9012-3456";

export const INITIAL_INVENTORY: InventoryItem[] = [
  // Bases
  { id: 'b1', name: 'Bizcocho de Vainilla', type: 'base', price: 5, quantity: 20, lowStockThreshold: 5 },
  { id: 'b2', name: 'Bizcocho de Chocolate', type: 'base', price: 6, quantity: 18, lowStockThreshold: 5 },
  { id: 'b3', name: 'Base de Galleta', type: 'base', price: 4, quantity: 30, lowStockThreshold: 10 },
  // Fillings
  { id: 'f1', name: 'Crema Pastelera', type: 'filling', price: 2, quantity: 50, lowStockThreshold: 10 },
  { id: 'f2', name: 'Mermelada de Fresa', type: 'filling', price: 2.5, quantity: 40, lowStockThreshold: 10 },
  { id: 'f3', name: 'Ganache de Chocolate', type: 'filling', price: 3, quantity: 35, lowStockThreshold: 8 },
  // Frostings
  { id: 'fr1', name: 'Buttercream de Vainilla', type: 'frosting', price: 3, quantity: 40, lowStockThreshold: 10 },
  { id: 'fr2', name: 'Crema Batida', type: 'frosting', price: 2.5, quantity: 60, lowStockThreshold: 15 },
  { id: 'fr3', name: 'Glaseado de Chocolate', type: 'frosting', price: 3.5, quantity: 30, lowStockThreshold: 8 },
  // Toppings
  { id: 't1', name: 'Chispas de Chocolate', type: 'topping', price: 1, quantity: 100, lowStockThreshold: 20 },
  { id: 't2', name: 'Nueces Picadas', type: 'topping', price: 1.5, quantity: 80, lowStockThreshold: 20 },
  { id: 't3', name: 'Fresas Frescas', type: 'topping', price: 2, quantity: 25, lowStockThreshold: 10 },
  // Decorations
  { id: 'd1', name: 'Flores de Azúcar', type: 'decoration', price: 2.5, quantity: 50, lowStockThreshold: 10 },
  { id: 'd2', name: 'Velas de Cumpleaños', type: 'decoration', price: 0.5, quantity: 200, lowStockThreshold: 50 },
  { id: 'd3', name: 'Figuras de Fondant', type: 'decoration', price: 4, quantity: 30, lowStockThreshold: 5 },
];

export const INITIAL_FINANCIALS: Financials = {
  revenue: 1500,
  investment: 800,
};

// Mock user data
export const USERS_DATA: User[] = [
    {
        id: 'user-1',
        name: 'Ana García',
        email: 'ana@example.com',
        passwordHash: 'pass123',
        birthday: '1995-05-20',
        phone: '6361001122',
        address: 'Calle Falsa 123, Ciudad',
        lastBirthdayNotifiedYear: 2023,
    }
];