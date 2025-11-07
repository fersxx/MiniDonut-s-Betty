// Simulación de configuración de Firebase para permitir el funcionamiento sin credenciales reales.
// Esto evita que la aplicación se bloquee al intentar conectar a una base de datos inexistente.
// La lógica de persistencia se manejará localmente en firestore.ts.

const app = {};
const auth = {};
const db = {};

export { app, auth, db };
