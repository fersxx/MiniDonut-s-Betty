// FIX: Alias firebase auth imports to prevent circular dependency/module resolution errors.
import {
    createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
    signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updatePassword as firebaseUpdatePassword,
    EmailAuthProvider as firebaseEmailAuthProvider,
    reauthenticateWithCredential as firebaseReauthenticateWithCredential,
} from 'firebase/auth';
import { collection, getDocs } from '@firebase/firestore';
import { auth, db } from './config';
import { addOrUpdateUser, getUserById } from './firestore';
import { User } from '../types';

export const registerWithEmailAndPassword = async (formData: any): Promise<User> => {
    const { email, password, name, birthday, phone, address } = formData;
    
    // Verificar si es el primer usuario para asignarle el rol de admin
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const isFirstUser = usersSnapshot.empty;

    // 1. Crear usuario en Firebase Auth
    const userCredential = await firebaseCreateUserWithEmailAndPassword(auth, email, password);
    const authUser = userCredential.user;

    // 2. Preparar el documento de usuario para Firestore
    const newUser: User = {
        id: authUser.uid, // Usar el UID de Firebase Auth como ID del documento
        name,
        email,
        birthday,
        phone,
        address,
        role: isFirstUser ? 'admin' : 'client',
        likedImages: [],
    };
    
    // 3. Guardar el perfil del usuario en Firestore (sin la contraseña)
    await addOrUpdateUser(newUser); 
    
    return newUser;
};

export const loginWithEmailAndPassword = async (email, password): Promise<User> => {
    // 1. Iniciar sesión con Firebase Auth
    const userCredential = await firebaseSignInWithEmailAndPassword(auth, email, password);
    const authUser = userCredential.user;

    // 2. Obtener el perfil del usuario desde Firestore
    const userProfile = await getUserById(authUser.uid);
    
    if (!userProfile) {
        throw new Error("No se encontró el perfil de usuario en la base de datos.");
    }
    
    return userProfile;
};

export const logout = (): Promise<void> => {
    return firebaseSignOut(auth);
};

export const updateUserPassword = async (currentPassword, newPassword): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
        throw new Error("Ningún usuario ha iniciado sesión.");
    }
    
    // 1. Crear credencial para re-autenticación
    const credential = firebaseEmailAuthProvider.credential(user.email, currentPassword);
    
    // 2. Re-autenticar al usuario para confirmar su identidad
    await firebaseReauthenticateWithCredential(user, credential);
    
    // 3. Si la re-autenticación es exitosa, actualizar la contraseña
    await firebaseUpdatePassword(user, newPassword);
};
