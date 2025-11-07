
import { db } from './config';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, addDoc, Timestamp } from '@firebase/firestore';
import { User, InventoryItem, Order, Offer, ProductRecipe, GalleryImage, AppSettings } from "../types";

// --- Listeners en tiempo real ---

export const listenToCollection = <T extends { id: string }>(
    collectionName: string, 
    callback: (data: T[]) => void
) => {
    const q = query(collection(db, collectionName));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => {
            const docData = doc.data();
            // Convertir timestamps de Firestore a fechas JS si es necesario
            Object.keys(docData).forEach(key => {
                if (docData[key] instanceof Timestamp) {
                    docData[key] = (docData[key] as Timestamp).toDate();
                }
            });
            return { ...docData, id: doc.id } as unknown as T;
        });
        callback(data);
    });
};

export const listenToSettings = (callback: (data: AppSettings) => void) => {
    const docRef = doc(db, 'appData', 'settings');
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as AppSettings);
        } else {
            // Valores por defecto si el documento no existe
             const defaultSettings: AppSettings = {
                adminPhoneNumber: "5216361317125",
                adminCardNumber: "1234-5678-9012-3456",
                birthdayOffer: { description: "¡Postre gratis en tu día!" },
                deliveryFee: 25
            };
            // Crear el documento con valores por defecto
            setDoc(docRef, defaultSettings);
            callback(defaultSettings);
        }
    });
};

// --- Operaciones CRUD ---

export const addOrUpdateUser = async (user: User) => {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
};

export const addOrUpdateInventoryItem = async (item: InventoryItem) => {
    if (item.id) {
        await setDoc(doc(db, 'inventory', item.id), item, { merge: true });
    } else {
        // Si no hay ID, dejamos que Firestore genere uno
        const { id, ...newItemData } = item;
        await addDoc(collection(db, 'inventory'), newItemData);
    }
};

export const deleteInventoryItem = async (id: string) => {
    await deleteDoc(doc(db, 'inventory', id));
};

export const createOrder = async (order: Order) => {
    // Usar el ID proporcionado si existe, o crear uno nuevo
    const orderId = order.id || `ord-${Date.now()}`;
    const orderData = { 
        ...order,
        id: orderId,
        // Asegurarse de que la fecha sea un objeto Date válido para Firestore
        orderDate: order.orderDate instanceof Date ? order.orderDate : new Date()
    };
    await setDoc(doc(db, 'orders', orderId), orderData);
};

export const updateOrderStatus = async (orderId: string, status: Order['status'], estimatedTime?: string) => {
    const updateData: any = { status };
    if (estimatedTime) {
        updateData.estimatedTime = estimatedTime;
    }
    await updateDoc(doc(db, 'orders', orderId), updateData);
};

export const saveOffer = async (offer: Offer) => {
    const id = offer.id || `off-${Date.now()}`;
    await setDoc(doc(db, 'offers', id), { ...offer, id }, { merge: true });
};

export const deleteOffer = async (id: string) => {
    await deleteDoc(doc(db, 'offers', id));
};

export const saveRecipe = async (recipe: ProductRecipe) => {
    const id = recipe.id || `rec-${Date.now()}`;
    await setDoc(doc(db, 'productRecipes', id), { ...recipe, id }, { merge: true });
};

export const deleteRecipe = async (id: string) => {
    await deleteDoc(doc(db, 'productRecipes', id));
};

export const addGalleryImage = async (image: Omit<GalleryImage, 'id' | 'likes'>) => {
    await addDoc(collection(db, 'gallery'), {
        ...image,
        likes: 0
    });
};

export const deleteGalleryImage = async (id: string) => {
    await deleteDoc(doc(db, 'gallery', id));
};

export const toggleGalleryLike = async (imageId: string, userId: string, isLiked: boolean, currentLikes: number) => {
    const newLikes = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
    await updateDoc(doc(db, 'gallery', imageId), { likes: newLikes });
};

export const saveSettings = async (settings: AppSettings) => {
    await setDoc(doc(db, 'appData', 'settings'), settings, { merge: true });
};
