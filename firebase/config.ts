
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from '@firebase/firestore';

// ⚠️ IMPORTANTE: Reemplaza estos valores con las credenciales de tu proyecto de Firebase.
// Si dejas estos valores de ejemplo, la aplicación intentará conectarse infinitamente y parecerá bloqueada.
const firebaseConfig = {
  apiKey: "API_KEY_AQUI",
  authDomain: "PROYECTO_ID.firebaseapp.com",
  projectId: "PROYECTO_ID",
  storageBucket: "PROYECTO_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
