import { User, InventoryItem, Order, Offer, ProductRecipe, GalleryImage, AppSettings } from "../types";

// --- Simulación de Firestore con localStorage ---

const getCollection = <T>(name: string, seedDataId?: string): T[] => {
    try {
        const storedData = localStorage.getItem(`db_${name}`);
        if (storedData) {
            return JSON.parse(storedData).map((item: any) => {
                // Convertir strings de fecha a objetos Date
                if (item.orderDate) item.orderDate = new Date(item.orderDate);
                if (item.birthday) {
                    const parts = item.birthday.split('-');
                    if (parts.length === 3) {
                       // Mantener la fecha como string para evitar problemas de zona horaria en la lógica de cumpleaños
                    }
                }
                return item;
            });
        }
        // Si no hay datos, cargar desde el script en index.html si existe
        if (seedDataId) {
            const seedScript = document.getElementById(seedDataId);
            if (seedScript) {
                const seed = JSON.parse(seedScript.textContent || '[]');
                localStorage.setItem(`db_${name}`, JSON.stringify(seed));
                return seed;
            }
        }
        return [];
    } catch (error) {
        console.error(`Error al obtener la colección ${name}:`, error);
        return [];
    }
};

const saveCollection = <T>(name: string, data: T[]) => {
    localStorage.setItem(`db_${name}`, JSON.stringify(data));
};

const listeners: { [key: string]: Function[] } = {};

const notifyListeners = (collectionName: string) => {
    if (listeners[collectionName]) {
        const data = getCollection(collectionName);
        listeners[collectionName].forEach(callback => callback(data));
    }
};

// --- Listeners en tiempo real (simulados) ---

export const listenToCollection = <T extends { id: string }>(
    collectionName: string,
    callback: (data: T[]) => void,
    seedDataId?: string
): (() => void) => {
    if (!listeners[collectionName]) {
        listeners[collectionName] = [];
    }
    listeners[collectionName].push(callback);

    // Enviar datos iniciales
    setTimeout(() => callback(getCollection<T>(collectionName, seedDataId)), 0);

    // Función para desuscribirse
    return () => {
        listeners[collectionName] = listeners[collectionName].filter(cb => cb !== callback);
    };
};


export const listenToSettings = (callback: (data: AppSettings) => void): (() => void) => {
    const SETTINGS_KEY = 'db_appData_settings';
    const defaultSettings: AppSettings = {
        adminPhoneNumber: "5216361317125",
        adminCardNumber: "1234-5678-9012-3456",
        birthdayOffer: { description: "¡Postre gratis en tu día!" },
        deliveryFee: 25
    };

    const getSettings = (): AppSettings => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            return stored ? JSON.parse(stored) : defaultSettings;
        } catch {
            return defaultSettings;
        }
    };

    const settingsCallback = () => callback(getSettings());
    
    if (!listeners.settings) listeners.settings = [];
    listeners.settings.push(settingsCallback);
    
    setTimeout(() => callback(getSettings()), 0); // Enviar datos iniciales

    return () => {
         listeners.settings = listeners.settings.filter(cb => cb !== settingsCallback);
    };
};


// --- Operaciones CRUD (simuladas) ---

export const addOrUpdateUser = async (user: User) => {
    let users = getCollection<User>('users');
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
        users[index] = { ...users[index], ...user };
    } else {
        users.push({ ...user, id: user.id || `user-${Date.now()}` });
    }
    saveCollection('users', users);
    notifyListeners('users');
};

export const addOrUpdateInventoryItem = async (item: InventoryItem) => {
    let inventory = getCollection<InventoryItem>('inventory', 'inventory-seed-data');
    if (item.id) {
        const index = inventory.findIndex(i => i.id === item.id);
        if (index > -1) inventory[index] = item;
    } else {
        inventory.push({ ...item, id: `inv-${Date.now()}` });
    }
    saveCollection('inventory', inventory);
    notifyListeners('inventory');
};

export const deleteInventoryItem = async (id: string) => {
    let inventory = getCollection<InventoryItem>('inventory', 'inventory-seed-data');
    inventory = inventory.filter(i => i.id !== id);
    saveCollection('inventory', inventory);
    notifyListeners('inventory');
};

export const createOrder = async (order: Order) => {
    const orders = getCollection<Order>('orders');
    orders.push({ ...order, id: `ord-${Date.now()}` });
    saveCollection('orders', orders);
    notifyListeners('orders');
};

export const updateOrderStatus = async (orderId: string, status: Order['status'], estimatedTime?: string) => {
    let orders = getCollection<Order>('orders');
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
        orders[index].status = status;
        if (estimatedTime !== undefined) {
             orders[index].estimatedTime = estimatedTime;
        }
    }
    saveCollection('orders', orders);
    notifyListeners('orders');
};

export const saveOffer = async (offer: Offer) => {
    let offers = getCollection<Offer>('offers', 'offers-seed-data');
    if (offer.id) {
        const index = offers.findIndex(o => o.id === offer.id);
        if (index > -1) offers[index] = offer;
    } else {
        offers.push({ ...offer, id: `off-${Date.now()}` });
    }
    saveCollection('offers', offers);
    notifyListeners('offers');
};

export const deleteOffer = async (id: string) => {
    let offers = getCollection<Offer>('offers', 'offers-seed-data').filter(o => o.id !== id);
    saveCollection('offers', offers);
    notifyListeners('offers');
};

export const saveRecipe = async (recipe: ProductRecipe) => {
    let recipes = getCollection<ProductRecipe>('productRecipes', 'recipes-seed-data');
    if (recipe.id) {
        const index = recipes.findIndex(r => r.id === recipe.id);
        if (index > -1) recipes[index] = recipe;
    } else {
        recipes.push({ ...recipe, id: `rec-${Date.now()}` });
    }
    saveCollection('productRecipes', recipes);
    notifyListeners('productRecipes');
};

export const deleteRecipe = async (id: string) => {
    let recipes = getCollection<ProductRecipe>('productRecipes', 'recipes-seed-data').filter(r => r.id !== id);
    saveCollection('productRecipes', recipes);
    notifyListeners('productRecipes');
};

export const addGalleryImage = async (image: Omit<GalleryImage, 'id' | 'likes'>) => {
    const gallery = getCollection<GalleryImage>('gallery', 'gallery-seed-data');
    gallery.push({ ...image, id: `gal-${Date.now()}`, likes: 0 });
    saveCollection('gallery', gallery);
    notifyListeners('gallery');
};

export const deleteGalleryImage = async (id: string) => {
    let gallery = getCollection<GalleryImage>('gallery', 'gallery-seed-data').filter(i => i.id !== id);
    saveCollection('gallery', gallery);
    notifyListeners('gallery');
};

export const toggleGalleryLike = async (imageId: string, userId: string, isLiked: boolean, currentLikes: number) => {
    let gallery = getCollection<GalleryImage>('gallery', 'gallery-seed-data');
    const imgIndex = gallery.findIndex(i => i.id === imageId);
    if (imgIndex > -1) {
        gallery[imgIndex].likes = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
        saveCollection('gallery', gallery);
        notifyListeners('gallery');
    }
};

export const saveSettings = async (settings: AppSettings) => {
    localStorage.setItem('db_appData_settings', JSON.stringify(settings));
    if(listeners.settings) {
        listeners.settings.forEach(cb => cb(settings));
    }
};
