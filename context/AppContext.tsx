import React, { createContext, useReducer, Dispatch, ReactNode } from 'react';
import { User, Order, Financials, InventoryItem, CustomDessert, BasicProduct } from '../types';
import { INITIAL_INVENTORY, INITIAL_FINANCIALS, USERS_DATA, ADMIN_PASSWORD as CONST_ADMIN_PASSWORD, ADMIN_PHONE_NUMBER, ADMIN_CARD_NUMBER as CONST_ADMIN_CARD_NUMBER } from '../constants';

export enum View {
  LANDING,
  ADMIN_LOGIN,
  ADMIN_DASHBOARD,
  CLIENT_LOGIN,
  CLIENT_REGISTER,
  CLIENT_SHOP,
  CLIENT_PROFILE,
  CLIENT_CART,
}

interface AppState {
  currentView: View;
  users: User[];
  currentUser: User | null;
  orders: Order[];
  financials: Financials;
  inventory: InventoryItem[];
  shoppingCart: (CustomDessert | BasicProduct)[];
  adminPassword: string;
  adminPhoneNumber: string;
  adminCardNumber: string;
  notification: { message: string; type: 'success' | 'error' } | null;
  birthdayOffer: { description: string };
  deliveryFee: number;
}

// Function to load initial state, prioritizing localStorage
const getInitialState = (): AppState => {
  const savedInventoryJSON = localStorage.getItem('miniDonutsBettyInventory');
  const inventoryFromStorage = savedInventoryJSON ? JSON.parse(savedInventoryJSON) : INITIAL_INVENTORY;

  const savedUsersJSON = localStorage.getItem('miniDonutsBettyUsers');
  const usersFromStorage = savedUsersJSON ? JSON.parse(savedUsersJSON) : USERS_DATA;

  return {
    currentView: View.LANDING,
    users: usersFromStorage,
    currentUser: null,
    orders: [],
    financials: INITIAL_FINANCIALS,
    inventory: inventoryFromStorage,
    shoppingCart: [],
    adminPassword: CONST_ADMIN_PASSWORD,
    adminPhoneNumber: ADMIN_PHONE_NUMBER,
    adminCardNumber: CONST_ADMIN_CARD_NUMBER,
    notification: null,
    birthdayOffer: { description: '¡Disfruta de un 15% de descuento en tu postre personalizado!' },
    deliveryFee: 3.50, // Default delivery fee
  };
};

const initialState: AppState = getInitialState();

type Action =
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'REGISTER_USER'; payload: Omit<User, 'id'> }
  | { type: 'LOGIN_USER'; payload: { email: string; passwordHash: string } }
  | { type: 'LOGOUT_USER' }
  | { type: 'ADD_TO_CART'; payload: CustomDessert | BasicProduct }
  | { type: 'PLACE_ORDER'; payload: { paymentMethod: 'transfer' | 'cash'; deliveryMethod: 'pickup' | 'delivery' } }
  | { type: 'UPDATE_ADMIN_PASSWORD'; payload: { currentPassword: string, newPassword: string } }
  | { type: 'UPDATE_ADMIN_PHONE'; payload: { newPhone: string, password: string } }
  | { type: 'ADD_INVENTORY_ITEM'; payload: Omit<InventoryItem, 'id'> }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: { itemId: string } }
  | { type: 'SET_NOTIFICATION'; payload: { message: string; type: 'success' | 'error' } | null }
  | { type: 'UPDATE_ORDER_ESTIMATE'; payload: { orderId: string, estimatedTime: string } }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'UPDATE_BIRTHDAY_OFFER'; payload: string }
  | { type: 'UPDATE_DELIVERY_FEE'; payload: number }
  | { type: 'UPDATE_ADMIN_CARD_NUMBER'; payload: string }
  | { type: 'MARK_BIRTHDAY_NOTIFIED'; payload: { userId: string; year: number } };


const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'REGISTER_USER': {
      const newUser: User = { ...action.payload, id: `user-${Date.now()}` };
      const updatedUsers = [...state.users, newUser];
      localStorage.setItem('miniDonutsBettyUsers', JSON.stringify(updatedUsers));
      return { ...state, users: updatedUsers, currentUser: newUser, currentView: View.CLIENT_SHOP, notification: {message: '¡Registro exitoso!', type: 'success'} };
    }
    case 'LOGIN_USER': {
      const user = state.users.find(u => u.email === action.payload.email && u.passwordHash === action.payload.passwordHash);
      if (user) {
        return { ...state, currentUser: user, currentView: View.CLIENT_SHOP, notification: {message: '¡Bienvenido de nuevo!', type: 'success'} };
      }
      return { ...state, notification: {message: 'Correo o contraseña incorrectos.', type: 'error'} };
    }
    case 'LOGOUT_USER':
      return { ...state, currentUser: null, currentView: View.LANDING, shoppingCart: [] };
    case 'ADD_TO_CART':
      return { ...state, shoppingCart: [...state.shoppingCart, action.payload], notification: {message: '¡Añadido al carrito!', type: 'success'} };
    case 'PLACE_ORDER': {
      if (!state.currentUser || state.shoppingCart.length === 0) return state;
      
      const subtotal = state.shoppingCart.reduce((sum, item) => sum + item.price, 0);
      const deliveryCost = action.payload.deliveryMethod === 'delivery' ? state.deliveryFee : 0;
      const total = subtotal + deliveryCost;

      const newOrder: Order = {
        id: `order-${Date.now()}`,
        userId: state.currentUser.id,
        items: state.shoppingCart,
        total,
        orderDate: new Date(),
        status: 'pending',
        paymentMethod: action.payload.paymentMethod,
        deliveryMethod: action.payload.deliveryMethod,
      };
      
      const newInventory = [...state.inventory];
      if(newInventory.length > 0) {
        const randomIndex = Math.floor(Math.random() * newInventory.length);
        if(newInventory[randomIndex].quantity > 0) {
            newInventory[randomIndex] = { ...newInventory[randomIndex], quantity: newInventory[randomIndex].quantity - 1 };
        }
      }
      localStorage.setItem('miniDonutsBettyInventory', JSON.stringify(newInventory));

      return {
        ...state,
        orders: [...state.orders, newOrder],
        shoppingCart: [],
        financials: { ...state.financials, revenue: state.financials.revenue + total },
        inventory: newInventory,
        currentView: View.CLIENT_PROFILE,
        notification: {message: '¡Pedido enviado para confirmación!', type: 'success'},
      };
    }
    case 'UPDATE_ADMIN_PASSWORD': {
        if (action.payload.currentPassword !== state.adminPassword) {
            return { ...state, notification: { message: 'La contraseña actual es incorrecta.', type: 'error' } };
        }
        return { ...state, adminPassword: action.payload.newPassword, notification: { message: '¡Contraseña de administrador actualizada!', type: 'success' } };
    }
    case 'UPDATE_ADMIN_PHONE': {
        if (action.payload.password !== state.adminPassword) {
            return { ...state, notification: { message: 'La contraseña de administrador es incorrecta.', type: 'error' } };
        }
        return { ...state, adminPhoneNumber: action.payload.newPhone, notification: { message: '¡Número de teléfono actualizado con éxito!', type: 'success' } };
    }
    case 'ADD_INVENTORY_ITEM': {
        const newItem: InventoryItem = { ...action.payload, id: `item-${Date.now()}` };
        const newInventory = [...state.inventory, newItem];
        localStorage.setItem('miniDonutsBettyInventory', JSON.stringify(newInventory));
        return {
            ...state,
            inventory: newInventory,
            notification: { message: '¡Producto añadido con éxito!', type: 'success' },
        };
    }
    case 'UPDATE_INVENTORY_ITEM': {
      const newInventory = state.inventory.map(item =>
        item.id === action.payload.id ? action.payload : item
      );
      localStorage.setItem('miniDonutsBettyInventory', JSON.stringify(newInventory));
      return {
        ...state,
        inventory: newInventory,
        notification: { message: '¡Producto actualizado con éxito!', type: 'success' },
      };
    }
    case 'DELETE_INVENTORY_ITEM': {
      const newInventory = state.inventory.filter(item => item.id !== action.payload.itemId);
      localStorage.setItem('miniDonutsBettyInventory', JSON.stringify(newInventory));
      return {
        ...state,
        inventory: newInventory,
        notification: { message: '¡Producto eliminado con éxito!', type: 'success' },
      };
    }
    case 'UPDATE_ORDER_ESTIMATE': {
      return {
          ...state,
          orders: state.orders.map(order =>
              order.id === action.payload.orderId
              ? { ...order, status: 'confirmed', estimatedTime: action.payload.estimatedTime }
              : order
          ),
          notification: { message: '¡Tiempo de entrega enviado al cliente!', type: 'success' },
      }
    }
     case 'UPDATE_ORDER_STATUS': {
        return {
            ...state,
            orders: state.orders.map(order =>
                order.id === action.payload.orderId
                ? { ...order, status: action.payload.status }
                : order
            ),
            notification: { message: `¡Estado del pedido actualizado a: ${action.payload.status}!`, type: 'success' },
        }
    }
    case 'UPDATE_BIRTHDAY_OFFER':
        return {
            ...state,
            birthdayOffer: { description: action.payload },
            notification: { message: '¡Oferta de cumpleaños actualizada!', type: 'success' },
        };
     case 'UPDATE_DELIVERY_FEE':
        return {
            ...state,
            deliveryFee: action.payload,
            notification: { message: '¡Tarifa de envío actualizada!', type: 'success' },
        };
     case 'UPDATE_ADMIN_CARD_NUMBER':
        return {
            ...state,
            adminCardNumber: action.payload,
            notification: { message: '¡Número de tarjeta actualizado!', type: 'success' },
        };
    case 'MARK_BIRTHDAY_NOTIFIED': {
        const updatedUsers = state.users.map(user => 
            user.id === action.payload.userId 
            ? { ...user, lastBirthdayNotifiedYear: action.payload.year } 
            : user
        );
        localStorage.setItem('miniDonutsBettyUsers', JSON.stringify(updatedUsers));
        return {
            ...state,
            users: updatedUsers,
            currentUser: state.currentUser?.id === action.payload.userId
                ? { ...state.currentUser, lastBirthdayNotifiedYear: action.payload.year }
                : state.currentUser,
        };
    }
    case 'SET_NOTIFICATION':
        return { ...state, notification: action.payload };
    default:
      return state;
  }
};

export const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};