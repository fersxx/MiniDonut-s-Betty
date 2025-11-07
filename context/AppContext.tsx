
import React, { createContext, useReducer, Dispatch, ReactNode, useEffect, useRef } from 'react';
import { User, Order, Financials, InventoryItem, CustomDessert, BasicProduct, Offer, GalleryImage, ProductRecipe, AppSettings } from '../types';
import * as FirestoreService from '../firebase/firestore';

export enum View {
  LANDING,
  ADMIN_DASHBOARD,
  CLIENT_LOGIN,
  CLIENT_REGISTER,
  CLIENT_SHOP,
  CLIENT_PROFILE,
  CLIENT_CART,
  CLIENT_OFFERS,
  CLIENT_GALLERY,
}

interface AppState {
  isLoading: boolean;
  currentView: View;
  users: User[];
  currentUser: User | null;
  orders: Order[];
  financials: Financials;
  inventory: InventoryItem[];
  shoppingCart: (CustomDessert | BasicProduct)[];
  notification: { message: string; type: 'success' | 'error' } | null;
  settings: AppSettings;
  offers: Offer[];
  gallery: GalleryImage[];
  productRecipes: ProductRecipe[];
  basicProducts: BasicProduct[];
}

const initialState: AppState = {
    isLoading: true,
    currentView: View.LANDING,
    users: [],
    currentUser: null,
    orders: [],
    financials: { revenue: 0, investment: 0 },
    inventory: [],
    shoppingCart: [],
    notification: null,
    settings: {
        adminPhoneNumber: "",
        adminCardNumber: "",
        birthdayOffer: { description: '' },
        deliveryFee: 0,
    },
    offers: [],
    gallery: [],
    productRecipes: [],
    basicProducts: [],
};

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'SET_NOTIFICATION'; payload: { message: string; type: 'success' | 'error' } | null }
  | { type: 'ADD_TO_CART'; payload: CustomDessert | BasicProduct }
  | { type: 'CLEAR_CART' }
  | { type: 'REGISTER_USER'; payload: any }
  | { type: 'LOGIN_USER'; payload: { email: string; password: string } }
  | { type: 'LOGIN_ADMIN'; payload: string }
  | { type: 'LOGOUT_USER' }
  | { type: 'UPDATE_USER_PROFILE'; payload: { id: string; data: Partial<User> } }
  | { type: 'UPDATE_USER_PASSWORD'; payload: { id: string; newPassword: string } }
  | { type: 'MARK_BIRTHDAY_NOTIFIED'; payload: { userId: string, year: number } }
  | { type: 'SAVE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: string }
  | { type: 'SAVE_OFFER'; payload: Offer }
  | { type: 'DELETE_OFFER'; payload: string }
  | { type: 'SAVE_RECIPE'; payload: ProductRecipe }
  | { type: 'DELETE_RECIPE'; payload: string }
  | { type: 'ADD_GALLERY_IMAGE'; payload: Omit<GalleryImage, 'id' | 'likes'> }
  | { type: 'DELETE_GALLERY_IMAGE'; payload: string }
  | { type: 'TOGGLE_GALLERY_LIKE'; payload: { imageId: string; userId: string } }
  | { type: 'SAVE_SETTINGS'; payload: AppSettings }
  | { type: 'PLACE_ORDER'; payload: Omit<Order, 'id'> }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status']; estimatedTime?: string } }
  | { type: 'REORDER'; payload: (CustomDessert | BasicProduct)[] }
  | { type: 'SYNC_USERS'; payload: User[] }
  | { type: 'SYNC_INVENTORY'; payload: InventoryItem[] }
  | { type: 'SYNC_ORDERS'; payload: Order[] }
  | { type: 'SYNC_OFFERS'; payload: Offer[] }
  | { type: 'SYNC_RECIPES'; payload: ProductRecipe[] }
  | { type: 'SYNC_GALLERY'; payload: GalleryImage[] }
  | { type: 'SYNC_SETTINGS'; payload: AppSettings };


const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SYNC_USERS': {
      // Si el usuario actual existe en la nueva lista de usuarios, actualízalo
      const updatedCurrentUser = state.currentUser ? action.payload.find(u => u.id === state.currentUser?.id) || null : state.currentUser;
      return { ...state, users: action.payload, currentUser: updatedCurrentUser };
    }
    case 'SYNC_INVENTORY': {
      const inventory = action.payload;
      const investment = inventory.reduce((sum, item) => sum + (item.cost * (item.quantity / (item.packageSize || 1))), 0); // Costo aprox del inventario actual
      return { ...state, inventory, financials: { ...state.financials, investment } };
    }
    case 'SYNC_ORDERS': {
       const orders = action.payload;
       const revenue = orders.reduce((sum, order) => sum + order.total, 0);
       return { ...state, orders, financials: { ...state.financials, revenue } };
    }
    case 'SYNC_OFFERS':
      return { ...state, offers: action.payload };
    case 'SYNC_RECIPES': {
        const recipes = action.payload;
        const basicProducts = recipes.map((r: ProductRecipe) => ({
            id: `prod-${r.id}`,
            recipeId: r.id,
            name: r.name,
            description: r.description,
            price: r.sellingPrice,
            imageUrl: r.imageUrl,
            isCustom: false as const,
            productType: r.productType,
            quantity: 1,
        }));
        return { ...state, productRecipes: recipes, basicProducts };
    }
    case 'SYNC_GALLERY':
      return { ...state, gallery: action.payload };
    case 'SYNC_SETTINGS':
      return { ...state, settings: action.payload };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload, notification: null };
    case 'SET_NOTIFICATION':
        return { ...state, notification: action.payload };
    case 'LOGOUT_USER':
        return { ...state, currentUser: null, currentView: View.LANDING, shoppingCart: [] };
    case 'LOGIN_USER': {
        const { email, password } = action.payload;
        const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            const nextView = user.role === 'admin' ? View.ADMIN_DASHBOARD : View.CLIENT_SHOP;
            return { ...state, currentUser: user, currentView: nextView, notification: null };
        }
        return { ...state, notification: { message: 'Correo o contraseña incorrectos.', type: 'error' } };
    }
    case 'LOGIN_ADMIN': {
        const password = action.payload;
        // Buscar administrador en la BD
        const adminUser = state.users.find(u => u.role === 'admin');
        const adminPassword = adminUser ? adminUser.password : 'fer123'; // Contraseña por defecto solo si no hay admin
        
        if (password === adminPassword) {
            const currentUser = adminUser || {
                 id: 'temp-admin',
                 role: 'admin',
                 name: 'Administrador',
                 email: 'admin@minidonuts.com',
                 password: 'fer123',
                 birthday: '',
                 phone: '',
                 address: '',
                 likedImages: []
            };
            return { ...state, currentUser, currentView: View.ADMIN_DASHBOARD, notification: null };
        }
        return { ...state, notification: { message: 'Contraseña de administrador incorrecta.', type: 'error' } };
    }
    case 'ADD_TO_CART': {
      const newItem = action.payload;
      let updatedCart = [...state.shoppingCart];
      
      if (newItem.isCustom) {
          // Lógica para items personalizados
          const customItem = newItem as CustomDessert;
          // Crear clave única basada en ingredientes
          const getCustomDessertKey = (dessert: CustomDessert) => {
              const ids = [dessert.base.id, dessert.filling?.id, dessert.frosting?.id, ...dessert.toppings.map(t => t.id), ...dessert.decorations.map(d => d.id)].filter(Boolean).sort();
              return ids.join('-');
          };
          const newItemKey = getCustomDessertKey(customItem);
          const existingIndex = updatedCart.findIndex(item => item.isCustom && getCustomDessertKey(item as CustomDessert) === newItemKey);
          
          if (existingIndex > -1) {
              updatedCart[existingIndex] = { ...updatedCart[existingIndex], quantity: updatedCart[existingIndex].quantity + newItem.quantity };
          } else {
              updatedCart.push(newItem);
          }
      } else {
          // Lógica para productos básicos
          const basicItem = newItem as BasicProduct;
          const existingIndex = updatedCart.findIndex(item => !item.isCustom && item.id === basicItem.id);
          if (existingIndex > -1) {
              updatedCart[existingIndex] = { ...updatedCart[existingIndex], quantity: updatedCart[existingIndex].quantity + newItem.quantity };
          } else {
              updatedCart.push(newItem);
          }
      }
      return { ...state, shoppingCart: updatedCart, notification: { message: '¡Añadido al carrito!', type: 'success' } };
    }
    case 'CLEAR_CART':
        return { ...state, shoppingCart: [] };
    case 'PLACE_ORDER':
        return { ...state, shoppingCart: [], currentView: View.CLIENT_PROFILE, notification: { message: '¡Pedido realizado!', type: 'success' } };
    case 'REORDER':
        return { ...state, shoppingCart: action.payload, currentView: View.CLIENT_CART, notification: { message: '¡Pedido añadido al carrito!', type: 'success' } };
    
    // Para acciones asíncronas, actualizamos el estado local solo si es necesario inmediatamente (optimistic update)
    case 'REGISTER_USER':
        // El nuevo usuario vendrá por el listener de 'SYNC_USERS'
        // Temporalmente lo establecemos para mejorar la UI inmediata
        return { ...state, currentUser: action.payload, currentView: View.CLIENT_SHOP, notification: { message: '¡Bienvenido!', type: 'success' } };
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
  const stateRef = useRef(state); // Referencia para acceder al estado actual en async functions

  useEffect(() => {
      stateRef.current = state;
  }, [state]);
  
  // Configurar listeners de Firestore al montar el componente
  useEffect(() => {
      const unsubscribers: (() => void)[] = [];

      unsubscribers.push(FirestoreService.listenToCollection<User>('users', (data) => {
          dispatch({ type: 'SYNC_USERS', payload: data });
      }));
      
      unsubscribers.push(FirestoreService.listenToCollection<InventoryItem>('inventory', (data) => {
          dispatch({ type: 'SYNC_INVENTORY', payload: data });
      }));
      
      unsubscribers.push(FirestoreService.listenToCollection<Order>('orders', (data) => {
          // Convertir fechas si vienen como Timestamp (ya manejado en listenToCollection, pero doble check)
          dispatch({ type: 'SYNC_ORDERS', payload: data });
      }));

      unsubscribers.push(FirestoreService.listenToCollection<Offer>('offers', (data) => {
          dispatch({ type: 'SYNC_OFFERS', payload: data });
      }));

      unsubscribers.push(FirestoreService.listenToCollection<ProductRecipe>('productRecipes', (data) => {
          dispatch({ type: 'SYNC_RECIPES', payload: data });
      }));

      unsubscribers.push(FirestoreService.listenToCollection<GalleryImage>('gallery', (data) => {
          dispatch({ type: 'SYNC_GALLERY', payload: data });
      }));
      
      unsubscribers.push(FirestoreService.listenToSettings((data) => {
          dispatch({ type: 'SYNC_SETTINGS', payload: data });
          dispatch({ type: 'SET_LOADING', payload: false }); // Carga inicial completa
      }));

      return () => {
          unsubscribers.forEach(unsub => unsub());
      };
  }, []);

  // Middleware asíncrono para el dispatch
  const asyncDispatch: Dispatch<Action> = async (action) => {
      try {
          switch (action.type) {
              case 'REGISTER_USER': {
                 const formData = action.payload;
                 if (stateRef.current.users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
                    dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'Este correo electrónico ya está registrado.', type: 'error' } });
                    return;
                 }
                 const newUser: User = {
                    id: `user-${Date.now()}`,
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    birthday: formData.birthday,
                    phone: formData.phone,
                    address: formData.address,
                    role: 'client',
                    likedImages: [],
                 };
                 await FirestoreService.addOrUpdateUser(newUser);
                 // Notificar éxito localmente (el listener actualizará la lista global)
                 dispatch({ type: 'REGISTER_USER', payload: newUser });
                 break;
              }
              case 'PLACE_ORDER':
                  const orderData = action.payload;
                  await FirestoreService.createOrder(orderData as Order);
                  // Reducir stock aquí (lógica simplificada en cliente)
                  for (const item of orderData.items) {
                      if (item.isCustom) {
                         // Reducir base, frosting, toppings...
                         const addons = [item.base, item.filling, item.frosting, ...item.toppings, ...item.decorations].filter(Boolean);
                         for (const addon of addons) {
                             const invItem = stateRef.current.inventory.find(i => i.id === addon!.id);
                             if (invItem) {
                                 await FirestoreService.addOrUpdateInventoryItem({
                                     ...invItem,
                                     quantity: Math.max(0, invItem.quantity - item.quantity)
                                 });
                             }
                         }
                      } else {
                          // Reducir ingredientes de la receta
                          const basicProd = item as BasicProduct;
                          if (basicProd.recipeId) {
                              const recipe = stateRef.current.productRecipes.find(r => r.id === basicProd.recipeId);
                              if (recipe && recipe.recipeYield) {
                                  for (const ing of recipe.ingredients) {
                                      const invItem = stateRef.current.inventory.find(i => i.id === ing.ingredientId);
                                      if (invItem) {
                                          const deduction = (ing.amount / recipe.recipeYield) * item.quantity;
                                          await FirestoreService.addOrUpdateInventoryItem({
                                              ...invItem,
                                              quantity: Math.max(0, invItem.quantity - deduction)
                                          });
                                      }
                                  }
                              }
                          }
                      }
                  }
                  dispatch({ type: 'PLACE_ORDER', payload: orderData });
                  break;
              case 'UPDATE_ORDER_STATUS':
                  await FirestoreService.updateOrderStatus(action.payload.orderId, action.payload.status, action.payload.estimatedTime);
                  break;
              case 'SAVE_INVENTORY_ITEM':
                  await FirestoreService.addOrUpdateInventoryItem(action.payload);
                  break;
              case 'DELETE_INVENTORY_ITEM':
                  await FirestoreService.deleteInventoryItem(action.payload);
                  break;
              case 'SAVE_OFFER':
                  await FirestoreService.saveOffer(action.payload);
                  break;
              case 'DELETE_OFFER':
                  await FirestoreService.deleteOffer(action.payload);
                  break;
              case 'SAVE_RECIPE':
                  await FirestoreService.saveRecipe(action.payload);
                  break;
              case 'DELETE_RECIPE':
                  await FirestoreService.deleteRecipe(action.payload);
                  break;
              case 'ADD_GALLERY_IMAGE':
                  await FirestoreService.addGalleryImage(action.payload);
                  break;
              case 'DELETE_GALLERY_IMAGE':
                  await FirestoreService.deleteGalleryImage(action.payload);
                  break;
              case 'TOGGLE_GALLERY_LIKE': {
                  const { imageId, userId } = action.payload;
                  const image = stateRef.current.gallery.find(img => img.id === imageId);
                  const user = stateRef.current.users.find(u => u.id === userId);
                  if (image && user) {
                      const isLiked = user.likedImages?.includes(imageId) ?? false;
                      await FirestoreService.toggleGalleryLike(imageId, userId, isLiked, image.likes);
                      const updatedLikedList = isLiked 
                        ? (user.likedImages || []).filter(id => id !== imageId)
                        : [...(user.likedImages || []), imageId];
                      await FirestoreService.addOrUpdateUser({ ...user, likedImages: updatedLikedList });
                  }
                  break;
              }
              case 'UPDATE_USER_PROFILE': {
                  const currentUser = stateRef.current.currentUser;
                  if (currentUser) {
                      await FirestoreService.addOrUpdateUser({ ...currentUser, ...action.payload.data });
                  }
                  dispatch({ type: 'UPDATE_USER_PROFILE', payload: action.payload });
                  break;
              }
              case 'UPDATE_USER_PASSWORD': {
                  const currentUser = stateRef.current.currentUser;
                  if (currentUser) {
                      await FirestoreService.addOrUpdateUser({ ...currentUser, password: action.payload.newPassword });
                  }
                  dispatch({ type: 'UPDATE_USER_PASSWORD', payload: action.payload });
                  break;
              }
              case 'MARK_BIRTHDAY_NOTIFIED': {
                  const user = stateRef.current.users.find(u => u.id === action.payload.userId);
                  if (user) {
                      await FirestoreService.addOrUpdateUser({ ...user, lastBirthdayNotifiedYear: action.payload.year });
                  }
                  dispatch(action); // Actualizar estado local también
                  break;
              }
              case 'SAVE_SETTINGS':
                  await FirestoreService.saveSettings(action.payload);
                  break;
              default:
                  // Para acciones síncronas o locales
                  dispatch(action);
          }
      } catch (error) {
          console.error("Error en operación asíncrona:", error);
          dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'Error de conexión. Intenta de nuevo.', type: 'error' } });
      }
  };

  return (
    <AppContext.Provider value={{ state, dispatch: asyncDispatch }}>
      {children}
    </AppContext.Provider>
  );
};
