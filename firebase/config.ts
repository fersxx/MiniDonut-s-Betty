// Importa las funciones que necesitas de los SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// FIX: Use modular firestore import to match other firebase imports
import { getFirestore } from "firebase/firestore";

// La configuración de tu app web de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1KT1IcTm0WTNg3Xebb2g12-2gQtML398",
  authDomain: "minidonuts-betty-edb1d.firebaseapp.com",
  projectId: "minidonuts-betty-edb1d",
  storageBucket: "minidonuts-betty-edb1d.firebasestorage.app",
  messagingSenderId: "998688887165",
  appId: "1:998688887165:web:dd05a026b8b5335b5ebc14",
  measurementId: "G-LCYWNS42L5"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
