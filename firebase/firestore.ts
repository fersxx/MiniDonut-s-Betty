import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    onSnapshot,
    Timestamp,
    getDoc,
    updateDoc,
    runTransaction,
} from '@firebase/firestore';
import { db } from './config';
import { User, InventoryItem, Order, Offer, ProductRecipe, GalleryImage, AppSettings } from "../types";

// --- Helper para convertir Timestamps ---
const convertTimestamps = (data: any) => {
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        }
    }
    return data;
};

// --- Listeners en tiempo real ---

export const listenToCollection = <T extends { id: string }>(
    collectionName: string,
    callback: (data: T[]) => void
): (() => void) => {
    const q = collection(db, collectionName);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data: T[] = [];
        querySnapshot.forEach((doc) => {
            const docData = convertTimestamps(doc.data());
            data.push({ id: doc.id, ...docData } as T);
        });
        callback(data);
    }, (error) => {
        console.error(`Error escuchando la colección ${collectionName}:`, error);
    });

    return unsubscribe;
};

export const listenToSettings = (callback: (data: AppSettings) => void): (() => void) => {
    const settingsDocRef = doc(db, 'appData', 'settings');
    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as AppSettings);
        } else {
            console.warn("Documento de ajustes no encontrado, usando valores por defecto.");
            const defaultSettings: AppSettings = {
                adminPhoneNumber: "TU_NUMERO_AQUI",
                adminCardNumber: "TU_TARJETA_AQUI",
                birthdayOffer: { description: "¡Postre gratis!" },
                deliveryFee: 25
            };
            callback(defaultSettings);
        }
    });
    return unsubscribe;
};

// --- Operaciones CRUD ---

export const getUserById = async (userId: string): Promise<User | null> => {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as User;
    } else {
        return null;
    }
};

export const addOrUpdateUser = async (user: User) => {
    const userRef = doc(db, 'users', user.id);
    const { password, ...userData } = user; // Excluye el password por seguridad
    await setDoc(userRef, userData, { merge: true });
};

export const addOrUpdateInventoryItem = async (item: InventoryItem) => {
    let docRef;
    if (item.id) {
        docRef = doc(db, 'inventory', item.id);
    } else {
        docRef = doc(collection(db, 'inventory'));
        item.id = docRef.id;
    }
    await setDoc(docRef, item, { merge: true });
};

export const deleteInventoryItem = async (id: string) => {
    const docRef = doc(db, 'inventory', id);
    await deleteDoc(docRef);
};

export const createOrder = async (order: Order) => {
    const docRef = doc(collection(db, 'orders'));
    await setDoc(docRef, { ...order, id: docRef.id });
};

export const updateOrderStatus = async (orderId: string, status: Order['status'], estimatedTime?: string) => {
    const docRef = doc(db, 'orders', orderId);
    const updateData: { status: Order['status'], estimatedTime?: string } = { status };
    if (estimatedTime !== undefined) {
        updateData.estimatedTime = estimatedTime;
    }
    await updateDoc(docRef, updateData);
};


export const saveOffer = async (offer: Offer) => {
    let docRef;
    if (offer.id) {
        docRef = doc(db, 'offers', offer.id);
    } else {
        docRef = doc(collection(db, 'offers'));
        offer.id = docRef.id;
    }
    await setDoc(docRef, offer, { merge: true });
};

export const deleteOffer = async (id: string) => {
    const docRef = doc(db, 'offers', id);
    await deleteDoc(docRef);
};

export const saveRecipe = async (recipe: ProductRecipe) => {
     let docRef;
    if (recipe.id) {
        docRef = doc(db, 'productRecipes', recipe.id);
    } else {
        docRef = doc(collection(db, 'productRecipes'));
        recipe.id = docRef.id;
    }
    await setDoc(docRef, recipe, { merge: true });
};

export const deleteRecipe = async (id: string) => {
    const docRef = doc(db, 'productRecipes', id);
    await deleteDoc(docRef);
};

export const addGalleryImage = async (image: Omit<GalleryImage, 'id' | 'likes'>) => {
    const docRef = doc(collection(db, 'gallery'));
    const newImage: GalleryImage = { ...image, id: docRef.id, likes: 0 };
    await setDoc(docRef, newImage);
};

export const deleteGalleryImage = async (id: string) => {
    const docRef = doc(db, 'gallery', id);
    await deleteDoc(docRef);
};

export const toggleGalleryLike = async (imageId: string, userId: string, isLiked: boolean, currentLikes: number) => {
    const imageRef = doc(db, 'gallery', imageId);
    await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw "El documento del usuario no existe.";
        
        const likedImages = userDoc.data().likedImages || [];
        const newLikesCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
        const newLikedImages = isLiked 
            ? likedImages.filter((id: string) => id !== imageId)
            : [...likedImages, imageId];
        
        transaction.update(imageRef, { likes: newLikesCount });
        transaction.update(userRef, { likedImages: newLikedImages });
    });
};

export const saveSettings = async (settings: AppSettings) => {
    const docRef = doc(db, 'appData', 'settings');
    await setDoc(docRef, settings, { merge: true });
};
