/*
 * Este componente está obsoleto y ya no se utiliza.
 * El acceso de administrador ahora se gestiona a través de la pantalla de inicio de sesión principal (ClientLogin.tsx)
 * basado en los roles de usuario almacenados en Firestore. El primer usuario en registrarse
 * se convierte automáticamente en el administrador. Este archivo se puede eliminar de forma segura.
 */
import React from 'react';

const AdminLogin: React.FC = () => {
    return null; // No renderiza nada
};

export default AdminLogin;
